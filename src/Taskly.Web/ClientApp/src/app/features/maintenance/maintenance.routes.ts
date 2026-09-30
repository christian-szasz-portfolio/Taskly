import type { Routes } from '@angular/router';

export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'system-tasks',
    pathMatch: 'full'
  },
  {
    path: 'system-tasks',
    loadComponent: () =>
      import('./system-tasks-page/system-tasks-page.component').then((m) => m.SystemTasksPageComponent),
    data: {
      title: 'System Tasks'
    }
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./notifications-page/notifications-page.component').then((m) => m.NotificationsPageComponent),
    data: {
      title: 'Notifications'
    }
  }
];
