import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import type { Notification } from '../models/notification.interfaces';
import { NotificationApiService } from '../services/notification/notification-api.service';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly api = inject(NotificationApiService);

  private readonly notifications = signal<Notification[]>([]);
  private readonly unreadCount = signal(0);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  /** Computed view model for components. */
  public readonly vm = computed(() => ({
    notifications: this.notifications(),
    unreadCount: this.unreadCount(),
    loading: this.loading(),
    error: this.error()
  }));

  /** Unread notifications only. */
  public readonly unreadNotifications = computed(() =>
    this.notifications().filter((n) => !n.isRead)
  );

  /** Most recent notifications (top 10). */
  public readonly recentNotifications = computed(() =>
    [...this.notifications()]
      .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
      .slice(0, 10)
  );

  /**
   * Loads the notifications and the unread count.
   */
  public initialize(): void {
    this.load();
    this.loadUnreadCount();
  }

  /**
   * Loads all notifications from the API.
   */
  public load(includeRead = true): void {
    this.loading.set(true);
    this.api
      .list(includeRead)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => {
          this.notifications.set(items);
          this.error.set(null);
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to load notifications'))
      });
  }

  /**
   * Loads the unread count from the API.
   */
  public loadUnreadCount(): void {
    this.api.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount.set(count);
      },
      error: (err: unknown) => {
        console.error('Failed to load unread count:', err);
      }
    });
  }

  /**
   * Marks a notification as read.
   */
  public markAsRead(id: string): void {
    this.api.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((n) => (n.id === id ? { ...n, isRead: true, readAtUtc: new Date().toISOString() } : n))
        );
        this.unreadCount.update((count) => Math.max(0, count - 1));
        this.error.set(null);
      },
      error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to mark notification as read'))
    });
  }

  /**
   * Marks a notification as unread.
   */
  public markAsUnread(id: string): void {
    this.api.markAsUnread(id).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((n) => (n.id === id ? { ...n, isRead: false, readAtUtc: null } : n))
        );
        this.unreadCount.update((count) => count + 1);
        this.error.set(null);
      },
      error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to mark notification as unread'))
    });
  }

  /**
   * Marks all notifications as read.
   */
  public markAllAsRead(): void {
    this.api.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((n) => ({ ...n, isRead: true, readAtUtc: new Date().toISOString() }))
        );
        this.unreadCount.set(0);
        this.error.set(null);
      },
      error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to mark all notifications as read'))
    });
  }

  private formatError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  }
}
