import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { TaskApiService } from './task-api.service';
import { DemoDataService, DEMO_STORE_PREFIX } from '../demo/demo-data.service';
import type { TaskItem } from '../../models/task.interfaces';
import { IssuePriority, IssueResolution, IssueStatus, IssueType } from '../../models/task.enums';

/**
 * The demo has no backend, so this manager *is* the API for task items. These cases cover the
 * resolution rules specifically: the board's "Close Item?" prompt and the resolved-items list both
 * depend on `resolution` being honoured, and there is no server left to fall back on.
 */
describe('TaskApiService', () => {
  const TASK_ITEMS_KEY = `${DEMO_STORE_PREFIX}taskItems`;

  const seedTask = (overrides: Partial<TaskItem> = {}): TaskItem => ({
    id: 'task-1',
    issueKey: 'DEMO-1',
    title: 'Seeded task',
    description: null,
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: '2026-08-01T00:00:00Z',
    updatedAtUtc: '2026-08-01T00:00:00Z',
    completedAtUtc: null,
    createdBy: 'you@taskly.demo',
    assignedTo: 'you@taskly.demo',
    category: null,
    priority: IssuePriority.Medium,
    status: IssueStatus.InProgress,
    issueType: IssueType.Task,
    labels: [],
    components: [],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: 'you@taskly.demo',
    linkedTaskId: null,
    projectId: 'project-1',
    position: 0,
    timeSpentMinutes: 0,
    ...overrides
  });

  const createManager = (tasks: readonly TaskItem[]): TaskApiService => {
    localStorage.setItem(TASK_ITEMS_KEY, JSON.stringify(tasks));
    TestBed.configureTestingModule({
      providers: [
        TaskApiService,
        DemoDataService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => ({ subscribe: () => undefined }) }) } }
      ]
    });
    return TestBed.inject(TaskApiService);
  };

  afterEach(() => {
    localStorage.removeItem(TASK_ITEMS_KEY);
    TestBed.resetTestingModule();
  });

  describe('updateTask', () => {
    it('honours an explicit Closed resolution when moving an item to Done', async () => {
      const manager = createManager([seedTask()]);

      const updated = await firstValueFrom(
        manager.updateTask('task-1', { status: IssueStatus.Done, resolution: IssueResolution.Closed })
      );

      expect(updated.status).toBe(IssueStatus.Done);
      expect(updated.resolution).toBe(IssueResolution.Closed);
      expect(updated.isCompleted).toBe(true);
    });

    it('defaults to Fixed when Done is reached without an explicit resolution', async () => {
      const manager = createManager([seedTask()]);

      const updated = await firstValueFrom(manager.updateTask('task-1', { status: IssueStatus.Done }));

      expect(updated.resolution).toBe(IssueResolution.Fixed);
    });

    it('reopens a closed item as Fixed so it returns to the board', async () => {
      const manager = createManager([
        seedTask({ status: IssueStatus.Done, resolution: IssueResolution.Closed, isCompleted: true })
      ]);

      const updated = await firstValueFrom(
        manager.updateTask('task-1', { status: IssueStatus.Done, resolution: IssueResolution.Fixed })
      );

      expect(updated.resolution).toBe(IssueResolution.Fixed);
    });

    it('clears the resolution when an item moves back to an open status', async () => {
      const manager = createManager([
        seedTask({ status: IssueStatus.Done, resolution: IssueResolution.Closed, isCompleted: true })
      ]);

      const updated = await firstValueFrom(manager.updateTask('task-1', { status: IssueStatus.Open }));

      expect(updated.resolution).toBe(IssueResolution.NotFixed);
      expect(updated.isCompleted).toBe(false);
    });

    it('persists the resolution so it survives a reload', async () => {
      const manager = createManager([seedTask()]);

      await firstValueFrom(
        manager.updateTask('task-1', { status: IssueStatus.Done, resolution: IssueResolution.Closed })
      );

      const stored = JSON.parse(localStorage.getItem(TASK_ITEMS_KEY) ?? '[]') as TaskItem[];
      expect(stored[0].resolution).toBe(IssueResolution.Closed);
    });
  });

  describe('update', () => {
    it('leaves a closed item closed when the editor resubmits it', async () => {
      const manager = createManager([
        seedTask({ status: IssueStatus.Done, resolution: IssueResolution.Closed, isCompleted: true })
      ]);

      const updated = await firstValueFrom(
        manager.update('task-1', { title: 'Renamed', resolution: IssueResolution.Closed })
      );

      expect(updated.title).toBe('Renamed');
      expect(updated.resolution).toBe(IssueResolution.Closed);
    });

    it('switches a Done item from Fixed to Closed', async () => {
      const manager = createManager([
        seedTask({ status: IssueStatus.Done, resolution: IssueResolution.Fixed, isCompleted: true })
      ]);

      const updated = await firstValueFrom(manager.update('task-1', { resolution: IssueResolution.Closed }));

      expect(updated.resolution).toBe(IssueResolution.Closed);
    });
  });
});
