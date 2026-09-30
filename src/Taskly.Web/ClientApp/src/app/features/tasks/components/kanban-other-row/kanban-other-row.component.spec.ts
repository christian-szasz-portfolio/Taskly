import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { Icons } from '../../../../core/icons/icon-registry';
import { KanbanOtherRowComponent } from './kanban-other-row.component';
import { CardTheme, IssueStatus, IssuePriority, IssueType, IssueResolution } from '../../../../core/models/task.enums';
import type { TaskItem } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import type { KanbanColumnView } from '../../models/task-board.models';

describe('KanbanOtherRowComponent', () => {
  let fixture: ComponentFixture<KanbanOtherRowComponent>;
  let component: KanbanOtherRowComponent;

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
    { status: IssueStatus.Open, title: 'Open', subtitle: 'Ready to start', accent: CardTheme.Emerald, items: [] },
    { status: IssueStatus.InProgress, title: 'In Progress', subtitle: 'Being worked on', accent: CardTheme.Amber, items: [] }
  ];

  let toggleExpansionCalled: boolean;
  let droppedPayload: unknown;
  let selectedPayload: unknown;

  beforeEach(async () => {
    toggleExpansionCalled = false;
    droppedPayload = null;
    selectedPayload = null;

    await TestBed.configureTestingModule({
      imports: [KanbanOtherRowComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanOtherRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tasks', [mockTask]);
    fixture.componentRef.setInput('isExpanded', true);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('helpers', mockHelpers);
    fixture.componentRef.setInput('addCardIcon', Icons.plus);
    fixture.componentRef.setInput('chevronDown', Icons.chevronDown);
    fixture.componentRef.setInput('chevronRight', Icons.chevronRight);

    component.toggleExpansion.subscribe(() => toggleExpansionCalled = true);
    component.itemDropped.subscribe((p) => droppedPayload = p);
    component.itemSelected.subscribe((p) => selectedPayload = p);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should receive tasks input', () => {
      expect(component.tasks()).toEqual([mockTask]);
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

    it('should receive icon inputs', () => {
      expect(component.addCardIcon()).toBe(Icons.plus);
      expect(component.chevronDown()).toBe(Icons.chevronDown);
      expect(component.chevronRight()).toBe(Icons.chevronRight);
    });
  });

  describe('itemCount computed', () => {
    it('should return count of tasks', () => {
      expect(component.itemCount()).toBe(1);
    });

    it('should update when tasks change', async () => {
      const secondTask: TaskItem = { ...mockTask, id: 'wf-2', issueKey: 'WF-102' };
      fixture.componentRef.setInput('tasks', [mockTask, secondTask]);
      await fixture.whenStable();
      expect(component.itemCount()).toBe(2);
    });

    it('should return 0 for empty tasks', async () => {
      fixture.componentRef.setInput('tasks', []);
      await fixture.whenStable();
      expect(component.itemCount()).toBe(0);
    });
  });

  describe('onToggleExpansion', () => {
    it('should emit toggleExpansion event', () => {
      component.onToggleExpansion();
      expect(toggleExpansionCalled).toBe(true);
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
      const mockPayload = { task: mockTask, event: new Event('click') };
      component.onCardSelected(mockPayload);
      expect(selectedPayload).toEqual(mockPayload);
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

    it('should handle expanded state', async () => {
      fixture.componentRef.setInput('isExpanded', true);
      await fixture.whenStable();
      expect(component.isExpanded()).toBe(true);
    });
  });
});
