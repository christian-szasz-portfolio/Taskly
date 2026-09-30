import { CommonModule } from '@angular/common';
import { Component, computed, input, output, viewChildren, effect, signal, afterNextRender, runInInjectionContext, inject, DestroyRef } from '@angular/core';
import { Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, animationFrameScheduler, Subject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '../../../../core/icons/icon-registry';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import { IssueStatus } from '../../../../core/models/task.enums';
import type { IssueStatus as IssueStatusType } from '../../../../core/models/task.enums';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import type { KanbanColumnView } from '../../models/task-board.models';
import { TaskColumnComponent } from '../task-column/task-column.component';
import { TaskNavigationService } from '../../../../core/services/task/task-navigation.service';

type BoardItem = TaskItem | Subtask;

interface DropPayload {
  event: CdkDragDrop<BoardItem[]>;
  status: IssueStatusType;
}

interface CardSelectionPayload {
  task: BoardItem;
  event: Event;
}

@Component({
  selector: 'app-kanban-parent-row',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MatTooltipModule, RouterLink, TaskColumnComponent],
  templateUrl: './kanban-parent-row.component.html',
  styleUrl: './kanban-parent-row.component.scss'
})
export class KanbanParentRowComponent {
  private readonly taskNav = inject(TaskNavigationService);

  public readonly parent = input.required<TaskItem>();
  public readonly subtasks = input.required<Subtask[]>();
  public readonly isExpanded = input.required<boolean>();
  public readonly columns = input.required<KanbanColumnView[]>();
  public readonly helpers = input.required<TaskCardHelpers>();
  public readonly addCardIcon = input.required<IconDefinition>();
  public readonly chevronDown = input.required<IconDefinition>();
  public readonly chevronRight = input.required<IconDefinition>();
  public readonly viewIcon = input.required<IconDefinition>();
  public readonly externalLinkIcon = input.required<IconDefinition>();
  public readonly resolveIcon = input.required<IconDefinition>();
  /** Whether the user can write/modify items (license-based access control) */
  public readonly canWrite = input(true);

  public readonly toggleExpansion = output<string>();
  public readonly itemDropped = output<DropPayload>();
  public readonly itemSelected = output<CardSelectionPayload>();
  public readonly parentSelected = output<CardSelectionPayload>();
  public readonly resolveParent = output<TaskItem>();

  public readonly subtaskCount = computed(() => this.subtasks().length);
  public readonly parentKey = computed(() => this.parent().issueKey ?? this.parent().id);
  public readonly parentDetailRoute = computed(() => this.taskNav.getDetailRoute(this.parentKey()) ?? ['/no-active-project']);
  public readonly allSubtasksDone = computed(() => {
    const subtasks = this.subtasks();
    return subtasks.length > 0 && subtasks.every(s => s.status === IssueStatus.Done);
  });
  public readonly resolveTooltip = computed(() =>
    this.canWrite() ? 'Mark as resolved' : 'Read-only mode: cannot resolve items'
  );

  // Column height management
  private readonly columnComponents = viewChildren(TaskColumnComponent);
  public readonly rowColumnHeight = signal<number | null>(null);
  public readonly isResizing = signal<boolean>(false);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly measurement$ = new Subject<void>();
  private hasMeasured = false;

  constructor() {
    // Setup RxJS pipeline for debounced measurements
    this.measurement$.pipe(
      switchMap(() => timer(50)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.measureColumnHeight());

    afterNextRender(() => {
      runInInjectionContext(this.injector, () => {
        effect(() => {
          // Trigger when columns or expansion state changes
          this.columns();
          const expanded = this.isExpanded();

          // Only measure when expanded and either first time or columns changed
          if (expanded) {
            this.scheduleMeasurement();
          } else {
            // Clear state when collapsed
            this.rowColumnHeight.set(null);
            this.isResizing.set(false);
            this.hasMeasured = false;
          }
        });
      });
    });
  }

  private scheduleMeasurement(): void {
    // Only show loading spinner on first measurement
    if (!this.hasMeasured) {
      this.isResizing.set(true);
    }

    // Emit to trigger debounced measurement via RxJS switchMap
    this.measurement$.next();
  }

  private measureColumnHeight(): void {
    // Use animationFrameScheduler for optimal timing
    timer(0, animationFrameScheduler).pipe(take(1)).subscribe(() => {
      const components = this.columnComponents();
      if (components.length === 0) {
        this.rowColumnHeight.set(null);
        this.isResizing.set(false);
        return;
      }

      let maxHeight = 0;
      components.forEach(component => {
        const el = component.elementRef.nativeElement;
        const columnEl = el.querySelector<HTMLElement>('.kanban-column');
        if (columnEl) {
          const height = columnEl.scrollHeight;
          if (height > maxHeight) {
            maxHeight = height;
          }
        }
      });

      this.rowColumnHeight.set(maxHeight > 0 ? maxHeight : null);
      this.hasMeasured = true;

      // Wait for next frame to ensure height is applied, then fade in
      timer(0, animationFrameScheduler).pipe(take(1)).subscribe(() => {
        this.isResizing.set(false);
      });
    });
  }

  public onToggleExpansion(): void {
    this.toggleExpansion.emit(this.parentKey());
  }

  public onCardDropped(payload: DropPayload): void {
    this.itemDropped.emit(payload);
  }

  public onCardSelected(payload: CardSelectionPayload): void {
    this.itemSelected.emit(payload);
  }

  public onOpenParentPanel(event: Event): void {
    event.stopPropagation();
    this.parentSelected.emit({ task: this.parent(), event });
  }

  public onResolveParent(event: Event): void {
    event.stopPropagation();
    this.resolveParent.emit(this.parent());
  }
}
