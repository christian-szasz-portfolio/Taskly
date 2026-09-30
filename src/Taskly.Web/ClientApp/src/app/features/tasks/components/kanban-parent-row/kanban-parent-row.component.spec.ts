import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { createSpyObj, getBaseTestProviders, type MockedObject } from '@testing/test-helpers';
import { Icons } from '../../../../core/icons/icon-registry';
import { KanbanParentRowComponent } from './kanban-parent-row.component';
import { CardTheme, IssueStatus, IssuePriority, IssueType, IssueResolution, SubtaskType } from '../../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import type { KanbanColumnView } from '../../models/task-board.models';
import { TaskNavigationService } from '../../../../core/services/task/task-navigation.service';

describe('KanbanParentRowComponent', () => {
  let fixture: ComponentFixture<KanbanParentRowComponent>;
  let component: KanbanParentRowComponent;
  let taskNavSpy: MockedObject<TaskNavigationService>;

  const mockParent: TaskItem = {
    id: 'parent-1',
    issueKey: 'WF-100',
    title: 'Parent Task',
    description: 'Parent description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: null,
    category: null,
    priority: IssuePriority.High,
    status: IssueStatus.InProgress,
    issueType: IssueType.Story,
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

  const createSubtask = (id: string, status: IssueStatus): Subtask => ({
    id,
    issueKey: `ST-${id}`,
    title: `Subtask ${id}`,
    description: null,
    dueAtUtc: null,
    isCompleted: status === IssueStatus.Done,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: status === IssueStatus.Done ? new Date().toISOString() : null,
    createdBy: 'user@test.com',
    assignedTo: null,
    category: null,
    priority: IssuePriority.Medium,
    status,
    subtaskType: SubtaskType.Development,
    labels: [],
    components: [],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: null,
    position: 0,
    parentTaskItemId: 'parent-1',
    timeSpentMinutes: 0
  });

  const mockSubtasks: Subtask[] = [
    createSubtask('st-1', IssueStatus.Open),
    createSubtask('st-2', IssueStatus.InProgress)
  ];

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

  const mockColumns: KanbanColumnView[] = [
    { status: IssueStatus.Open, title: 'Open', subtitle: 'Ready', accent: CardTheme.Emerald, items: [] },
    { status: IssueStatus.InProgress, title: 'In Progress', subtitle: 'Working', accent: CardTheme.Amber, items: [] },
    { status: IssueStatus.Done, title: 'Done', subtitle: 'Completed', accent: CardTheme.Sky, items: [] }
  ];

  let toggleExpansionId: string | null;
  let droppedPayload: unknown;
  let selectedPayload: unknown;
  let parentSelectedPayload: unknown;
  let resolvedParent: TaskItem | null;

  beforeEach(async () => {
    toggleExpansionId = null;
    droppedPayload = null;
    selectedPayload = null;
    parentSelectedPayload = null;
    resolvedParent = null;

    taskNavSpy = createSpyObj<TaskNavigationService>(['getDetailRoute'], {
      kanbanRoute: signal(['/tasks', 'DEMO']),
      backlogRoute: signal(['/tasks', 'DEMO', 'backlog']),
      resolvedRoute: signal(['/tasks', 'DEMO', 'resolved']),
      epicsRoute: signal(['/tasks', 'DEMO', 'epics'])
    });
    taskNavSpy.getDetailRoute.mockImplementation((issueKey: string) => ['/tasks', 'DEMO', issueKey]);

    await TestBed.configureTestingModule({
      imports: [KanbanParentRowComponent],
      providers: [
        ...getBaseTestProviders(),
        { provide: TaskNavigationService, useValue: taskNavSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanParentRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('parent', mockParent);
    fixture.componentRef.setInput('subtasks', mockSubtasks);
    fixture.componentRef.setInput('isExpanded', true);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('helpers', mockHelpers);
    fixture.componentRef.setInput('addCardIcon', Icons.plus);
    fixture.componentRef.setInput('chevronDown', Icons.chevronDown);
    fixture.componentRef.setInput('chevronRight', Icons.chevronRight);
    fixture.componentRef.setInput('viewIcon', Icons.eye);
    fixture.componentRef.setInput('externalLinkIcon', Icons.externalLinkAlt);
    fixture.componentRef.setInput('resolveIcon', Icons.check);

    component.toggleExpansion.subscribe((id: string) => toggleExpansionId = id);
    component.itemDropped.subscribe((p) => droppedPayload = p);
    component.itemSelected.subscribe((p) => selectedPayload = p);
    component.parentSelected.subscribe((p) => parentSelectedPayload = p);
    component.resolveParent.subscribe((p: TaskItem) => resolvedParent = p);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should receive parent input', () => {
      expect(component.parent()).toEqual(mockParent);
    });

    it('should receive subtasks input', () => {
      expect(component.subtasks()).toEqual(mockSubtasks);
    });

    it('should receive isExpanded input', () => {
      expect(component.isExpanded()).toBe(true);
    });

    it('should receive columns input', () => {
      expect(component.columns()).toEqual(mockColumns);
    });

    it('should receive helpers input', () => {
      expect(component.helpers()).toBe(mockHelpers);
    });

    it('should receive all icon inputs', () => {
      expect(component.addCardIcon()).toBe(Icons.plus);
      expect(component.chevronDown()).toBe(Icons.chevronDown);
      expect(component.chevronRight()).toBe(Icons.chevronRight);
      expect(component.viewIcon()).toBe(Icons.eye);
      expect(component.externalLinkIcon()).toBe(Icons.externalLinkAlt);
      expect(component.resolveIcon()).toBe(Icons.check);
    });
  });

  describe('computed signals', () => {
    describe('subtaskCount', () => {
      it('should return count of subtasks', () => {
        expect(component.subtaskCount()).toBe(2);
      });

      it('should update when subtasks change', async () => {
        fixture.componentRef.setInput('subtasks', [createSubtask('st-1', IssueStatus.Open)]);
        await fixture.whenStable();
        expect(component.subtaskCount()).toBe(1);
      });

      it('should return 0 for empty subtasks', async () => {
        fixture.componentRef.setInput('subtasks', []);
        await fixture.whenStable();
        expect(component.subtaskCount()).toBe(0);
      });
    });

    describe('parentKey', () => {
      it('should return issueKey when available', () => {
        expect(component.parentKey()).toBe('WF-100');
      });

      it('should return id when issueKey is null', async () => {
        fixture.componentRef.setInput('parent', { ...mockParent, issueKey: null });
        await fixture.whenStable();
        expect(component.parentKey()).toBe('parent-1');
      });

      it('should return id when issueKey is undefined', async () => {
        fixture.componentRef.setInput('parent', { ...mockParent, issueKey: undefined });
        await fixture.whenStable();
        expect(component.parentKey()).toBe('parent-1');
      });
    });

    describe('parentDetailRoute', () => {
      it('should return correct route array', () => {
        expect(component.parentDetailRoute()).toEqual(['/tasks', 'DEMO', 'WF-100']);
      });

      it('should use id when issueKey is not available', async () => {
        fixture.componentRef.setInput('parent', { ...mockParent, issueKey: null });
        await fixture.whenStable();
        expect(component.parentDetailRoute()).toEqual(['/tasks', 'DEMO', 'parent-1']);
      });
    });

    describe('allSubtasksDone', () => {
      it('should return false when some subtasks are not done', () => {
        expect(component.allSubtasksDone()).toBe(false);
      });

      it('should return true when all subtasks are done', async () => {
        fixture.componentRef.setInput('subtasks', [
          createSubtask('st-1', IssueStatus.Done),
          createSubtask('st-2', IssueStatus.Done)
        ]);
        await fixture.whenStable();
        expect(component.allSubtasksDone()).toBe(true);
      });

      it('should return false when subtasks array is empty', async () => {
        fixture.componentRef.setInput('subtasks', []);
        await fixture.whenStable();
        expect(component.allSubtasksDone()).toBe(false);
      });

      it('should return false when at least one subtask is not done', async () => {
        fixture.componentRef.setInput('subtasks', [
          createSubtask('st-1', IssueStatus.Done),
          createSubtask('st-2', IssueStatus.InProgress)
        ]);
        await fixture.whenStable();
        expect(component.allSubtasksDone()).toBe(false);
      });
    });
  });

  describe('outputs', () => {
    describe('onToggleExpansion', () => {
      it('should emit parentKey (issueKey when available) on toggleExpansion', () => {
        component.onToggleExpansion();
        expect(toggleExpansionId).toBe('WF-100');
      });

      it('should emit parent id when issueKey is not available', async () => {
        fixture.componentRef.setInput('parent', { ...mockParent, issueKey: null });
        await fixture.whenStable();
        component.onToggleExpansion();
        expect(toggleExpansionId).toBe('parent-1');
      });
    });

    describe('onCardDropped', () => {
      it('should emit itemDropped event with payload', () => {
        const mockPayload = { event: {} as never, status: IssueStatus.Open };
        component.onCardDropped(mockPayload);
        expect(droppedPayload).toEqual(mockPayload);
      });
    });

    describe('onCardSelected', () => {
      it('should emit itemSelected event with payload', () => {
        const subtask = mockSubtasks[0];
        const mockPayload = { task: subtask, event: new Event('click') };
        component.onCardSelected(mockPayload);
        expect(selectedPayload).toEqual(mockPayload);
      });
    });

    describe('onOpenParentPanel', () => {
      it('should emit parentSelected event', () => {
        const event = new Event('click');
        spyOn(event, 'stopPropagation');
        component.onOpenParentPanel(event);
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(parentSelectedPayload).toBeTruthy();
      });
    });

    describe('onResolveParent', () => {
      it('should emit resolveParent event with parent task', () => {
        const event = new Event('click');
        spyOn(event, 'stopPropagation');
        component.onResolveParent(event);
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(resolvedParent).toEqual(mockParent);
      });
    });
  });

  describe('row column height signals', () => {
    it('should have rowColumnHeight signal initialized to null', () => {
      expect(component.rowColumnHeight()).toBeNull();
    });

    it('should have isResizing signal', () => {
      expect(component.isResizing()).toBeDefined();
    });
  });

  describe('expansion state', () => {
    it('should handle collapsed state', async () => {
      fixture.componentRef.setInput('isExpanded', false);
      await fixture.whenStable();
      expect(component.isExpanded()).toBe(false);
    });

    it('should handle expanded state', () => {
      expect(component.isExpanded()).toBe(true);
    });
  });
});
