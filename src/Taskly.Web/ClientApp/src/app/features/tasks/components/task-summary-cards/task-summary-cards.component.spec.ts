import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { Icons } from '../../../../core/icons/icon-registry';
import { TaskSummaryCardsComponent } from './task-summary-cards.component';
import { IssueStatus, IssuePriority, IssueType, IssueResolution, SubtaskType } from '../../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';

describe('TaskSummaryCardsComponent', () => {
  let fixture: ComponentFixture<TaskSummaryCardsComponent>;
  let component: TaskSummaryCardsComponent;

  const mockTask: TaskItem = {
    id: 'wf-1',
    issueKey: 'WF-101',
    title: 'Test Task',
    description: 'Test description',
    dueAtUtc: '2024-12-25T00:00:00Z',
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: 'assignee@test.com',
    category: 'Development',
    priority: IssuePriority.High,
    status: IssueStatus.InProgress,
    issueType: IssueType.Story,
    labels: ['frontend', 'urgent'],
    components: ['UI', 'API'],
    epicKey: 'EPIC-100',
    resolution: IssueResolution.NotFixed,
    reporter: 'reporter@test.com',
    linkedTaskId: null,
    position: 0,
    projectId: 'test-project-id',
    timeSpentMinutes: 0
  };

  const mockSubtask: Subtask = {
    id: 'st-1',
    issueKey: 'ST-101',
    title: 'Test Subtask',
    description: 'Subtask description',
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
    statusToken: (status: IssueStatus) => {
      const tokens: Record<IssueStatus, string> = {
        [IssueStatus.Created]: 'Created',
        [IssueStatus.Open]: 'Open',
        [IssueStatus.Todo]: 'To Do',
        [IssueStatus.InProgress]: 'In Progress',
        [IssueStatus.Testing]: 'Testing',
        [IssueStatus.Done]: 'Done',
        [IssueStatus.Administrative]: 'Administrative'
      };
      return tokens[status];
    },
    statusColor: () => '#34d399',
    issueTypeIcon: () => Icons.plus,
    issueTypeToken: (type: IssueType) => {
      const tokens: Record<IssueType, string> = {
        [IssueType.ProblemCase]: 'Problem Case',
        [IssueType.Bug]: 'Bug',
        [IssueType.Incident]: 'Incident',
        [IssueType.Story]: 'Story',
        [IssueType.Epic]: 'Epic',
        [IssueType.Task]: 'Task',
        [IssueType.TechnicalTask]: 'Technical Task',
        [IssueType.Improvement]: 'Improvement',
        [IssueType.Documentation]: 'Documentation'
      };
      return tokens[type];
    },
    issueTypeColor: () => '#38bdf8',
    subtaskTypeIcon: () => Icons.plus,
    subtaskTypeToken: (type: SubtaskType) => {
      const tokens: Record<SubtaskType, string> = {
        [SubtaskType.Development]: 'Development',
        [SubtaskType.Translations]: 'Translations',
        [SubtaskType.BugInDevelopment]: 'Bug in Development'
      };
      return tokens[type];
    },
    subtaskTypeColor: () => '#fbbf24',
    priorityIcon: () => Icons.plus,
    priorityToken: (priority: IssuePriority) => {
      const tokens: Record<IssuePriority, string> = {
        [IssuePriority.High]: 'High',
        [IssuePriority.Medium]: 'Medium',
        [IssuePriority.Low]: 'Low'
      };
      return tokens[priority];
    },
    priorityColor: () => '#fbbf24',
    resolutionIcon: () => Icons.plus,
    resolutionToken: () => 'Not Fixed',
    resolutionColor: () => '#94a3b8'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSummaryCardsComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(TaskSummaryCardsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', mockTask);
    fixture.componentRef.setInput('helpers', mockHelpers);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should receive task input', () => {
      expect(component.task()).toEqual(mockTask);
    });

    it('should receive helpers input', () => {
      expect(component.helpers()).toBe(mockHelpers);
    });
  });

  describe('isSubtask computed', () => {
    it('should return false for task item', () => {
      expect(component.isSubtask()).toBe(false);
    });

    it('should return true for subtask', async () => {
      fixture.componentRef.setInput('task', mockSubtask);
      await fixture.whenStable();
      expect(component.isSubtask()).toBe(true);
    });

    it('should update when task changes from item to subtask', async () => {
      expect(component.isSubtask()).toBe(false);
      fixture.componentRef.setInput('task', mockSubtask);
      await fixture.whenStable();
      expect(component.isSubtask()).toBe(true);
    });

    it('should update when task changes from subtask to item', async () => {
      fixture.componentRef.setInput('task', mockSubtask);
      await fixture.whenStable();
      expect(component.isSubtask()).toBe(true);
      fixture.componentRef.setInput('task', mockTask);
      await fixture.whenStable();
      expect(component.isSubtask()).toBe(false);
    });
  });

  describe('task item properties', () => {
    it('should have issueType property', () => {
      const task = component.task() as TaskItem;
      expect(task.issueType).toBe(IssueType.Story);
    });

    it('should have status property', () => {
      expect(component.task().status).toBe(IssueStatus.InProgress);
    });

    it('should have priority property', () => {
      expect(component.task().priority).toBe(IssuePriority.High);
    });

    it('should have resolution property', () => {
      const task = component.task() as TaskItem;
      expect(task.resolution).toBe(IssueResolution.NotFixed);
    });

    it('should have issueKey property', () => {
      expect(component.task().issueKey).toBe('WF-101');
    });
  });

  describe('subtask properties', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('task', mockSubtask);
      await fixture.whenStable();
    });

    it('should have subtaskType property', () => {
      const task = component.task() as Subtask;
      expect(task.subtaskType).toBe(SubtaskType.Development);
    });

    it('should have parentTaskItemId property', () => {
      const task = component.task() as Subtask;
      expect(task.parentTaskItemId).toBe('parent-1');
    });

    it('should have status property', () => {
      expect(component.task().status).toBe(IssueStatus.Open);
    });

    it('should have priority property', () => {
      expect(component.task().priority).toBe(IssuePriority.Medium);
    });
  });

  describe('helpers integration', () => {
    it('should provide statusToken', () => {
      const helpers = component.helpers();
      expect(helpers.statusToken(IssueStatus.InProgress)).toBe('In Progress');
      expect(helpers.statusToken(IssueStatus.Open)).toBe('Open');
      expect(helpers.statusToken(IssueStatus.Done)).toBe('Done');
    });

    it('should provide issueTypeToken', () => {
      const helpers = component.helpers();
      expect(helpers.issueTypeToken(IssueType.Story)).toBe('Story');
      expect(helpers.issueTypeToken(IssueType.Bug)).toBe('Bug');
      expect(helpers.issueTypeToken(IssueType.Task)).toBe('Task');
    });

    it('should provide subtaskTypeToken', () => {
      const helpers = component.helpers();
      expect(helpers.subtaskTypeToken(SubtaskType.Development)).toBe('Development');
      expect(helpers.subtaskTypeToken(SubtaskType.Translations)).toBe('Translations');
    });

    it('should provide priorityToken', () => {
      const helpers = component.helpers();
      expect(helpers.priorityToken(IssuePriority.High)).toBe('High');
      expect(helpers.priorityToken(IssuePriority.Medium)).toBe('Medium');
      expect(helpers.priorityToken(IssuePriority.Low)).toBe('Low');
    });

    it('should provide statusIcon', () => {
      const helpers = component.helpers();
      expect(helpers.statusIcon(IssueStatus.InProgress)).toBe(Icons.plus);
    });

    it('should provide issueTypeIcon', () => {
      const helpers = component.helpers();
      expect(helpers.issueTypeIcon(IssueType.Story)).toBe(Icons.plus);
    });

    it('should provide priorityIcon', () => {
      const helpers = component.helpers();
      expect(helpers.priorityIcon(IssuePriority.High)).toBe(Icons.plus);
    });
  });

  describe('host class', () => {
    it('should have task-summary-cards host class', () => {
      const element = fixture.nativeElement as HTMLElement;
      expect(element.classList.contains('task-summary-cards')).toBe(true);
    });
  });

  describe('input changes', () => {
    it('should update when task changes', async () => {
      const newTask: TaskItem = {
        ...mockTask,
        title: 'Updated Title',
        status: IssueStatus.Done,
        priority: IssuePriority.Low
      };
      fixture.componentRef.setInput('task', newTask);
      await fixture.whenStable();
      expect(component.task().title).toBe('Updated Title');
      expect(component.task().status).toBe(IssueStatus.Done);
      expect(component.task().priority).toBe(IssuePriority.Low);
    });

    it('should update when helpers change', async () => {
      const newHelpers: TaskCardHelpers = {
        ...mockHelpers,
        statusToken: () => 'Custom Status'
      };
      fixture.componentRef.setInput('helpers', newHelpers);
      await fixture.whenStable();
      expect(component.helpers().statusToken(IssueStatus.Open)).toBe('Custom Status');
    });
  });

  describe('all issue types', () => {
    const issueTypes = Object.values(IssueType);

    for (const issueType of issueTypes) {
      it(`should handle ${issueType} issue type`, async () => {
        fixture.componentRef.setInput('task', { ...mockTask, issueType });
        await fixture.whenStable();
        const task = component.task() as TaskItem;
        expect(task.issueType).toBe(issueType);
      });
    }
  });

  describe('all subtask types', () => {
    const subtaskTypes = Object.values(SubtaskType);

    for (const subtaskType of subtaskTypes) {
      it(`should handle ${subtaskType} subtask type`, async () => {
        fixture.componentRef.setInput('task', { ...mockSubtask, subtaskType });
        await fixture.whenStable();
        const task = component.task() as Subtask;
        expect(task.subtaskType).toBe(subtaskType);
      });
    }
  });

  describe('all statuses', () => {
    const statuses = Object.values(IssueStatus);

    for (const status of statuses) {
      it(`should handle ${status} status`, async () => {
        fixture.componentRef.setInput('task', { ...mockTask, status });
        await fixture.whenStable();
        expect(component.task().status).toBe(status);
      });
    }
  });

  describe('all priorities', () => {
    const priorities = Object.values(IssuePriority);

    for (const priority of priorities) {
      it(`should handle ${priority} priority`, async () => {
        fixture.componentRef.setInput('task', { ...mockTask, priority });
        await fixture.whenStable();
        expect(component.task().priority).toBe(priority);
      });
    }
  });
});
