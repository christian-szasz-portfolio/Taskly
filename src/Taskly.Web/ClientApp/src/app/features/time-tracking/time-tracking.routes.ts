import type { Routes } from '@angular/router';

export const TIME_TRACKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./time-tracking-calendar/time-tracking-calendar.component').then((m) => m.TimeTrackingCalendarComponent),
    data: { title: 'Temporal' }
  }
];
