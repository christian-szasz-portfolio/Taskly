import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject } from '@angular/core';
import type { TaskItem } from '../../../core/models/task.interfaces';
import { IssueType } from '../../../core/models/task.enums';
import { TaskNavigationService } from '../../../core/services/task/task-navigation.service';
import { TaskStore } from '../../../core/state/task.store';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { TaskCatalogPageComponent, CatalogTheme } from '../components/task-catalog-page/task-catalog-page.component';
import { ExpandableCardComponent, CardTheme } from '../../../shared/components/expandable-card/expandable-card.component';
import { TaskCardDetailsComponent } from '../../../shared/components/task-card-details/task-card-details.component';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';

@Component({
  selector: 'app-task-epic-page',
  standalone: true,
  imports: [CommonModule, TaskCatalogPageComponent, ExpandableCardComponent, TaskCardDetailsComponent],
  templateUrl: './task-epic-page.component.html',
  styleUrl: './task-epic-page.component.scss'
})
export class TaskEpicPageComponent {
  private readonly store = inject(TaskStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly taskNav = inject(TaskNavigationService);

  public readonly vm = this.store.vm;
  public readonly boardRoute = this.taskNav.kanbanRoute;
  public readonly CatalogTheme = CatalogTheme;
  public readonly CardTheme = CardTheme;

  public readonly epicItems = computed(() => {
    const items = this.vm().todos.filter((item) => item.issueType === IssueType.Epic);
    return [...items].sort((left, right) => (left.issueKey ?? left.title).localeCompare(right.issueKey ?? right.title));
  });

  public readonly isEmpty = computed(() => this.epicItems().length === 0);

  public constructor() {
    this.store.load();
    EventBus.send(TITLE_EVENT_NAME, 'Epic Catalog');
  }

  public refresh(): void {
    this.store.load();
  }

  public openEpic(item: TaskItem): void {
    if (!this.isBrowser) {
      return;
    }

    const route = this.taskNav.getDetailRoute(item.issueKey ?? item.id);
    if (route) {
      const url = route.join('/');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /** Determines if an epic has details worth expanding */
  public hasEpicDetails(item: TaskItem): boolean {
    const hasDescription = item.description != null && item.description.length > 0;
    const hasAssignee = item.assignedTo != null && item.assignedTo.length > 0;
    const hasDueDate = item.dueAtUtc != null;
    return hasDescription || hasAssignee || hasDueDate;
  }
}
