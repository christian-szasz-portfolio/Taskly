import { Injectable, inject } from '@angular/core';
import { type Observable } from 'rxjs';
import type { Notification } from '../../models/notification.interfaces';
import { DemoDataService } from '../demo/demo-data.service';
import { demoResponse } from '../demo/demo-seed';

const NOTIFICATIONS_KEY = 'notifications';

/** The seeded notifications, kept in this browser; a visitor can mark them read or unread. */
@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly demoData = inject(DemoDataService);

  // Seeded from the backend demo dataset via DemoHydrationService; empty until hydrated.
  private read(): Notification[] {
    return this.demoData.readCollection<Notification>(NOTIFICATIONS_KEY, () => []);
  }

  private write(items: Notification[]): void {
    this.demoData.writeCollection(NOTIFICATIONS_KEY, items);
  }

  public list(includeRead = true): Observable<Notification[]> {
    const items = this.read().filter((n) => includeRead || !n.isRead);
    return demoResponse(items);
  }

  public getUnreadCount(): Observable<number> {
    return demoResponse(this.read().filter((n) => !n.isRead).length);
  }

  public markAsRead(id: string): Observable<void> {
    this.write(this.read().map((n) => (n.id === id ? { ...n, isRead: true, readAtUtc: new Date().toISOString() } : n)));
    return demoResponse(undefined);
  }

  public markAsUnread(id: string): Observable<void> {
    this.write(this.read().map((n) => (n.id === id ? { ...n, isRead: false, readAtUtc: null } : n)));
    return demoResponse(undefined);
  }

  public markAllAsRead(): Observable<void> {
    const now = new Date().toISOString();
    this.write(this.read().map((n) => (n.isRead ? n : { ...n, isRead: true, readAtUtc: now })));
    return demoResponse(undefined);
  }

}
