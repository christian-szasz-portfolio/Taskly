import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { TaskStore } from './task.store';
import { TaskApiService } from '../services/task/task-api.service';
import { SessionContextService } from '../services/project/session-context.service';
import { IssueStatus } from '../models/task.enums';
import type { TaskItem } from '../models/task.interfaces';
import { createMockTask } from '@testing';

describe('TaskStore', () => {
  let store: TaskStore;
  let apiSpy: MockedObject<TaskApiService>;

  beforeEach(() => {
    apiSpy = createSpyObj<TaskApiService>(['list', 'update', 'updateTask', 'reorder']);
    apiSpy.list.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        { provide: TaskApiService, useValue: apiSpy },
        {
          provide: SessionContextService,
          useValue: { currentProjectId: signal('project-1'), hasActiveProject: signal(true) }
        }
      ]
    });

    store = TestBed.inject(TaskStore);
  });

  /** Loads the given tasks into the store */
  const loadTasks = (tasks: TaskItem[]): void => {
    apiSpy.list.mockReturnValue(of(tasks));
    store.load();
  };

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('vm', () => {
    it('should have initial state', () => {
      const vm = store.vm();
      expect(vm.todos).toEqual([]);
      expect(vm.loading).toBe(false);
      expect(vm.saving).toBe(false);
      expect(vm.error).toBeNull();
    });
  });

  describe('load', () => {
    it('should set loading to true while fetching', () => {
      const response = new Subject<TaskItem[]>();
      apiSpy.list.mockReturnValue(response);

      store.load();
      expect(store.vm().loading).toBe(true);

      response.next([]);
      response.complete();
      expect(store.vm().loading).toBe(false);
    });

    it('lists the active project only', () => {
      store.load();

      expect(apiSpy.list).toHaveBeenCalledWith('project-1');
    });

    it('should populate todos on success', () => {
      loadTasks([createMockTask({ id: 'wf-1' }), createMockTask({ id: 'wf-2' })]);

      expect(store.vm().todos.length).toBe(2);
      expect(store.vm().error).toBeNull();
    });

    it('should set error on failure', () => {
      apiSpy.list.mockReturnValue(throwError(() => new Error('Load failed')));

      store.load();

      expect(store.vm().loading).toBe(false);
      expect(store.vm().error).toBe('Load failed');
    });
  });

  describe('update', () => {
    beforeEach(() => loadTasks([createMockTask({ id: 'wf-1' })]));

    it('should update existing item in todos', () => {
      apiSpy.update.mockReturnValue(of(createMockTask({ id: 'wf-1', title: 'Updated Title' })));

      store.update('wf-1', { title: 'Updated Title' });

      expect(apiSpy.update).toHaveBeenCalledWith('wf-1', { title: 'Updated Title' });
      expect(store.vm().todos[0].title).toBe('Updated Title');
    });

    it('should set saving flag during update', () => {
      const response = new Subject<TaskItem>();
      apiSpy.update.mockReturnValue(response);

      store.update('wf-1', { title: 'Updated' });
      expect(store.vm().saving).toBe(true);

      response.next(createMockTask({ id: 'wf-1' }));
      response.complete();
      expect(store.vm().saving).toBe(false);
    });

    it('should set error on failure', () => {
      apiSpy.update.mockReturnValue(throwError(() => new Error('Item not found')));

      store.update('wf-1', { title: 'Updated' });

      expect(store.vm().error).toBe('Item not found');
    });
  });

  describe('toggleStatus', () => {
    beforeEach(() => {
      loadTasks([createMockTask({ id: 'wf-1' })]);
      apiSpy.updateTask.mockReturnValue(of(createMockTask({ id: 'wf-1' })));
    });

    it('should update status to Done when isCompleted is true', () => {
      store.toggleStatus('wf-1', true);

      expect(apiSpy.updateTask).toHaveBeenCalledWith('wf-1', { status: IssueStatus.Done });
    });

    it('should update status to Open when isCompleted is false', () => {
      store.toggleStatus('wf-1', false);

      expect(apiSpy.updateTask).toHaveBeenCalledWith('wf-1', { status: IssueStatus.Open });
    });
  });

  describe('updateTask', () => {
    beforeEach(() => loadTasks([createMockTask({ id: 'wf-1' })]));

    it('should update task status', () => {
      apiSpy.updateTask.mockReturnValue(of(createMockTask({ id: 'wf-1', status: IssueStatus.Testing })));

      store.updateTask('wf-1', { status: IssueStatus.Testing });

      expect(store.vm().todos[0].status).toBe(IssueStatus.Testing);
    });
  });

  describe('reorderTask', () => {
    beforeEach(() => loadTasks([createMockTask({ id: 'wf-1' })]));

    it('should reorder task', () => {
      apiSpy.reorder.mockReturnValue(of(createMockTask({ id: 'wf-1', position: 3 })));

      store.reorderTask('wf-1', 3);

      expect(apiSpy.reorder).toHaveBeenCalledWith('wf-1', 3);
      expect(store.vm().todos[0].position).toBe(3);
    });
  });
});
