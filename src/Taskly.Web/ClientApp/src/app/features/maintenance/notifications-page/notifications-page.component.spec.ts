import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { createSpyObj, getBaseTestProviders, type MockedObject } from '@testing/test-helpers';
import { NotificationsPageComponent } from './notifications-page.component';
import { MaintenanceApiService } from '../services/maintenance-api.service';
import { NotificationType } from '../../../core/models/notification.interfaces';
import type { Notification } from '../../../core/models/notification.interfaces';
import type { PagedResult } from '../models/maintenance.interfaces';
import { ReadStatusFilter } from '../models/maintenance.interfaces';

describe('NotificationsPageComponent', () => {
  let component: NotificationsPageComponent;
  let fixture: ComponentFixture<NotificationsPageComponent>;
  let apiSpy: MockedObject<MaintenanceApiService>;

  const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
    id: 'notif-1',
    userId: 'user-1',
    title: 'Test Notification',
    message: 'Test message',
    type: NotificationType.ItemCreated,
    isRead: false,
    createdAtUtc: '2026-01-01T00:00:00Z',
    readAtUtc: null,
    relatedEntityId: null,
    relatedEntityType: null,
    ...overrides
  });

  const createMockPagedResult = <T>(
    items: readonly T[],
    overrides: Partial<Omit<PagedResult<T>, 'items'>> = {}
  ): PagedResult<T> => ({
    items,
    page: 1,
    pageSize: 20,
    totalItems: items.length,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    ...overrides
  });

  beforeEach(async () => {
    apiSpy = createSpyObj<MaintenanceApiService>(['listSystemTasks', 'listNotifications', 'markAsRead', 'markAsUnread']);
    apiSpy.listNotifications.mockReturnValue(of(createMockPagedResult([])));
    apiSpy.markAsRead.mockReturnValue(of(undefined));
    apiSpy.markAsUnread.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [NotificationsPageComponent],
      providers: [
        ...getBaseTestProviders(),
        { provide: MaintenanceApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load notifications on init', async () => {
      const mockNotifications = [createMockNotification()];
      apiSpy.listNotifications.mockReturnValue(of(createMockPagedResult(mockNotifications)));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(apiSpy.listNotifications).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20
      });
      expect(component.notifications()).toEqual(mockNotifications);
    });

    it('should set loading state during fetch', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.loading()).toBe(false);
    });

    it('should have filter panel hidden by default', () => {
      fixture.detectChanges();
      expect(component.filtersVisible()).toBe(false);
    });

    it('should have no active filters by default', () => {
      fixture.detectChanges();
      expect(component.hasActiveFilters()).toBe(false);
    });
  });

  describe('icons', () => {
    it('should have all required icons defined', () => {
      fixture.detectChanges();

      expect(component.icons).toBeDefined();
      expect(component.icons.header).toBeDefined();
      expect(component.icons.systemTasks).toBeDefined();
      expect(component.icons.filter).toBeDefined();
      expect(component.icons.clear).toBeDefined();
      expect(component.icons.refresh).toBeDefined();
      expect(component.icons.search).toBeDefined();
      expect(component.icons.read).toBeDefined();
      expect(component.icons.unread).toBeDefined();
      expect(component.icons.markRead).toBeDefined();
      expect(component.icons.markUnread).toBeDefined();
      expect(component.icons.project).toBeDefined();
      expect(component.icons.itemCreated).toBeDefined();
      expect(component.icons.itemResolved).toBeDefined();
      expect(component.icons.itemBacklogged).toBeDefined();
      expect(component.icons.deadline).toBeDefined();
      expect(component.icons.contributor).toBeDefined();
    });
  });

  describe('typeOptions', () => {
    it('should have all type options', () => {
      fixture.detectChanges();

      expect(component.typeOptions).toHaveLength(10);
      expect(component.typeOptions[0]).toEqual({ value: undefined, label: 'All Types' });
      expect(component.typeOptions[1]).toEqual({ value: NotificationType.ProjectActivated, label: 'Project Activated' });
      expect(component.typeOptions[2]).toEqual({ value: NotificationType.ItemCreated, label: 'Item Created' });
      expect(component.typeOptions[3]).toEqual({ value: NotificationType.ItemResolved, label: 'Item Resolved' });
      expect(component.typeOptions[4]).toEqual({ value: NotificationType.ItemBacklogged, label: 'Item Backlogged' });
      expect(component.typeOptions[5]).toEqual({ value: NotificationType.DeadlineApproaching, label: 'Deadline Approaching' });
      expect(component.typeOptions[6]).toEqual({ value: NotificationType.DeadlineOverdue, label: 'Deadline Overdue' });
      expect(component.typeOptions[7]).toEqual({ value: NotificationType.WeeklyDigestReady, label: 'Weekly Digest' });
      expect(component.typeOptions[8]).toEqual({ value: NotificationType.ContributorAdded, label: 'Contributor Added' });
      expect(component.typeOptions[9]).toEqual({ value: NotificationType.ContributorRemoved, label: 'Contributor Removed' });
    });
  });

  describe('readStatusOptions', () => {
    it('should have all read status options', () => {
      fixture.detectChanges();

      expect(component.readStatusOptions).toHaveLength(3);
      expect(component.readStatusOptions[0]).toEqual({ value: ReadStatusFilter.All, label: 'All' });
      expect(component.readStatusOptions[1]).toEqual({ value: ReadStatusFilter.UnreadOnly, label: 'Unread Only' });
      expect(component.readStatusOptions[2]).toEqual({ value: ReadStatusFilter.ReadOnly, label: 'Read Only' });
    });
  });

  describe('toggleFilters', () => {
    it('should toggle filter visibility', () => {
      fixture.detectChanges();

      expect(component.filtersVisible()).toBe(false);

      component.toggleFilters();
      expect(component.filtersVisible()).toBe(true);

      component.toggleFilters();
      expect(component.filtersVisible()).toBe(false);
    });
  });

  describe('applyFilters', () => {
    it('should apply filters and reset to page 1', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      // Clear initial call from effect
      apiSpy.listNotifications.mockClear();

      component.fromDate.set(new Date('2026-01-01'));
      component.toDate.set(new Date('2026-01-31'));
      component.typeFilter.set(NotificationType.DeadlineApproaching);
      component.readStatusFilter.set(ReadStatusFilter.UnreadOnly);
      component.searchTerm.set('Test query');

      component.applyFilters();
      await fixture.whenStable();

      expect(apiSpy.listNotifications).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        pageSize: 20,
        type: NotificationType.DeadlineApproaching,
        readStatus: ReadStatusFilter.UnreadOnly,
        search: 'Test query'
      }));
      expect(component.pageIndex()).toBe(0);
    });

    it('should set hasActiveFilters to true when type filter is applied', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.typeFilter.set(NotificationType.DeadlineOverdue);

      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should set hasActiveFilters to true when read status is not All', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.readStatusFilter.set(ReadStatusFilter.UnreadOnly);

      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should set hasActiveFilters to true when search term is present', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.searchTerm.set('search query');

      expect(component.hasActiveFilters()).toBe(true);
    });
  });

  describe('clearFilters', () => {
    it('should clear all filter values', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      // Set some filters
      component.fromDate.set(new Date('2026-01-01'));
      component.toDate.set(new Date('2026-01-31'));
      component.typeFilter.set(NotificationType.DeadlineApproaching);
      component.readStatusFilter.set(ReadStatusFilter.UnreadOnly);
      component.searchTerm.set('Test query');

      component.clearFilters();

      expect(component.fromDate()).toBeNull();
      expect(component.toDate()).toBeNull();
      expect(component.typeFilter()).toBeUndefined();
      expect(component.readStatusFilter()).toBe(ReadStatusFilter.All);
      expect(component.searchTerm()).toBe('');
      expect(component.pageIndex()).toBe(0);
      expect(component.hasActiveFilters()).toBe(false);
    });

    it('should fetch data with default filter after clear', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listNotifications.mockClear();

      component.clearFilters();
      await fixture.whenStable();

      expect(apiSpy.listNotifications).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('refresh', () => {
    it('should refetch data with current filter', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listNotifications.mockClear();

      component.refresh();
      await fixture.whenStable();

      expect(apiSpy.listNotifications).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update page index and fetch data', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listNotifications.mockClear();

      component.onPageChange({ pageIndex: 2, pageSize: 20 });
      await fixture.whenStable();

      expect(component.pageIndex()).toBe(2);
      expect(apiSpy.listNotifications).toHaveBeenCalledWith(expect.objectContaining({
        page: 3 // 0-based to 1-based
      }));
    });
  });

  describe('toggleReadStatus', () => {
    it('should mark notification as read when currently unread', async () => {
      const notification = createMockNotification({ id: 'notif-1', isRead: false });

      fixture.detectChanges();
      await fixture.whenStable();

      // Set initial notifications
      component.notifications.set([notification]);

      component.toggleReadStatus(notification);
      await fixture.whenStable();

      expect(apiSpy.markAsRead).toHaveBeenCalledWith('notif-1');
      expect(component.notifications()[0].isRead).toBe(true);
    });

    it('should mark notification as unread when currently read', async () => {
      const notification = createMockNotification({ id: 'notif-2', isRead: true });

      fixture.detectChanges();
      await fixture.whenStable();

      // Set initial notifications
      component.notifications.set([notification]);

      component.toggleReadStatus(notification);
      await fixture.whenStable();

      expect(apiSpy.markAsUnread).toHaveBeenCalledWith('notif-2');
      expect(component.notifications()[0].isRead).toBe(false);
    });
  });

  describe('getTypeIcon', () => {
    it('should return correct icon for each notification type', () => {
      fixture.detectChanges();

      expect(component.getTypeIcon(NotificationType.ProjectActivated)).toBe(component.icons.project);
      expect(component.getTypeIcon(NotificationType.ItemCreated)).toBe(component.icons.itemCreated);
      expect(component.getTypeIcon(NotificationType.ItemResolved)).toBe(component.icons.itemResolved);
      expect(component.getTypeIcon(NotificationType.ItemBacklogged)).toBe(component.icons.itemBacklogged);
      expect(component.getTypeIcon(NotificationType.DeadlineApproaching)).toBe(component.icons.deadline);
      expect(component.getTypeIcon(NotificationType.DeadlineOverdue)).toBe(component.icons.deadline);
      expect(component.getTypeIcon(NotificationType.WeeklyDigestReady)).toBe(component.icons.digest);
      expect(component.getTypeIcon(NotificationType.ContributorAdded)).toBe(component.icons.contributor);
      expect(component.getTypeIcon(NotificationType.ContributorRemoved)).toBe(component.icons.contributor);
    });
  });

  describe('getTypeClass', () => {
    it('should return correct class for each notification type', () => {
      fixture.detectChanges();

      expect(component.getTypeClass(NotificationType.ProjectActivated)).toBe('type--info');
      expect(component.getTypeClass(NotificationType.ItemCreated)).toBe('type--success');
      expect(component.getTypeClass(NotificationType.ItemResolved)).toBe('type--success');
      expect(component.getTypeClass(NotificationType.ItemBacklogged)).toBe('type--warning');
      expect(component.getTypeClass(NotificationType.DeadlineApproaching)).toBe('type--warning');
      expect(component.getTypeClass(NotificationType.DeadlineOverdue)).toBe('type--error');
      expect(component.getTypeClass(NotificationType.WeeklyDigestReady)).toBe('type--info');
      expect(component.getTypeClass(NotificationType.ContributorAdded)).toBe('type--info');
      expect(component.getTypeClass(NotificationType.ContributorRemoved)).toBe('type--warning');
    });
  });

  describe('isEmpty', () => {
    it('should return true when notifications array is empty and not loading', async () => {
      apiSpy.listNotifications.mockReturnValue(of(createMockPagedResult([])));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isEmpty()).toBe(true);
    });

    it('should return false when notifications exist', async () => {
      apiSpy.listNotifications.mockReturnValue(of(createMockPagedResult([createMockNotification()])));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isEmpty()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error message on API failure', async () => {
      apiSpy.listNotifications.mockReturnValue(throwError(() => new Error('API Error')));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.error()).toBe('Failed to load notifications');
      expect(component.loading()).toBe(false);
    });
  });

  describe('pagination', () => {
    it('should update totalItems from API response', async () => {
      apiSpy.listNotifications.mockReturnValue(of(createMockPagedResult([createMockNotification()], {
        totalItems: 100
      })));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.totalItems()).toBe(100);
    });
  });
});
