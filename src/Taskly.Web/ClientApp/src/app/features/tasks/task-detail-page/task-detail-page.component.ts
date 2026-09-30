import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';
import { Icons } from '../../../core/icons/icon-registry';
import { IssueType } from '../../../core/models/task.enums';
import type { TaskItem } from '../../../core/models/task.interfaces';
import { TaskApiService } from '../../../core/services/task/task-api.service';
import { TaskStore } from '../../../core/state/task.store';
import { AuthStore } from '../../../core/state/auth.store';
import { TaskPresentationStore } from '../services/task-presentation.service';
import type { TaskCardHelpers } from '../models/task-card.helpers';
import type { UpdateTaskPayload } from '../../../core/models/task.types';
import { TaskEditorFormComponent } from '../task-editor-form/task-editor-form.component';
import { TaskSummaryCardsComponent } from '../components/task-summary-cards/task-summary-cards.component';
import { TaskDetailSectionsComponent } from '../components/task-detail-sections/task-detail-sections.component';
import {
  CommentSectionComponent,
  CommentTarget,
} from '../components/comment-section/comment-section.component';
import { PLATFORM_ID } from '@angular/core';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { TaskNavigationService } from '../../../core/services/task/task-navigation.service';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    FontAwesomeModule,
    TaskEditorFormComponent,
    TaskSummaryCardsComponent,
    TaskDetailSectionsComponent,
    CommentSectionComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './task-detail-page.component.html',
  styleUrl: './task-detail-page.component.scss',
})
export class TaskDetailPageComponent {
  private static readonly SUBTASK_ALLOWED_TYPES: readonly IssueType[] = [
    IssueType.Task,
    IssueType.Story,
    IssueType.Bug,
  ];

