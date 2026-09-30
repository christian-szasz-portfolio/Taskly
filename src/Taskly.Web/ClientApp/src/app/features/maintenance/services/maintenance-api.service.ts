import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { SystemTask } from '../../../core/models/system-task.interfaces';
import type { Notification } from '../../../core/models/notification.interfaces';
import { NotificationApiService } from '../../../core/services/notification/notification-api.service';
import { demoResponse } from '../../../core/services/demo/demo-seed';
import { DemoDataService } from '../../../core/services/demo/demo-data.service';
import type { PagedResult } from '../models/maintenance.interfaces';
import { ReadStatusFilter } from '../models/maintenance.interfaces';
import type { SystemTaskFilter, NotificationFilter } from '../models/maintenance.types';

/**
 * The maintenance pages' data: the seeded system tasks and notifications, filtered and paged in
 * this browser.
 */
@Injectable({ providedIn: 'root' })
export class MaintenanceApiService {
  private readonly notifications = inject(NotificationApiService);
  private readonly demoData = inject(DemoDataService);

  /**
   * Gets paginated system tasks with optional filters.
   * @param filter The filter parameters.
   * @returns Observable of paginated system tasks.
   */
  public listSystemTasks(filter: SystemTaskFilter): Observable<PagedResult<SystemTask>> {
    // The system-task activity feed hydrated from the backend demo seed
    const all = this.demoData
      .readCollection<SystemTask>('systemTasks', () => [])
      .slice()
      .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
    return demoResponse(this.pageSystemTasks(all, filter));
  }

  /**
   * Gets paginated notifications with optional filters.
   * @param filter The filter parameters.
   * @returns Observable of paginated notifications.
   */
  public listNotifications(filter: NotificationFilter): Observable<PagedResult<Notification>> {
    return this.notifications.list(true).pipe(map((items) => this.pageNotifications(items, filter)));
  }

  /**
   * Marks a notification as read.
   * @param id The notification ID.
   * @returns Observable that completes when done.
   */
  public markAsRead(id: string): Observable<void> {
    return this.notifications.markAsRead(id);
  }

  /**
   * Marks a notification as unread.
   * @param id The notification ID.
   * @returns Observable that completes when done.
   */
  public markAsUnread(id: string): Observable<void> {
    return this.notifications.markAsUnread(id);
  }

  /** Applies the system-task filters and pages the result. */
  private pageSystemTasks(all: readonly SystemTask[], filter: SystemTaskFilter): PagedResult<SystemTask> {
    let items = [...all];

    if (filter.state) {
      items = items.filter((t) => t.state === filter.state);
    }

    if (filter.fromDate) {
      const from = new Date(filter.fromDate).getTime();
      items = items.filter((t) => new Date(t.createdAtUtc).getTime() >= from);
    }

    if (filter.toDate) {
      const to = new Date(filter.toDate).getTime();
      items = items.filter((t) => new Date(t.createdAtUtc).getTime() <= to);
    }

    if (filter.search) {
      const term = filter.search.toLowerCase();
      items = items.filter((t) => t.name.toLowerCase().includes(term) || (t.description ?? '').toLowerCase().includes(term));
    }

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / filter.pageSize));
    const start = (filter.page - 1) * filter.pageSize;
    const pageItems = items.slice(start, start + filter.pageSize);

    return {
      items: pageItems,
      page: filter.page,
      pageSize: filter.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: filter.page > 1,
      hasNextPage: filter.page < totalPages
    };
  }

  /** Applies the notification filters and pages the result. */
  private pageNotifications(all: readonly Notification[], filter: NotificationFilter): PagedResult<Notification> {
    let items = [...all];

    if (filter.type) {
      items = items.filter((n) => n.type === filter.type);
    }

    if (filter.readStatus && filter.readStatus !== ReadStatusFilter.All) {
      const wantRead = filter.readStatus === ReadStatusFilter.ReadOnly;
      items = items.filter((n) => n.isRead === wantRead);
    }

    if (filter.search) {
      const term = filter.search.toLowerCase();
      items = items.filter((n) => n.title.toLowerCase().includes(term) || (n.message ?? '').toLowerCase().includes(term));
    }

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / filter.pageSize));
    const start = (filter.page - 1) * filter.pageSize;
    const pageItems = items.slice(start, start + filter.pageSize);

    return {
      items: pageItems,
      page: filter.page,
      pageSize: filter.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: filter.page > 1,
      hasNextPage: filter.page < totalPages
    };
  }
}
