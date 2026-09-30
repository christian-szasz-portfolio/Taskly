import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { NotificationStore } from './notification.store';
import { NotificationApiService } from '../services/notification/notification-api.service';
import type { Notification } from '../models/notification.interfaces';
import { NotificationType } from '../models/notification.interfaces';

describe('NotificationStore', () => {
  let store: NotificationStore;
  let apiSpy: MockedObject<NotificationApiService>;

  const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
    id: 'notif-1',
    userId: 'user-1',
    title: 'Test Notification',
    message: 'Test message',
    type: NotificationType.ProjectActivated,
    isRead: false,
    createdAtUtc: '2026-01-01T00:00:00Z',
    readAtUtc: null,
    relatedEntityId: null,
    relatedEntityType: null,
    ...overrides
  });

  beforeEach(() => {
    apiSpy = createSpyObj<NotificationApiService>(
      ['list', 'getUnreadCount', 'markAsRead', 'markAsUnread', 'markAllAsRead']
    );
    apiSpy.list.mockReturnValue(of([]));
    apiSpy.getUnreadCount.mockReturnValue(of(0));
    apiSpy.markAsRead.mockReturnValue(of(undefined));
    apiSpy.markAsUnread.mockReturnValue(of(undefined));
    apiSpy.markAllAsRead.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        NotificationStore,
        { provide: NotificationApiService, useValue: apiSpy }
      ]
    });

    store = TestBed.inject(NotificationStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('vm', () => {
    it('should provide view model with all properties', () => {
      const vm = store.vm();

      expect(vm.notifications).toEqual([]);
      expect(vm.unreadCount).toBe(0);
      expect(vm.loading).toBe(false);
      expect(vm.error).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should load the notifications and the unread count', () => {
      store.initialize();

      expect(apiSpy.list).toHaveBeenCalled();
      expect(apiSpy.getUnreadCount).toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('should load notifications from API', () => {
      const mockNotifications = [createMockNotification()];
      apiSpy.list.mockReturnValue(of(mockNotifications));

      store.load();

      expect(store.vm().notifications).toEqual(mockNotifications);
      expect(store.vm().loading).toBe(false);
    });

    it('should set error on load failure', () => {
      apiSpy.list.mockReturnValue(throwError(() => new Error('Load failed')));

      store.load();

      expect(store.vm().error).toBe('Load failed');
    });

    it('should pass includeRead parameter', () => {
      store.load(false);

      expect(apiSpy.list).toHaveBeenCalledWith(false);
    });
  });

  describe('loadUnreadCount', () => {
    it('should load unread count from API', () => {
      apiSpy.getUnreadCount.mockReturnValue(of(5));

      store.loadUnreadCount();

      expect(store.vm().unreadCount).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const mockNotifications = [createMockNotification({ id: 'notif-1', isRead: false })];
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      store.markAsRead('notif-1');

      const updated = store.vm().notifications.find((n) => n.id === 'notif-1');
      expect(updated?.isRead).toBe(true);
      expect(updated?.readAtUtc).not.toBeNull();
    });

    it('should decrement unread count', () => {
      apiSpy.getUnreadCount.mockReturnValue(of(5));
      store.loadUnreadCount();
      const mockNotifications = [createMockNotification({ id: 'notif-1', isRead: false })];
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      store.markAsRead('notif-1');

      expect(store.vm().unreadCount).toBe(4);
    });

    it('should set error on failure', () => {
      apiSpy.markAsRead.mockReturnValue(throwError(() => new Error('Failed')));
      const mockNotifications = [createMockNotification()];
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      store.markAsRead('notif-1');

      expect(store.vm().error).toBe('Failed');
    });
  });

  describe('markAsUnread', () => {
    it('should mark notification as unread', () => {
      const mockNotifications = [createMockNotification({ id: 'notif-1', isRead: true })];
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      store.markAsUnread('notif-1');

      const updated = store.vm().notifications.find((n) => n.id === 'notif-1');
      expect(updated?.isRead).toBe(false);
    });

    it('should increment unread count', () => {
      apiSpy.getUnreadCount.mockReturnValue(of(5));
      store.loadUnreadCount();

      store.markAsUnread('notif-1');

      expect(store.vm().unreadCount).toBe(6);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const mockNotifications = [
        createMockNotification({ id: 'notif-1', isRead: false }),
        createMockNotification({ id: 'notif-2', isRead: false })
      ];
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      store.markAllAsRead();

      expect(store.vm().notifications.every((n) => n.isRead)).toBe(true);
      expect(store.vm().unreadCount).toBe(0);
    });
  });

  describe('computed properties', () => {
    it('should filter unread notifications', () => {
      const mockNotifications = [
        createMockNotification({ id: 'notif-1', isRead: false }),
        createMockNotification({ id: 'notif-2', isRead: true }),
        createMockNotification({ id: 'notif-3', isRead: false })
      ];
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      expect(store.unreadNotifications().length).toBe(2);
    });

    it('should return recent notifications sorted by date', () => {
      const mockNotifications = [
        createMockNotification({ id: 'notif-1', createdAtUtc: '2026-01-01T00:00:00Z' }),
        createMockNotification({ id: 'notif-2', createdAtUtc: '2026-01-03T00:00:00Z' }),
        createMockNotification({ id: 'notif-3', createdAtUtc: '2026-01-02T00:00:00Z' })
      ];
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      const recent = store.recentNotifications();
      expect(recent[0].id).toBe('notif-2');
      expect(recent[1].id).toBe('notif-3');
      expect(recent[2].id).toBe('notif-1');
    });

    it('should limit recent notifications to 10', () => {
      const mockNotifications = Array.from({ length: 15 }, (_, i) =>
        createMockNotification({ id: `notif-${i}` })
      );
      apiSpy.list.mockReturnValue(of(mockNotifications));
      store.load();

      expect(store.recentNotifications().length).toBe(10);
    });
  });
});