  private readonly api = inject(TaskApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly presentation = inject(TaskPresentationStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskStore = inject(TaskStore);
  private readonly taskNav = inject(TaskNavigationService);
  private readonly authStore = inject(AuthStore);
  private hasRequestedEpicCatalog = false;

  private readonly taskReference = signal<string | null>(null);
  private readonly iconRegistry = this.presentation.icons;

  public readonly helpers: TaskCardHelpers = this.presentation.cardHelpers;
  public readonly issueType = IssueType;
  public readonly commentTarget = CommentTarget;
  public readonly actionIcons = computed(() => this.iconRegistry().actions);
  public readonly sectionIcons = computed(() => this.iconRegistry().sections);
  public readonly task = signal<TaskItem | null>(null);
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);
  public readonly saving = signal(false);
  public readonly mode = signal<'view' | 'edit'>('view');
  public readonly linkIcon = Icons.externalLink;
  public readonly subtaskIcon = Icons.sitemap;

  public readonly isEditMode = computed(() => this.mode() === 'edit');
  public readonly canWrite = computed(() => this.authStore.canWrite());
  public readonly canHaveSubtasks = computed(() => {
    const current = this.task();
    if (!current) {
      return false;
    }

    return TaskDetailPageComponent.SUBTASK_ALLOWED_TYPES.includes(current.issueType);
  });
  public readonly editTooltip = computed(() =>
    this.canWrite() ? 'Edit' : 'Read-only mode: cannot edit',
  );
  public readonly createSubtaskDisabledNote = 'The demo does not allow creating subtasks.';
  public readonly epicChildren = computed<TaskItem[]>(() => {
    const current = this.task();
    if (current?.issueType !== IssueType.Epic) {
      return [];
    }

    const epicKey = current.issueKey?.trim();
    if (!epicKey) {
      return [];
    }

    const normalized = epicKey.toLowerCase();
    const snapshot = this.taskStore.vm();
    return snapshot.todos
      .filter(
        (item) =>
          item.issueType !== IssueType.Epic &&
          (item.epicKey?.trim().toLowerCase() ?? '') === normalized,
      )
      .sort((left, right) => {
        const leftKey = left.issueKey ?? '';
        const rightKey = right.issueKey ?? '';
        if (leftKey && rightKey && leftKey !== rightKey) {
          return leftKey.localeCompare(rightKey);
        }

        if (leftKey || rightKey) {
          return leftKey ? -1 : 1;
        }

        return left.title.localeCompare(right.title);
      });
  });
  public readonly epicChildrenLoading = computed(() => {
    const current = this.task();
    if (current?.issueType !== IssueType.Epic) {
      return false;
    }

    const snapshot = this.taskStore.vm();
    return snapshot.loading && snapshot.todos.length === 0;
  });

  private readonly ensureEpicCatalogEffect = effect(() => {
    const current = this.task();
    if (current?.issueType !== IssueType.Epic) {
      return;
    }

    const snapshot = this.taskStore.vm();
    if (snapshot.loading || snapshot.todos.length > 0 || this.hasRequestedEpicCatalog) {
      return;
    }

    this.hasRequestedEpicCatalog = true;
    this.taskStore.load();
  });

  public constructor() {
    this.route.data
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((data) => this.extractRouteMode(data)),
        distinctUntilChanged(),
      )
      .subscribe((mode) => {
        // If user can't write and route is edit, force view mode
        if (mode === 'edit' && !this.authStore.canWrite()) {
          this.mode.set('view');
          void this.goToMode('view');
        } else {
          this.mode.set(mode === 'edit' ? 'edit' : 'view');
        }
        this.updatePageTitle();
      });

    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params) => params.get('issueKey') ?? params.get('id')),
        filter((id): id is string => Boolean(id)),
        distinctUntilChanged(),
      )
      .subscribe((reference) => {
        this.taskReference.set(reference);
        if (this.isBrowser) {
          this.fetchTask(reference);
        }
      });
  }

  public reload(): void {
    const reference = this.taskReference();
    if (reference && this.isBrowser) {
      this.fetchTask(reference);
    }
  }

  public async goToMode(mode: 'view' | 'edit'): Promise<void> {
    // Block navigation to edit mode if user can't write
    if (mode === 'edit' && !this.canWrite()) {
      return;
    }

    const current = this.task();
    const reference = current?.issueKey ?? this.taskReference();
    if (!reference) {
      return;
    }

    const commands =
      mode === 'edit'
        ? this.taskNav.getEditRoute(reference)
        : this.taskNav.getDetailRoute(reference);

    if (!commands) {
      return;
    }

    await this.router.navigate(commands);
  }

  public onEditSubmitted(payload: UpdateTaskPayload): void {
    const current = this.task();
    if (!current) {
      return;
    }

    this.saving.set(true);
    this.api
      .update(current.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (item) => {
          this.task.set(item);
          this.saving.set(false);
          void this.goToMode('view');
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.error.set(this.formatError(err, 'Unable to update task.'));
        },
      });
  }

  public onEditCancelled(): void {
    void this.goToMode('view');
  }

  public statusToken(item: TaskItem | null): string {
    return item ? this.presentation.statusToken(item.status) : '';
  }

  public resolutionToken(item: TaskItem | null): string {
    return item ? this.presentation.resolutionToken(item.resolution) : '';
  }

  public openChildTask(task: TaskItem): void {
    if (!this.isBrowser) {
      return;
    }

    const issueKey = task.issueKey ?? task.id;
    const routeSegments = this.taskNav.getDetailRoute(issueKey);
    if (!routeSegments) {
      return;
    }

    const url = routeSegments.join('/');
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private fetchTask(reference: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getByReference(reference)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (item) => {
          this.task.set(item);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(this.formatError(err, 'Unable to load task.'));
          this.loading.set(false);
        },
      });
  }

  private formatError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return err.message;
    }

    return fallback;
  }

  private extractRouteMode(data: Record<string, unknown>): 'view' | 'edit' | undefined {
    const mode = data['mode'];
    if (mode === 'view' || mode === 'edit') {
      return mode;
    }
    return undefined;
  }

  private updatePageTitle(): void {
    const suffix = this.mode() === 'edit' ? 'Edit Issue' : 'View Issue';
    EventBus.send(TITLE_EVENT_NAME, suffix);
  }
}
