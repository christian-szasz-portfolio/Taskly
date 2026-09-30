import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import { AccountMenuAction, type AccountMenuItem, type PrimaryNavLink } from '../../../core/models/navigation.models';
import { TaskNavigationService } from '../../../core/services/task/task-navigation.service';
import { BrowserPreferencesService } from '../../../core/services/preferences/browser-preferences.service';
import { AuthStore } from '../../../core/state/auth.store';
import { NotificationStore } from '../../../core/state/notification.store';
import { NotificationType } from '../../../core/models/notification.interfaces';
import { AppPrimaryNavComponent } from '../app-primary-nav/app-primary-nav.component';
import { AppAccountMenuComponent } from '../app-account-menu/app-account-menu.component';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { PreferencesDialogComponent } from '../preferences-dialog/preferences-dialog.component';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatBadgeModule,
		MatMenuModule,
		MatDividerModule,
		MatSlideToggleModule,
		MatTooltipModule,
		MatDialogModule,
		FontAwesomeModule,
		AppPrimaryNavComponent,
		AppAccountMenuComponent
	],
	templateUrl: './app-header.component.html',
	styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
	private readonly dialog = inject(MatDialog);
	private readonly router = inject(Router);
	private readonly taskNav = inject(TaskNavigationService);
	private readonly browserPreferences = inject(BrowserPreferencesService);
	private readonly authStore = inject(AuthStore);
	private readonly notificationStore = inject(NotificationStore);

	// Icons
	public readonly notificationIcon = Icons.bell;
	public readonly lightThemeIcon = Icons.sun;
	public readonly darkThemeIcon = Icons.moon;
	public readonly accountIcon = Icons.user;
	public readonly markAllReadIcon = Icons.checkDouble;
	public readonly markReadIcon = Icons.check;
	public readonly unreadDotIcon = Icons.circle;

	/**
	 * Navigation links computed dynamically based on the active project.
	 * Task routes include the project key, home route is always available.
	 */
	public readonly navLinks = computed<readonly PrimaryNavLink[]>(() => {
		const kanbanRoute = this.taskNav.kanbanRoute();
		const epicsRoute = this.taskNav.epicsRoute();
		const backlogRoute = this.taskNav.backlogRoute();
		const resolvedRoute = this.taskNav.resolvedRoute();

		return [
			{ label: 'Home', route: '/home', icon: Icons.home },
			{ label: 'Kanban', route: kanbanRoute ?? '/no-active-project', icon: Icons.kanban },
			{ label: 'Epics', route: epicsRoute ?? '/no-active-project', icon: Icons.epic },
			{ label: 'Backlog', route: backlogRoute ?? '/no-active-project', icon: Icons.listCheck },
			{ label: 'Resolved', route: resolvedRoute ?? '/no-active-project', icon: Icons.checkDouble },
			{ label: 'Temporal', route: '/time-tracking', icon: Icons.calendarDays }
		];
	});

	public readonly accountMenuItems: readonly AccountMenuItem[] = [
		{ action: AccountMenuAction.About, label: 'About', icon: Icons.info },
		{ action: AccountMenuAction.Settings, label: 'Preferences', icon: Icons.preferences },
		{ action: AccountMenuAction.Maintenance, label: 'Maintenance', icon: Icons.maintenance }
	];

	// Notification state from store
	public readonly notifications = computed(() => this.notificationStore.vm().notifications);
	public readonly unreadNotifications = computed(() => this.notificationStore.unreadNotifications());
	public readonly unreadCount = computed(() => this.notificationStore.vm().unreadCount);

	// Badge display text (show 99+ for large counts)
	public readonly badgeText = computed(() => {
		const count = this.unreadCount();
		if (count === 0) return '';
		return count > 99 ? '99+' : count.toString();
	});

	public readonly hasUnread = computed(() => this.unreadCount() > 0);

	/** Whether the user can write (not in read-only mode) */
	public readonly canWrite = computed(() => this.authStore.canWrite());

	/** Current theme state, driven by the browser appearance preference. */
	public readonly isDarkMode = this.browserPreferences.darkMode;
	public readonly themeToggleLabel = computed(() =>
		this.isDarkMode() ? 'Switch to light theme' : 'Switch to dark theme'
	);

	/** Toggles between light and dark theme, persisting the choice to localStorage. */
	public toggleTheme(): void {
		const enabled = !this.isDarkMode();
		this.browserPreferences.applyDarkMode(enabled);
		this.browserPreferences.setDarkMode(enabled);
	}

	public onAccountMenuItemSelected(item: AccountMenuItem): void {
		switch (item.action) {
			case AccountMenuAction.About:
				this.openAboutDialog();
				break;
			case AccountMenuAction.Settings:
				this.openPreferencesDialog();
				break;
			case AccountMenuAction.Maintenance:
				this.navigateToMaintenance();
				break;
		}
	}

	public markAsRead(notificationId: string, event: Event): void {
		event.stopPropagation();
		this.notificationStore.markAsRead(notificationId);
	}

	public markAllAsRead(): void {
		this.notificationStore.markAllAsRead();
	}

	public getTypeClass(type: NotificationType): string {
		const typeClasses: Record<NotificationType, string> = {
			[NotificationType.ProjectActivated]: 'notification--info',
			[NotificationType.ItemCreated]: 'notification--success',
			[NotificationType.ItemResolved]: 'notification--success',
			[NotificationType.ItemBacklogged]: 'notification--warning',
			[NotificationType.DeadlineApproaching]: 'notification--warning',
			[NotificationType.DeadlineOverdue]: 'notification--error',
			[NotificationType.WeeklyDigestReady]: 'notification--info',
			[NotificationType.ContributorAdded]: 'notification--info',
			[NotificationType.ContributorRemoved]: 'notification--warning'
		};
		return typeClasses[type] || 'notification--info';
	}

	public formatTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;

		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;

		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;

		return date.toLocaleDateString();
	}

	private openAboutDialog(): void {
		this.dialog.open(AboutDialogComponent, {
			width: '480px',
			autoFocus: 'dialog'
		});
	}

	private openPreferencesDialog(): void {
		this.dialog.open(PreferencesDialogComponent, {
			width: '720px',
			maxWidth: '90vw',
			autoFocus: 'first-tabbable'
		});
	}

	private navigateToMaintenance(): void {
		void this.router.navigate(['/maintenance']);
	}
}
