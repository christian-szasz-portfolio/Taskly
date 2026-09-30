import type { Routes } from '@angular/router';
import { activeProjectGuard } from '../../core/guards/active-project.guard';

export const TASK_ROUTES: Routes = [
  {
    path: ':projectKey',
    loadComponent: () => import(/* webpackChunkName: "task-kanban-board" */'./task-kanban-board/task-kanban-board.component').then((m) => m.TaskKanbanBoardComponent),
    canActivate: [activeProjectGuard],
    data: { title: 'Kanban Board' }
  },
  {
    path: ':projectKey/epics',
    loadComponent: () => import(/* webpackChunkName: "task-epic-page" */'./task-epic-page/task-epic-page.component').then((m) => m.TaskEpicPageComponent),
    canActivate: [activeProjectGuard],
    data: { title: 'Epic Catalog' }
  },
  {
    path: ':projectKey/backlog',
    loadComponent: () => import(/* webpackChunkName: "task-backlog-page" */'./task-backlog-page/task-backlog-page.component').then((m) => m.TaskBacklogPageComponent),
    canActivate: [activeProjectGuard],
    data: { title: 'Backlog' }
  },
  {
    path: ':projectKey/resolved',
    loadComponent: () => import(/* webpackChunkName: "task-resolved-page" */'./task-resolved-page/task-resolved-page.component').then((m) => m.TaskResolvedPageComponent),
    canActivate: [activeProjectGuard],
    data: { title: 'Resolved Items' }
  },
  {
    path: ':projectKey/:issueKey',
    loadComponent: () => import(/* webpackChunkName: "task-detail-page-view" */'./task-detail-page/task-detail-page.component').then((m) => m.TaskDetailPageComponent),
    canActivate: [activeProjectGuard],
    data: { title: 'Task Detail', mode: 'view', reuseKey: 'task-detail' }
  },
  {
    path: ':projectKey/:issueKey/edit',
    loadComponent: () => import(/* webpackChunkName: "task-detail-page-edit" */'./task-detail-page/task-detail-page.component').then((m) => m.TaskDetailPageComponent),
    canActivate: [activeProjectGuard],
    data: { title: 'Edit Task', mode: 'edit', reuseKey: 'task-detail' }
  }
];
