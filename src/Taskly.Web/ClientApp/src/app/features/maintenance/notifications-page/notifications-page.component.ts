import { CommonModule } from '@angular/common';
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { Observable } from 'rxjs';
import { Icons } from '../../../core/icons/icon-registry';
import type { Notification } from '../../../core/models/notification.interfaces';
import { NotificationType } from '../../../core/models/notification.interfaces';
import { ReadStatusFilter } from '../models/maintenance.interfaces';
import type { NotificationFilter } from '../models/maintenance.types';
import { DEFAULT_NOTIFICATION_FILTER } from '../models/maintenance.types';
import type { PagedResult } from '../models/maintenance.interfaces';
import { BaseMaintenancePageComponent } from '../base/base-maintenance-page.component';
import { MaintenancePageLayoutComponent } from '../components/maintenance-page-layout/maintenance-page-layout.component';
import { DatePickerInputComponent } from '../../../shared/components/date-picker/date-picker-input.component';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';
import { EventBus } from '../../../core/utilities/event-bus.utility';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FontAwesomeModule,
    MaintenancePageLayoutComponent,
    DatePickerInputComponent
  ],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPageComponent extends BaseMaintenancePageComponent<Notification, NotificationFilter> {
  // =========================================================================
  // Entity-Specific Properties
  // =========================================================================

  protected readonly entityName = 'notifications';

  public readonly icons = {
    ...this.baseIcons,
    header: Icons.bell,
    read: Icons.emailOpen,
    unread: Icons.email,
    markRead: Icons.check,
    markUnread: Icons.undo,
    project: Icons.projectDiagram,
    itemCreated: Icons.plus,
    itemResolved: Icons.success,
    itemBacklogged: Icons.arrowLeft,
    deadline: Icons.clock,
    digest: Icons.listCheck,
    contributor: Icons.user
  };

  public readonly typeOptions = [
    { value: undefined, label: 'All Types' },
    { value: NotificationType.ProjectActivated, label: 'Project Activated' },
    { value: NotificationType.ItemCreated, label: 'Item Created' },
    { value: NotificationType.ItemResolved, label: 'Item Resolved' },
    { value: NotificationType.ItemBacklogged, label: 'Item Backlogged' },
    { value: NotificationType.DeadlineApproaching, label: 'Deadline Approaching' },
    { value: NotificationType.DeadlineOverdue, label: 'Deadline Overdue' },
    { value: NotificationType.WeeklyDigestReady, label: 'Weekly Digest' },
    { value: NotificationType.ContributorAdded, label: 'Contributor Added' },
    { value: NotificationType.ContributorRemoved, label: 'Contributor Removed' }
  ];

  public readonly readStatusOptions = [
    { value: ReadStatusFilter.All, label: 'All' },
    { value: ReadStatusFilter.UnreadOnly, label: 'Unread Only' },
    { value: ReadStatusFilter.ReadOnly, label: 'Read Only' }
  ];

  // Entity-specific filters
  public readonly typeFilter = signal<NotificationType | undefined>(undefined);
  public readonly readStatusFilter = signal<ReadStatusFilter>(ReadStatusFilter.All);

  // Expose entities as 'notifications' for template compatibility
  public readonly notifications = this.entities;

  constructor() {
    super();

    EventBus.send(TITLE_EVENT_NAME, 'Notifications');

    // Watch entity-specific filters for auto-refresh
    this.watchFilterSignal(this.typeFilter);
    this.watchFilterSignal(this.readStatusFilter);
  }

  // =========================================================================
  // Abstract Method Implementations
  // =========================================================================

  protected getDefaultFilter(): NotificationFilter {
    return { ...DEFAULT_NOTIFICATION_FILTER };
  }

  protected buildFilter(): NotificationFilter {
    return {
      page: 1,
      pageSize: this.pageSize(),
      fromDate: this.fromDate() ? this.formatDateForApi(this.fromDate()!) : undefined,
      toDate: this.toDate() ? this.formatDateForApi(this.toDate()!) : undefined,
      type: this.typeFilter(),
      readStatus: this.readStatusFilter(),
      search: this.searchTerm().trim() || undefined
    };
  }

  protected hasEntitySpecificFilters(): boolean {
    return this.typeFilter() !== undefined ||
      this.readStatusFilter() !== ReadStatusFilter.All;
  }

  protected resetEntitySpecificFilters(): void {
    this.typeFilter.set(undefined);
    this.readStatusFilter.set(ReadStatusFilter.All);
  }

  protected fetchFromApi(filter: NotificationFilter): Observable<PagedResult<Notification>> {
    return this.api.listNotifications(filter);
  }

  // =========================================================================
  // Entity-Specific Methods
  // =========================================================================

  public toggleReadStatus(notification: Notification): void {
    if (notification.isRead) {
      this.api.markAsUnread(notification.id).subscribe({
        next: () => {
          // Update local state
          const updated = this.notifications().map((n) =>
            n.id === notification.id ? { ...n, isRead: false, readAtUtc: null } : n
          );
          this.entities.set(updated);
        },
        error: (err) => console.error('Failed to mark as unread:', err)
      });
    } else {
      this.api.markAsRead(notification.id).subscribe({
        next: () => {
          // Update local state
          const updated = this.notifications().map((n) =>
            n.id === notification.id ? { ...n, isRead: true, readAtUtc: new Date().toISOString() } : n
          );
          this.entities.set(updated);
        },
        error: (err) => console.error('Failed to mark as read:', err)
      });
    }
  }

  public getTypeIcon(type: NotificationType): typeof Icons.bell {
    const icons: Record<NotificationType, typeof Icons.bell> = {
      [NotificationType.ProjectActivated]: this.icons.project,
      [NotificationType.ItemCreated]: this.icons.itemCreated,
      [NotificationType.ItemResolved]: this.icons.itemResolved,
      [NotificationType.ItemBacklogged]: this.icons.itemBacklogged,
      [NotificationType.DeadlineApproaching]: this.icons.deadline,
      [NotificationType.DeadlineOverdue]: this.icons.deadline,
      [NotificationType.WeeklyDigestReady]: this.icons.digest,
      [NotificationType.ContributorAdded]: this.icons.contributor,
      [NotificationType.ContributorRemoved]: this.icons.contributor
    };
    return icons[type] ?? this.icons.header;
  }

  public getTypeClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      [NotificationType.ProjectActivated]: 'type--info',
      [NotificationType.ItemCreated]: 'type--success',
      [NotificationType.ItemResolved]: 'type--success',
      [NotificationType.ItemBacklogged]: 'type--warning',
      [NotificationType.DeadlineApproaching]: 'type--warning',
      [NotificationType.DeadlineOverdue]: 'type--error',
      [NotificationType.WeeklyDigestReady]: 'type--info',
      [NotificationType.ContributorAdded]: 'type--info',
      [NotificationType.ContributorRemoved]: 'type--warning'
    };
    return classes[type] ?? 'type--info';
  }
}
