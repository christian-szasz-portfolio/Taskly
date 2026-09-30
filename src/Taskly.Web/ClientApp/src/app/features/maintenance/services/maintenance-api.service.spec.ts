import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { MaintenanceApiService } from './maintenance-api.service';
import { type SystemTask, SystemTaskState } from '../../../core/models/system-task.interfaces';
import { type Notification, NotificationType } from '../../../core/models/notification.interfaces';
import { DemoDataService } from '../../../core/services/demo/demo-data.service';
import { NotificationApiService } from '../../../core/services/notification/notification-api.service';
import { ReadStatusFilter } from '../models/maintenance.interfaces';

describe('MaintenanceApiService', () => {
  let service: MaintenanceApiService;
  let notificationsSpy: MockedObject<NotificationApiService>;
  let systemTasks: SystemTask[];
  let notifications: Notification[];

  const systemTask = (overrides: Partial<SystemTask> = {}): SystemTask => ({
    id: 'task-1',
    userId: 'demo-user',
    name: 'Seed workspace',
    description: null,
    state: SystemTaskState.Finished,
    createdAtUtc: '2026-01-01T00:00:00Z',
    completedAtUtc: '2026-01-01T00:01:00Z',
    relatedEntityId: null,
    relatedEntityType: null,
    ...overrides
  });

  const notification = (overrides: Partial<Notification> = {}): Notification => ({
    id: 'notif-1',
    userId: 'demo-user',
    title: 'Project activated',
    message: 'Demo Project is now active',
    type: NotificationType.ProjectActivated,
    isRead: false,
    createdAtUtc: '2026-01-01T00:00:00Z',
    readAtUtc: null,
    relatedEntityId: null,
    relatedEntityType: null,
    ...overrides
  });

  beforeEach(() => {
    systemTasks = [];
    notifications = [];

    const demoDataSpy = createSpyObj<DemoDataService>(['readCollection']);
    demoDataSpy.readCollection.mockImplementation(() => systemTasks);

    notificationsSpy = createSpyObj<NotificationApiService>(['list', 'markAsRead', 'markAsUnread']);
    notificationsSpy.list.mockImplementation(() => of(notifications));
    notificationsSpy.markAsRead.mockReturnValue(of(undefined));
    notificationsSpy.markAsUnread.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        MaintenanceApiService,
        { provide: DemoDataService, useValue: demoDataSpy },
        { provide: NotificationApiService, useValue: notificationsSpy }
      ]
    });

    service = TestBed.inject(MaintenanceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listSystemTasks', () => {
    it('lists the seeded system tasks, newest first', async () => {
      systemTasks = [
        systemTask({ id: 'old', createdAtUtc: '2026-01-01T00:00:00Z' }),
        systemTask({ id: 'new', createdAtUtc: '2026-01-02T00:00:00Z' })
      ];

      const result = await firstValueFrom(service.listSystemTasks({ page: 1, pageSize: 20 }));

      expect(result.items.map((task) => task.id)).toEqual(['new', 'old']);
      expect(result.totalItems).toBe(2);
    });

    it('filters by state', async () => {
      systemTasks = [
        systemTask({ id: 'done' }),
        systemTask({ id: 'running', state: SystemTaskState.Started })
      ];

      const result = await firstValueFrom(service.listSystemTasks({ page: 1, pageSize: 20, state: SystemTaskState.Started }));

      expect(result.items.map((task) => task.id)).toEqual(['running']);
    });

    it('filters by date range', async () => {
      systemTasks = [
        systemTask({ id: 'before', createdAtUtc: '2026-01-01T00:00:00Z' }),
        systemTask({ id: 'inside', createdAtUtc: '2026-01-05T00:00:00Z' }),
        systemTask({ id: 'after', createdAtUtc: '2026-01-10T00:00:00Z' })
      ];

      const result = await firstValueFrom(service.listSystemTasks({
        page: 1,
        pageSize: 20,
        fromDate: '2026-01-03T00:00:00Z',
        toDate: '2026-01-07T00:00:00Z'
      }));

      expect(result.items.map((task) => task.id)).toEqual(['inside']);
    });

    it('searches the name and description', async () => {
      systemTasks = [
        systemTask({ id: 'by-name', name: 'Seed workspace' }),
        systemTask({ id: 'by-description', name: 'Other', description: 'Seeds the backlog' }),
        systemTask({ id: 'neither', name: 'Other' })
      ];

      const result = await firstValueFrom(service.listSystemTasks({ page: 1, pageSize: 20, search: 'seed' }));

      expect(result.items.map((task) => task.id).sort()).toEqual(['by-description', 'by-name']);
    });

    it('pages the result', async () => {
      systemTasks = Array.from({ length: 25 }, (_, i) =>
        systemTask({ id: `task-${i}`, createdAtUtc: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString() })
      );

      const result = await firstValueFrom(service.listSystemTasks({ page: 2, pageSize: 20 }));

      expect(result.items).toHaveLength(5);
      expect(result.totalItems).toBe(25);
      expect(result.totalPages).toBe(2);
      expect(result.hasPreviousPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe('listNotifications', () => {
    it('lists every notification, read or not', async () => {
      notifications = [notification({ id: 'a' }), notification({ id: 'b', isRead: true })];

      const result = await firstValueFrom(service.listNotifications({ page: 1, pageSize: 20 }));

      expect(notificationsSpy.list).toHaveBeenCalledWith(true);
      expect(result.items).toHaveLength(2);
    });

    it('filters by type', async () => {
      notifications = [
        notification({ id: 'activated' }),
        notification({ id: 'overdue', type: NotificationType.DeadlineOverdue })
      ];

      const result = await firstValueFrom(service.listNotifications({ page: 1, pageSize: 20, type: NotificationType.DeadlineOverdue }));

      expect(result.items.map((n) => n.id)).toEqual(['overdue']);
    });

    it('filters by read status', async () => {
      notifications = [notification({ id: 'unread' }), notification({ id: 'read', isRead: true })];

      const readOnly = await firstValueFrom(service.listNotifications({ page: 1, pageSize: 20, readStatus: ReadStatusFilter.ReadOnly }));
      const unreadOnly = await firstValueFrom(service.listNotifications({ page: 1, pageSize: 20, readStatus: ReadStatusFilter.UnreadOnly }));
      const all = await firstValueFrom(service.listNotifications({ page: 1, pageSize: 20, readStatus: ReadStatusFilter.All }));

      expect(readOnly.items.map((n) => n.id)).toEqual(['read']);
      expect(unreadOnly.items.map((n) => n.id)).toEqual(['unread']);
      expect(all.items).toHaveLength(2);
    });

    it('searches the title and message', async () => {
      notifications = [
        notification({ id: 'by-title', title: 'Deadline approaching' }),
        notification({ id: 'by-message', title: 'Other', message: 'The deadline is tomorrow' }),
        notification({ id: 'neither', title: 'Other', message: null })
      ];

      const result = await firstValueFrom(service.listNotifications({ page: 1, pageSize: 20, search: 'deadline' }));

      expect(result.items.map((n) => n.id).sort()).toEqual(['by-message', 'by-title']);
    });
  });

  describe('marking notifications', () => {
    it('marks a notification as read', async () => {
      await firstValueFrom(service.markAsRead('notif-1'));

      expect(notificationsSpy.markAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('marks a notification as unread', async () => {
      await firstValueFrom(service.markAsUnread('notif-1'));

      expect(notificationsSpy.markAsUnread).toHaveBeenCalledWith('notif-1');
    });
  });
});
