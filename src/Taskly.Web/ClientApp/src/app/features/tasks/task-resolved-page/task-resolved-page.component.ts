import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject } from '@angular/core';
import { Icons } from '../../../core/icons/icon-registry';
import type { TaskItem } from '../../../core/models/task.interfaces';
import { IssueResolution, IssueStatus } from '../../../core/models/task.enums';
import { TaskNavigationService } from '../../../core/services/task/task-navigation.service';
import { TaskStore } from '../../../core/state/task.store';
import { AuthStore } from '../../../core/state/auth.store';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { TaskCatalogPageComponent, CatalogTheme } from '../components/task-catalog-page/task-catalog-page.component';
import { ExpandableCardComponent, type ExpandableCardAction, CardTheme } from '../../../shared/components/expandable-card/expandable-card.component';
import { TaskCardDetailsComponent } from '../../../shared/components/task-card-details/task-card-details.component';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';

@Component({
  selector: 'app-task-resolved-page',
  standalone: true,
  imports: [CommonModule, TaskCatalogPageComponent, ExpandableCardComponent, TaskCardDetailsComponent],
  templateUrl: './task-resolved-page.component.html',
  styleUrl: './task-resolved-page.component.scss'
})
export class TaskResolvedPageComponent {
  private readonly store = inject(TaskStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly taskNav = inject(TaskNavigationService);
  private readonly authStore = inject(AuthStore);

  public readonly vm = this.store.vm;
  public readonly boardRoute = this.taskNav.kanbanRoute;
  public readonly CatalogTheme = CatalogTheme;
  public readonly CardTheme = CardTheme;

  public readonly canWrite = computed(() => this.authStore.canWrite());

  public readonly reopenAction = computed<ExpandableCardAction>(() => ({
    icon: Icons.undo,
    label: 'Reopen on Board',
    tooltip: 'Change resolution to Fixed and show on board',
    accent: CardTheme.Amber,
    disabled: !this.canWrite(),
    disabledTooltip: 'Read-only mode: cannot reopen items'
  }));

  public readonly resolvedItems = computed(() => {
    const items = this.vm().todos.filter(
      (item) => item.status === IssueStatus.Done && item.resolution === IssueResolution.Closed
    );
    return [...items].sort((left, right) => {
      // Sort by completed date descending (most recent first)
      const leftDate = left.completedAtUtc ?? left.updatedAtUtc ?? left.createdAtUtc;
      const rightDate = right.completedAtUtc ?? right.updatedAtUtc ?? right.createdAtUtc;
      return rightDate.localeCompare(leftDate);
    });
  });

  public readonly isEmpty = computed(() => this.resolvedItems().length === 0);

  public constructor() {
    this.store.load();
    EventBus.send(TITLE_EVENT_NAME, 'Resolved Items');
  }

  public refresh(): void {
    this.store.load();
  }

  public openItem(item: TaskItem): void {
    if (!this.isBrowser) {
      return;
    }

    const route = this.taskNav.getDetailRoute(item.issueKey ?? item.id);
    if (route) {
      const url = route.join('/');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  public reopenOnBoard(item: TaskItem): void {
    // Change resolution back to Fixed so it appears on the board in Done column
    this.store.updateTask(item.id, { status: IssueStatus.Done, resolution: IssueResolution.Fixed });
  }

  /** Determines if a resolved item has details worth expanding */
  public hasItemDetails(item: TaskItem): boolean {
    const hasDescription = item.description != null && item.description.length > 0;
    const hasAssignee = item.assignedTo != null && item.assignedTo.length > 0;
    const hasDueDate = item.dueAtUtc != null;
    const hasLabels = item.labels.length > 0;
    const hasComponents = item.components.length > 0;
    return hasDescription || hasAssignee || hasDueDate || hasLabels || hasComponents;
  }
}
