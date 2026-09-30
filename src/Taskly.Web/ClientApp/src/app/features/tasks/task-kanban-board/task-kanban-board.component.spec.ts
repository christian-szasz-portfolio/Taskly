import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { createSpyObj, getDialogTestProviders, type MockedObject } from '@testing/test-helpers';
import { TaskKanbanBoardComponent } from './task-kanban-board.component';
import { TaskStore } from '../../../core/state/task.store';
import { TaskApiService } from '../../../core/services/task/task-api.service';
import { SubtaskApiService, type SubtasksByParent } from '../../../core/services/subtask/subtask-api.service';
import { TaskPresentationStore } from '../services/task-presentation.service';
import { IssueResolution, IssueStatus, SubtaskType, IssuePriority } from '../../../core/models/task.enums';
import type { Subtask, TaskItem } from '../../../core/models/task.interfaces';
import type { KanbanColumnView } from '../models/task-board.models';
import { createMockTask } from '@testing';

describe('TaskKanbanBoardComponent', () => {
  let component: TaskKanbanBoardComponent;
  let fixture: ComponentFixture<TaskKanbanBoardComponent>;
  let taskApiSpy: MockedObject<TaskApiService>;
  let subtaskApiSpy: MockedObject<SubtaskApiService>;
  let dialogSpy: MockedObject<MatDialog>;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown>>;

  const createMockSubtask = (overrides: Partial<Subtask> = {}): Subtask => ({
    id: 'st-1',
    parentTaskItemId: 'wf-1',
    issueKey: 'DEMO-1-1',
    title: 'Test Subtask',
    status: IssueStatus.Open,
    subtaskType: SubtaskType.Development,
    priority: IssuePriority.High,
    createdBy: 'user-1',
    assignedTo: null,
    reporter: null,
    createdAtUtc: '2026-01-01T00:00:00Z',
    isCompleted: false,
    description: null,
    dueAtUtc: null,
    updatedAtUtc: null,
    completedAtUtc: null,
    labels: [],
    components: [],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    position: 0,
    timeSpentMinutes: 0,
    ...overrides
  });

  /** Renders the board over the given tasks and subtasks, and lets the loads settle */
  const renderWith = async (tasks: TaskItem[], subtasks: SubtasksByParent = new Map()): Promise<void> => {
    taskApiSpy.list.mockReturnValue(of(tasks));
    subtaskApiSpy.listByParents.mockReturnValue(of(subtasks));
    // The board loaded as it was built, before these were set
    component.refresh();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    taskApiSpy = createSpyObj<TaskApiService>(['list', 'update', 'updateTask', 'reorder']);
    taskApiSpy.list.mockReturnValue(of([]));

    subtaskApiSpy = createSpyObj<SubtaskApiService>(['listByParents', 'update', 'reorder']);
    subtaskApiSpy.listByParents.mockReturnValue(of(new Map<string, Subtask[]>()));

    dialogRefSpy = createSpyObj(['afterClosed', 'close']);
    dialogRefSpy.afterClosed.mockReturnValue(of(undefined));

    dialogSpy = createSpyObj(['open'], {
      _openDialogs: [],
      openDialogs: []
    });
    dialogSpy.open.mockReturnValue(dialogRefSpy as MatDialogRef<unknown>);

    await TestBed.configureTestingModule({
      imports: [TaskKanbanBoardComponent],
      providers: [
        ...getDialogTestProviders(),
        provideRouter([]),
        provideCharts(withDefaultRegisterables()),
        TaskStore,
        TaskPresentationStore,
        { provide: TaskApiService, useValue: taskApiSpy },
        { provide: SubtaskApiService, useValue: subtaskApiSpy }
      ]
    })
      .overrideComponent(TaskKanbanBoardComponent, {
        add: {
          providers: [{ provide: MatDialog, useValue: dialogSpy }]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskKanbanBoardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load tasks on init', () => {
      fixture.detectChanges();

      expect(taskApiSpy.list).toHaveBeenCalled();
    });

    it('should have initial vm state', () => {
      fixture.detectChanges();

      expect(component.vm().loading).toBe(false);
      expect(component.vm().todos).toEqual([]);
    });
  });

  describe('refresh', () => {
    it('should reload tasks', () => {
      fixture.detectChanges();
      taskApiSpy.list.mockClear();

      component.refresh();

      expect(taskApiSpy.list).toHaveBeenCalledTimes(1);
    });
  });

  describe('stats', () => {
    it('should calculate task statistics', async () => {
      await renderWith([
        createMockTask({ id: '1', status: IssueStatus.Open }),
        createMockTask({ id: '2', status: IssueStatus.InProgress }),
        createMockTask({ id: '3', status: IssueStatus.Done, isCompleted: true })
      ]);

      const stats = component.stats();
      expect(stats.open).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.total).toBe(3);
    });
  });

  describe('board', () => {
    it('should organize tasks into columns by status', async () => {
      await renderWith([
        createMockTask({ id: '1', status: IssueStatus.Open }),
        createMockTask({ id: '2', status: IssueStatus.InProgress })
      ]);

      const board = component.board();
      expect(board.length).toBe(5); // 5 columns

      const openColumn = board.find(c => c.status === IssueStatus.Open);
      expect(openColumn?.items.length).toBe(1);

      const inProgressColumn = board.find(c => c.status === IssueStatus.InProgress);
      expect(inProgressColumn?.items.length).toBe(1);
    });
  });

  describe('panel operations', () => {
    beforeEach(() => fixture.detectChanges());

    it('should start with panel closed', () => {
      expect(component.isPanelOpen()).toBe(false);
      expect(component.selectedTask()).toBeNull();
    });

    it('should open panel with selected task', () => {
      const task = createMockTask();

      component.openDetailPanel(task);

      expect(component.isPanelOpen()).toBe(true);
      expect(component.selectedTask()).toBe(task);
    });

    it('should stop event propagation when opening panel', () => {
      const task = createMockTask();
      const event = new MouseEvent('click');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      component.openDetailPanel(task, event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should close panel', async () => {
      const task = createMockTask();
      component.openDetailPanel(task);

      component.closeDetailPanel();

      expect(component.isPanelOpen()).toBe(false);
      // Wait for the delay to clear the selected task
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(component.selectedTask()).toBeNull();
    });
  });

  describe('create button', () => {
    it('is disabled: the demo creates nothing', () => {
      fixture.detectChanges();

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[aria-label="Create task"]');
      expect(button?.disabled).toBe(true);
    });
  });

  describe('trackById', () => {
    it('should return task id', () => {
      const task = createMockTask({ id: 'test-id' });

      expect(component.trackById(0, task)).toBe('test-id');
    });
  });

  describe('trackByStatus', () => {
    it('should return column status', () => {
      const column: Partial<KanbanColumnView> = { status: IssueStatus.Open, title: 'Open', items: [] };

      expect(component.trackByStatus(0, column as KanbanColumnView)).toBe(IssueStatus.Open);
    });
  });

  describe('statusToken', () => {
    it('should return readable status token', () => {
      expect(component.statusToken(IssueStatus.InProgress)).toBe('In Progress');
    });
  });

  describe('icons', () => {
    it('should expose icon registry', () => {
      expect(component.icons()).toBeDefined();
      expect(component.icons().add).toBeTruthy();
      expect(component.icons().refresh).toBeTruthy();
    });

    it('should expose panel icons', () => {
      expect(component.panelIcons()).toBeDefined();
      expect(component.panelIcons().edit).toBeTruthy();
    });

    it('should expose hero icons', () => {
      expect(component.heroIcons()).toBeDefined();
      expect(component.heroIcons().create).toBeTruthy();
    });
  });

  describe('cardHelpers', () => {
    it('should expose card helper functions', () => {
      expect(component.cardHelpers).toBeDefined();
      expect(component.cardHelpers.statusToken).toBeDefined();
      expect(component.cardHelpers.priorityIcon).toBeDefined();
    });
  });

  describe('insightCards', () => {
    beforeEach(async () => {
      await renderWith([createMockTask({ id: '1', status: IssueStatus.Open })]);
    });

    it('should generate insight cards from stats', () => {
      const cards = component.insightCards();
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.some(c => c.label === 'Open')).toBe(true);
      expect(cards.some(c => c.label === 'Completion')).toBe(true);
    });
  });

  describe('panel resizing', () => {
    beforeEach(() => fixture.detectChanges());

    it('should start resizing on startResize', () => {
      const event = new MouseEvent('mousedown', { clientX: 100 });
      event.preventDefault = vi.fn();

      component.startResize(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should update panel width during resize', () => {
      const startEvent = new MouseEvent('mousedown', { clientX: 500 });
      vi.spyOn(startEvent, 'preventDefault');
      component.startResize(startEvent);

      const initialWidth = component.panelWidth();

      // Simulate mousemove - dragging left increases width
      const moveEvent = new MouseEvent('mousemove', { clientX: 450 });
      component.handleResizeMove(moveEvent);

      expect(component.panelWidth()).toBeGreaterThan(initialWidth);
    });

    it('should not update width when not resizing', () => {
      const initialWidth = component.panelWidth();

      const moveEvent = new MouseEvent('mousemove', { clientX: 200 });
      component.handleResizeMove(moveEvent);

      expect(component.panelWidth()).toBe(initialWidth);
    });

    it('should stop resizing on mouseup', () => {
      const startEvent = new MouseEvent('mousedown', { clientX: 100 });
      vi.spyOn(startEvent, 'preventDefault');
      component.startResize(startEvent);

      component.stopResizing();

      // After stopping, move events should not affect width
      const initialWidth = component.panelWidth();
      const moveEvent = new MouseEvent('mousemove', { clientX: 200 });
      component.handleResizeMove(moveEvent);

      expect(component.panelWidth()).toBe(initialWidth);
    });

    it('should not throw when stopResizing called without starting', () => {
      expect(() => component.stopResizing()).not.toThrow();
    });

    it('should respect minimum panel width', () => {
      const startEvent = new MouseEvent('mousedown', { clientX: 100 });
      vi.spyOn(startEvent, 'preventDefault');
      component.startResize(startEvent);

      // Drag far right to try to make panel too small
      const moveEvent = new MouseEvent('mousemove', { clientX: 1000 });
      component.handleResizeMove(moveEvent);

      expect(component.panelWidth()).toBeGreaterThanOrEqual(320); // minPanelWidth
    });

    it('should respect maximum panel width', () => {
      const startEvent = new MouseEvent('mousedown', { clientX: 500 });
      vi.spyOn(startEvent, 'preventDefault');
      component.startResize(startEvent);

      // Drag far left to try to make panel too large
      const moveEvent = new MouseEvent('mousemove', { clientX: -500 });
      component.handleResizeMove(moveEvent);

      expect(component.panelWidth()).toBeLessThanOrEqual(600); // maxPanelWidth
    });
  });

  describe('row expansion', () => {
    beforeEach(() => fixture.detectChanges());

    it('should toggle row expansion', () => {
      expect(() => component.toggleRowExpansion('test-row')).not.toThrow();
    });
  });

  describe('window resize', () => {
    beforeEach(() => fixture.detectChanges());

    it('should handle window resize', () => {
      expect(() => component.handleWindowResize()).not.toThrow();
    });
  });

  describe('getRowColumns', () => {
    beforeEach(() => fixture.detectChanges());

    it('should return columns for other-issues row', () => {
      const row = {
        type: 'other-issues' as const,
        tasks: [createMockTask({ status: IssueStatus.Open })],
        isExpanded: true
      };

      const columns = component.getRowColumns(row);
      expect(columns.length).toBe(5);
    });

    it('should return columns for parent-with-subtasks row', () => {
      const row = {
        type: 'parent-with-subtasks' as const,
        parent: createMockTask(),
        subtasks: [],
        isExpanded: true
      };

      const columns = component.getRowColumns(row);
      expect(columns.length).toBe(5);
    });
  });

  describe('editFromPanel', () => {
    beforeEach(() => fixture.detectChanges());

    it('should open edit dialog for subtask', () => {
      component.editFromPanel(createMockSubtask());

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('saves the edit the dialog returns', () => {
      const subtask = createMockSubtask();
      const edit = { title: 'Renamed' };
      dialogRefSpy.afterClosed.mockReturnValue(of(edit));
      subtaskApiSpy.update.mockReturnValue(of({ ...subtask, title: 'Renamed' }));

      component.editFromPanel(subtask);

      expect(subtaskApiSpy.update).toHaveBeenCalledWith(subtask.id, edit);
    });
  });

  describe('boardRows', () => {
    it('should create board rows from tasks and subtasks', async () => {
      await renderWith(
        [
          createMockTask({ id: '1', title: 'Task 1', status: IssueStatus.Open }),
          createMockTask({ id: '2', title: 'Task 2', status: IssueStatus.Todo })
        ],
        new Map([['1', [createMockSubtask({ parentTaskItemId: '1' })]]])
      );

      const rows = component.boardRows();
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('onResolveParent', () => {
    beforeEach(async () => {
      await renderWith([createMockTask({ id: '1', status: IssueStatus.Open })]);
    });

    it('closes the parent task, then reloads the board', () => {
      taskApiSpy.updateTask.mockReturnValue(of(createMockTask({ id: '1', status: IssueStatus.Done })));
      taskApiSpy.list.mockClear();

      component.onResolveParent(createMockTask({ id: '1' }));

      expect(taskApiSpy.updateTask).toHaveBeenCalledWith('1', { status: IssueStatus.Done, resolution: IssueResolution.Closed });
      expect(taskApiSpy.list).toHaveBeenCalled();
    });
  });
});
