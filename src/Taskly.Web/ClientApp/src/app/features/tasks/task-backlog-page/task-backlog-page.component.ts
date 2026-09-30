import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject } from '@angular/core';
import { Icons } from '../../../core/icons/icon-registry';
import type { TaskItem } from '../../../core/models/task.interfaces';
import { IssueStatus } from '../../../core/models/task.enums';
import { TaskNavigationService } from '../../../core/services/task/task-navigation.service';
import { TaskStore } from '../../../core/state/task.store';
import { AuthStore } from '../../../core/state/auth.store';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { TaskCatalogPageComponent, CatalogTheme } from '../components/task-catalog-page/task-catalog-page.component';
import { TaskCatalogCardComponent, type CatalogCardAction, CardTheme } from '../components/task-catalog-card/task-catalog-card.component';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';

@Component({
  selector: 'app-task-backlog-page',
  standalone: true,
  imports: [CommonModule, TaskCatalogPageComponent, TaskCatalogCardComponent],
  templateUrl: './task-backlog-page.component.html',
  styleUrl: './task-backlog-page.component.scss'
})
export class TaskBacklogPageComponent {
  private readonly store = inject(TaskStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly taskNav = inject(TaskNavigationService);
  private readonly authStore = inject(AuthStore);

  public readonly vm = this.store.vm;
  public readonly boardRoute = this.taskNav.kanbanRoute;
  public readonly CatalogTheme = CatalogTheme;

  public readonly canWrite = computed(() => this.authStore.canWrite());

  public readonly moveToOpenAction = computed<CatalogCardAction>(() => ({
    icon: Icons.play,
    label: 'Move to Open',
    tooltip: 'Move to Open',
    accent: CardTheme.Emerald,
    disabled: !this.canWrite(),
    disabledTooltip: 'Read-only mode: cannot move items'
  }));

  public readonly backlogItems = computed(() => {
    const items = this.vm().todos.filter((item) => item.status === IssueStatus.Created);
    return [...items].sort((left, right) => (left.issueKey ?? left.title).localeCompare(right.issueKey ?? right.title));
  });

  public readonly isEmpty = computed(() => this.backlogItems().length === 0);

  public constructor() {
    this.store.load();
    EventBus.send(TITLE_EVENT_NAME, 'Backlog');
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

  public moveToOpen(item: TaskItem): void {
    this.store.updateTask(item.id, { status: IssueStatus.Open });
  }
}
