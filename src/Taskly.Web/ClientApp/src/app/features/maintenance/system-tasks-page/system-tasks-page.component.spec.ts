import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { createSpyObj, getBaseTestProviders, type MockedObject } from '@testing/test-helpers';
import { SystemTasksPageComponent } from './system-tasks-page.component';
import { MaintenanceApiService } from '../services/maintenance-api.service';
import { SystemTaskState } from '../../../core/models/system-task.interfaces';
import type { SystemTask } from '../../../core/models/system-task.interfaces';
import type { PagedResult } from '../models/maintenance.interfaces';

describe('SystemTasksPageComponent', () => {
  let component: SystemTasksPageComponent;
  let fixture: ComponentFixture<SystemTasksPageComponent>;
  let apiSpy: MockedObject<MaintenanceApiService>;

  const createMockSystemTask = (overrides: Partial<SystemTask> = {}): SystemTask => ({
    id: 'task-1',
    userId: 'user-1',
    name: 'Test Task',
    description: null,
    state: SystemTaskState.Finished,
    createdAtUtc: '2026-01-01T00:00:00Z',
    completedAtUtc: '2026-01-01T01:00:00Z',
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
    apiSpy.listSystemTasks.mockReturnValue(of(createMockPagedResult([])));

    await TestBed.configureTestingModule({
      imports: [SystemTasksPageComponent],
      providers: [
        ...getBaseTestProviders(),
        { provide: MaintenanceApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemTasksPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load tasks on init', async () => {
      const mockTasks = [createMockSystemTask()];
      apiSpy.listSystemTasks.mockReturnValue(of(createMockPagedResult(mockTasks)));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(apiSpy.listSystemTasks).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20
      });
      expect(component.tasks()).toEqual(mockTasks);
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
      expect(component.icons.notifications).toBeDefined();
      expect(component.icons.filter).toBeDefined();
      expect(component.icons.clear).toBeDefined();
      expect(component.icons.refresh).toBeDefined();
      expect(component.icons.finished).toBeDefined();
      expect(component.icons.started).toBeDefined();
      expect(component.icons.starting).toBeDefined();
      expect(component.icons.cancelled).toBeDefined();
      expect(component.icons.search).toBeDefined();
    });
  });

  describe('stateOptions', () => {
    it('should have all state options', () => {
      fixture.detectChanges();

      expect(component.stateOptions).toHaveLength(5);
      expect(component.stateOptions[0]).toEqual({ value: undefined, label: 'All States' });
      expect(component.stateOptions[1]).toEqual({ value: SystemTaskState.Starting, label: 'Starting' });
      expect(component.stateOptions[2]).toEqual({ value: SystemTaskState.Started, label: 'Started' });
      expect(component.stateOptions[3]).toEqual({ value: SystemTaskState.Finished, label: 'Finished' });
      expect(component.stateOptions[4]).toEqual({ value: SystemTaskState.Cancelled, label: 'Cancelled' });
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
      apiSpy.listSystemTasks.mockClear();

      component.fromDate.set(new Date('2026-01-01'));
      component.toDate.set(new Date('2026-01-31'));
      component.stateFilter.set(SystemTaskState.Finished);
      component.searchTerm.set('Test query');

      component.applyFilters();
      await fixture.whenStable();

      expect(apiSpy.listSystemTasks).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        pageSize: 20,
        state: SystemTaskState.Finished,
        search: 'Test query'
      }));
      expect(component.pageIndex()).toBe(0);
    });

    it('should set hasActiveFilters to true when filters are applied', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.stateFilter.set(SystemTaskState.Started);

      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should trim search term', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listSystemTasks.mockClear();
      component.searchTerm.set('  trimmed search  ');

      component.applyFilters();
      await fixture.whenStable();

      expect(apiSpy.listSystemTasks).toHaveBeenCalledWith(expect.objectContaining({
        search: 'trimmed search'
      }));
    });

    it('should not include empty search term', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listSystemTasks.mockClear();
      component.searchTerm.set('   ');

      component.applyFilters();
      await fixture.whenStable();

      expect(apiSpy.listSystemTasks).toHaveBeenCalledWith(expect.objectContaining({
        search: undefined
      }));
    });
  });

  describe('clearFilters', () => {
    it('should clear all filter values', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      // Set some filters
      component.fromDate.set(new Date('2026-01-01'));
      component.toDate.set(new Date('2026-01-31'));
      component.stateFilter.set(SystemTaskState.Finished);
      component.searchTerm.set('Test query');

      component.clearFilters();

      expect(component.fromDate()).toBeNull();
      expect(component.toDate()).toBeNull();
      expect(component.stateFilter()).toBeUndefined();
      expect(component.searchTerm()).toBe('');
      expect(component.pageIndex()).toBe(0);
      expect(component.hasActiveFilters()).toBe(false);
    });

    it('should fetch data with default filter after clear', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listSystemTasks.mockClear();

      component.clearFilters();
      await fixture.whenStable();

      expect(apiSpy.listSystemTasks).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('refresh', () => {
    it('should refetch data with current filter', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listSystemTasks.mockClear();

      component.refresh();
      await fixture.whenStable();

      expect(apiSpy.listSystemTasks).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update page index and fetch data', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      apiSpy.listSystemTasks.mockClear();

      component.onPageChange({ pageIndex: 2, pageSize: 20 });
      await fixture.whenStable();

      expect(component.pageIndex()).toBe(2);
      expect(apiSpy.listSystemTasks).toHaveBeenCalledWith(expect.objectContaining({
        page: 3 // 0-based to 1-based
      }));
    });
  });

  describe('getStateIcon', () => {
    it('should return correct icon for Finished state', () => {
      fixture.detectChanges();
      expect(component.getStateIcon(SystemTaskState.Finished)).toBe(component.icons.finished);
    });

    it('should return correct icon for Started state', () => {
      fixture.detectChanges();
      expect(component.getStateIcon(SystemTaskState.Started)).toBe(component.icons.started);
    });

    it('should return correct icon for Starting state', () => {
      fixture.detectChanges();
      expect(component.getStateIcon(SystemTaskState.Starting)).toBe(component.icons.starting);
    });

    it('should return correct icon for Cancelled state', () => {
      fixture.detectChanges();
      expect(component.getStateIcon(SystemTaskState.Cancelled)).toBe(component.icons.cancelled);
    });
  });

  describe('getStateClass', () => {
    it('should return correct class for each state', () => {
      fixture.detectChanges();

      expect(component.getStateClass(SystemTaskState.Finished)).toBe('state--finished');
      expect(component.getStateClass(SystemTaskState.Started)).toBe('state--started');
      expect(component.getStateClass(SystemTaskState.Starting)).toBe('state--starting');
      expect(component.getStateClass(SystemTaskState.Cancelled)).toBe('state--cancelled');
    });
  });

  describe('isEmpty', () => {
    it('should return true when tasks array is empty and not loading', async () => {
      apiSpy.listSystemTasks.mockReturnValue(of(createMockPagedResult([])));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isEmpty()).toBe(true);
    });

    it('should return false when tasks exist', async () => {
      apiSpy.listSystemTasks.mockReturnValue(of(createMockPagedResult([createMockSystemTask()])));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isEmpty()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error message on API failure', async () => {
      apiSpy.listSystemTasks.mockReturnValue(throwError(() => new Error('API Error')));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.error()).toBe('Failed to load system tasks');
      expect(component.loading()).toBe(false);
    });
  });

  describe('pagination', () => {
    it('should update totalItems from API response', async () => {
      apiSpy.listSystemTasks.mockReturnValue(of(createMockPagedResult([createMockSystemTask()], {
        totalItems: 50
      })));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.totalItems()).toBe(50);
    });
  });
});
