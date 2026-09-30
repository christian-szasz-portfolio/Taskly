import type { Routes } from '@angular/router';
import { noActiveProjectGuard } from './core/guards/active-project.guard';
import { trialExpiredGuard } from './core/guards/trial-expired.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'home'
	},
	{
		path: 'trial-expired',
		loadComponent: () => import('./features/demo/trial-expired/trial-expired.component').then((m) => m.TrialExpiredComponent),
		data: {
			title: 'Demo Expired'
		}
	},
	{
		path: 'home',
		loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
		canActivate: [trialExpiredGuard],
		data: {
			title: 'Home'
		}
	},
	{
		path: 'no-active-project',
		loadComponent: () => import('./features/tasks/no-active-project/no-active-project.component').then((m) => m.NoActiveProjectComponent),
		canActivate: [trialExpiredGuard, noActiveProjectGuard],
		data: {
			title: 'No Active Project'
		}
	},
	{
		path: 'tasks',
		loadChildren: () => import('./features/tasks/task.routes').then((m) => m.TASK_ROUTES),
		canActivate: [trialExpiredGuard],
		data: {
			title: 'Dashboard'
		}
	},
	{
		path: 'time-tracking',
		loadChildren: () => import('./features/time-tracking/time-tracking.routes').then((m) => m.TIME_TRACKING_ROUTES),
		canActivate: [trialExpiredGuard],
		data: {
			title: 'Temporal'
		}
	},
	{
		path: 'maintenance',
		loadChildren: () => import('./features/maintenance/maintenance.routes').then((m) => m.MAINTENANCE_ROUTES),
		canActivate: [trialExpiredGuard],
		data: {
			title: 'Maintenance'
		}
	},
	{
		path: '**',
		redirectTo: 'home'
	}
];
