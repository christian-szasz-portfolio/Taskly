import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { Icons } from '../../../../core/icons/icon-registry';
import { TaskColumnComponent } from './task-column.component';
import { CardTheme, IssueStatus, IssuePriority, IssueType, IssueResolution, SubtaskType } from '../../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import type { KanbanColumnView } from '../../models/task-board.models';

describe('TaskColumnComponent', () => {
  let fixture: ComponentFixture<TaskColumnComponent>;
  let component: TaskColumnComponent;

  const mockTask: TaskItem = {
    id: 'wf-1',
    issueKey: 'WF-101',
    title: 'Test Task',
    description: 'Test description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: null,
    category: null,
    priority: IssuePriority.Medium,
    status: IssueStatus.Open,
    issueType: IssueType.Task,
    labels: [],
    components: [],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: null,
    linkedTaskId: null,
    position: 0,
    projectId: 'test-project-id',
    timeSpentMinutes: 0
  };

  const mockSubtask: Subtask = {
    id: 'st-1',
    issueKey: 'ST-101',
    title: 'Test Subtask',
    description: null,
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: null,
    category: null,
    priority: IssuePriority.Medium,
    status: IssueStatus.Open,
    subtaskType: SubtaskType.Development,
    labels: [],
    components: [],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: null,
    position: 0,
    parentTaskItemId: 'parent-1',
    timeSpentMinutes: 0
  };

  const mockHelpers: TaskCardHelpers = {
    labelChipStyle: () => ({ backgroundColor: '#e5e7eb', color: '#1f2937' }),
    statusIcon: () => Icons.plus,
    statusToken: () => 'Open',
    statusColor: () => '#34d399',
    issueTypeIcon: () => Icons.plus,
    issueTypeToken: () => 'Task',
    issueTypeColor: () => '#38bdf8',
    subtaskTypeIcon: () => Icons.plus,
    subtaskTypeToken: () => 'Development',
    subtaskTypeColor: () => '#fbbf24',
    priorityIcon: () => Icons.plus,
    priorityToken: () => 'Medium',
    priorityColor: () => '#fbbf24',
    resolutionIcon: () => Icons.plus,
    resolutionToken: () => 'Not Fixed',
    resolutionColor: () => '#94a3b8'
  };

  const mockColumn: KanbanColumnView = {
    status: IssueStatus.Open,
    title: 'Open',
    subtitle: 'Ready to start',
    accent: CardTheme.Emerald,
    items: [mockTask]
  };

  let droppedPayload: unknown;
  let selectedPayload: unknown;

  beforeEach(async () => {
    droppedPayload = null;
    selectedPayload = null;

    await TestBed.configureTestingModule({
      imports: [TaskColumnComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(TaskColumnComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('column', mockColumn);
    fixture.componentRef.setInput('helpers', mockHelpers);
    fixture.componentRef.setInput('addCardIcon', Icons.plus);
    fixture.componentRef.setInput('columnHeight', null);

    component.cardDropped.subscribe((p) => droppedPayload = p);
    component.cardSelected.subscribe((p) => selectedPayload = p);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should receive column input', () => {
      expect(component.column()).toEqual(mockColumn);
    });

    it('should receive helpers input', () => {
      expect(component.helpers()).toBe(mockHelpers);
    });

    it('should receive addCardIcon input', () => {
      expect(component.addCardIcon()).toBe(Icons.plus);
    });

    it('should receive columnHeight input', () => {
      expect(component.columnHeight()).toBeNull();
    });

    it('should update columnHeight when input changes', async () => {
      fixture.componentRef.setInput('columnHeight', 500);
      await fixture.whenStable();
      expect(component.columnHeight()).toBe(500);
    });
  });

  describe('hostHeight', () => {
    it('should return null when columnHeight is null', () => {
      expect(component.hostHeight).toBeNull();
    });

    it('should return null when columnHeight is 0', async () => {
      fixture.componentRef.setInput('columnHeight', 0);
      await fixture.whenStable();
      expect(component.hostHeight).toBeNull();
    });

    it('should return null when columnHeight is negative', async () => {
      fixture.componentRef.setInput('columnHeight', -100);
      await fixture.whenStable();
      expect(component.hostHeight).toBeNull();
    });

    it('should return height value when columnHeight is positive', async () => {
      fixture.componentRef.setInput('columnHeight', 500);
      await fixture.whenStable();
      expect(component.hostHeight).toBe(500);
    });
  });

  describe('elementRef', () => {
    it('should have elementRef defined', () => {
      expect(component.elementRef).toBeDefined();
      expect(component.elementRef.nativeElement).toBeTruthy();
    });
  });

  describe('onDrop', () => {
    it('should emit cardDropped with event and status', () => {
      const mockEvent = { previousIndex: 0, currentIndex: 1 } as never;
      component.onDrop(mockEvent);

      const payload = droppedPayload as { event: unknown; status: IssueStatus };
      expect(payload.event).toBe(mockEvent);
      expect(payload.status).toBe(IssueStatus.Open);
    });
  });

  describe('onCardSelected', () => {
    it('should emit cardSelected with task and event', () => {
      const event = new Event('click');
      component.onCardSelected(mockTask, event);

      const payload = selectedPayload as { task: TaskItem; event: Event };
      expect(payload.task).toBe(mockTask);
      expect(payload.event).toBe(event);
    });

    it('should emit cardSelected for subtask', () => {
      const event = new Event('click');
      component.onCardSelected(mockSubtask, event);

      const payload = selectedPayload as { task: Subtask; event: Event };
      expect(payload.task).toBe(mockSubtask);
    });
  });

  describe('trackByTaskId', () => {
    it('should return item id', () => {
      const result = component.trackByTaskId(0, mockTask);
      expect(result).toBe('wf-1');
    });

    it('should return subtask id', () => {
      const result = component.trackByTaskId(0, mockSubtask);
      expect(result).toBe('st-1');
    });
  });

  describe('getIssueTypeDisplay', () => {
    it('should return issueType token for task', () => {
      const result = component.getIssueTypeDisplay(mockTask);
      expect(result).toBe('Task');
    });

    it('should return subtaskType token for subtask', () => {
      const result = component.getIssueTypeDisplay(mockSubtask);
      expect(result).toBe('Development');
    });
  });

  describe('getIssueTypeIcon', () => {
    it('should return issueType icon for task', () => {
      const result = component.getIssueTypeIcon(mockTask);
      expect(result).toBe(Icons.plus);
    });

    it('should return subtaskType icon for subtask', () => {
      const result = component.getIssueTypeIcon(mockSubtask);
      expect(result).toBe(Icons.plus);
    });
  });

  describe('isSubtask', () => {
    it('should return false for task item', () => {
      expect(component.isSubtask(mockTask)).toBe(false);
    });

    it('should return true for subtask', () => {
      expect(component.isSubtask(mockSubtask)).toBe(true);
    });
  });

  describe('isSubtaskDone', () => {
    it('should return false for task item', () => {
      expect(component.isSubtaskDone(mockTask)).toBe(false);
    });

    it('should return false for subtask that is not done', () => {
      expect(component.isSubtaskDone(mockSubtask)).toBe(false);
    });

    it('should return true for subtask that is done', () => {
      const doneSubtask: Subtask = { ...mockSubtask, status: IssueStatus.Done };
      expect(component.isSubtaskDone(doneSubtask)).toBe(true);
    });
  });

  describe('getSubtaskDisplayKey', () => {
    it('should return null for task item', () => {
      expect(component.getSubtaskDisplayKey(mockTask)).toBeNull();
    });

    it('should return issueKey when available for subtask', () => {
      expect(component.getSubtaskDisplayKey(mockSubtask)).toBe('ST-101');
    });

    it('should return shortened ID when issueKey is null', () => {
      const subtaskWithoutKey: Subtask = { ...mockSubtask, issueKey: null };
      const result = component.getSubtaskDisplayKey(subtaskWithoutKey);
      expect(result).toBe('ST-ST-1');
    });

    it('should return shortened ID when issueKey is undefined', () => {
      const subtaskWithoutKey: Subtask = { ...mockSubtask, issueKey: undefined };
      const result = component.getSubtaskDisplayKey(subtaskWithoutKey);
      expect(result).toContain('ST-');
    });
  });

  describe('column with multiple items', () => {
    it('should handle column with multiple tasks', async () => {
      const secondTask: TaskItem = { ...mockTask, id: 'wf-2', issueKey: 'WF-102' };
      fixture.componentRef.setInput('column', {
        ...mockColumn,
        items: [mockTask, secondTask]
      });
      await fixture.whenStable();
      expect(component.column().items.length).toBe(2);
    });

    it('should handle empty column', async () => {
      fixture.componentRef.setInput('column', { ...mockColumn, items: [] });
      await fixture.whenStable();
      expect(component.column().items.length).toBe(0);
    });

    it('should handle mixed task and subtask items', async () => {
      fixture.componentRef.setInput('column', {
        ...mockColumn,
        items: [mockTask, mockSubtask]
      });
      await fixture.whenStable();
      expect(component.column().items.length).toBe(2);
      expect(component.isSubtask(component.column().items[0])).toBe(false);
      expect(component.isSubtask(component.column().items[1])).toBe(true);
    });
  });
});
