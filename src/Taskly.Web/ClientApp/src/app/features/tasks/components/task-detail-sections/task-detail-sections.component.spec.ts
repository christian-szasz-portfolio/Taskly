import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { getBaseTestProviders } from '@testing/test-helpers';
import { Icons } from '../../../../core/icons/icon-registry';
import { TaskDetailSectionsComponent } from './task-detail-sections.component';
import { IssueStatus, IssuePriority, IssueType, IssueResolution, SubtaskType } from '../../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import { environment } from '../../../../../environments/environment';

describe('TaskDetailSectionsComponent', () => {
  let fixture: ComponentFixture<TaskDetailSectionsComponent>;
  let component: TaskDetailSectionsComponent;
  let httpMock: HttpTestingController;

  const mockTask: TaskItem = {
    id: 'wf-1',
    issueKey: 'WF-101',
    title: 'Test Task',
    description: 'Test description with **markdown** content',
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
    labelChipStyle: (label: string) => ({
      backgroundColor: label === 'urgent' ? '#fee2e2' : '#e5e7eb',
      color: label === 'urgent' ? '#dc2626' : '#1f2937'
    }),
    statusIcon: () => Icons.plus,
    statusToken: () => 'In Progress',
    statusColor: () => '#fbbf24',
    issueTypeIcon: () => Icons.plus,
    issueTypeToken: () => 'Story',
    issueTypeColor: () => '#38bdf8',
    subtaskTypeIcon: () => Icons.plus,
    subtaskTypeToken: () => 'Development',
    subtaskTypeColor: () => '#fbbf24',
    priorityIcon: () => Icons.plus,
    priorityToken: () => 'High',
    priorityColor: () => '#ef4444',
    resolutionIcon: () => Icons.plus,
    resolutionToken: () => 'Not Fixed',
    resolutionColor: () => '#94a3b8'
  };

  const mockSectionIcons = {
    description: Icons.description,
    people: Icons.users,
    labels: Icons.tags,
    components: Icons.components,
    dates: Icons.calendar
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailSectionsComponent],
      providers: getBaseTestProviders()
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(TaskDetailSectionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', mockTask);
    fixture.componentRef.setInput('helpers', mockHelpers);
    fixture.componentRef.setInput('sectionIcons', mockSectionIcons);
    await fixture.whenStable();

    // Flush attachment list request from FileAttachmentListComponent
    const attachmentReqs = httpMock.match(`${environment.apiBaseUrl}/attachments/by-task-item/${mockTask.id}`);
    attachmentReqs.forEach((req) => req.flush([]));
  });

  afterEach(() => {
    httpMock.verify();
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

    it('should receive sectionIcons input', () => {
      expect(component.sectionIcons()).toEqual(mockSectionIcons);
    });
  });

  describe('task with full data', () => {
    it('should have description available', () => {
      expect(component.task().description).toBe('Test description with **markdown** content');
    });

    it('should have labels available', () => {
      expect((component.task() as TaskItem).labels).toEqual(['frontend', 'urgent']);
    });

    it('should have components available', () => {
      expect((component.task() as TaskItem).components).toEqual(['UI', 'API']);
    });

    it('should have assignedTo available', () => {
      expect(component.task().assignedTo).toBe('assignee@test.com');
    });

    it('should have reporter available', () => {
      expect(component.task().reporter).toBe('reporter@test.com');
    });

    it('should have dueAtUtc available', () => {
      expect(component.task().dueAtUtc).toBe('2024-12-25T00:00:00Z');
    });
  });

  describe('task with minimal data', () => {
    it('should handle null description', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, description: null });
      await fixture.whenStable();
      expect(component.task().description).toBeNull();
    });

    it('should handle empty labels', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, labels: [] });
      await fixture.whenStable();
      expect((component.task() as TaskItem).labels).toEqual([]);
    });

    it('should handle empty components', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, components: [] });
      await fixture.whenStable();
      expect((component.task() as TaskItem).components).toEqual([]);
    });

    it('should handle null assignedTo', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, assignedTo: null });
      await fixture.whenStable();
      expect(component.task().assignedTo).toBeNull();
    });

    it('should handle null reporter', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, reporter: null });
      await fixture.whenStable();
      expect(component.task().reporter).toBeNull();
    });

    it('should handle null dueAtUtc', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, dueAtUtc: null });
      await fixture.whenStable();
      expect(component.task().dueAtUtc).toBeNull();
    });
  });

  describe('subtask task', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('task', mockSubtask);
      await fixture.whenStable();
    });

    it('should accept subtask as task input', () => {
      expect(component.task()).toEqual(mockSubtask);
    });

    it('should have subtaskType property', () => {
      const task = component.task() as Subtask;
      expect(task.subtaskType).toBe(SubtaskType.Development);
    });

    it('should have parentTaskItemId property', () => {
      const task = component.task() as Subtask;
      expect(task.parentTaskItemId).toBe('parent-1');
    });
  });

  describe('helpers integration', () => {
    it('should provide labelChipStyle for labels', () => {
      const helpers = component.helpers();
      const urgentStyle = helpers.labelChipStyle('urgent');
      expect(urgentStyle?.backgroundColor).toBe('#fee2e2');
      expect(urgentStyle?.color).toBe('#dc2626');
    });

    it('should provide default labelChipStyle for regular labels', () => {
      const helpers = component.helpers();
      const regularStyle = helpers.labelChipStyle('frontend');
      expect(regularStyle?.backgroundColor).toBe('#e5e7eb');
      expect(regularStyle?.color).toBe('#1f2937');
    });

    it('should provide statusToken', () => {
      const helpers = component.helpers();
      expect(helpers.statusToken(IssueStatus.InProgress)).toBe('In Progress');
    });

    it('should provide priorityToken', () => {
      const helpers = component.helpers();
      expect(helpers.priorityToken(IssuePriority.High)).toBe('High');
    });
  });

  describe('sectionIcons integration', () => {
    it('should have description icon', () => {
      expect(component.sectionIcons().description).toBe(Icons.description);
    });

    it('should have people icon', () => {
      expect(component.sectionIcons().people).toBe(Icons.users);
    });

    it('should have labels icon', () => {
      expect(component.sectionIcons().labels).toBe(Icons.tags);
    });

    it('should have components icon', () => {
      expect(component.sectionIcons().components).toBe(Icons.components);
    });

    it('should have dates icon', () => {
      expect(component.sectionIcons().dates).toBe(Icons.calendar);
    });
  });

  describe('host class', () => {
    it('should have task-detail-sections host class', () => {
      const element = fixture.nativeElement as HTMLElement;
      expect(element.classList.contains('task-detail-sections')).toBe(true);
    });
  });

  describe('input changes', () => {
    it('should update when task changes', async () => {
      const newTask = { ...mockTask, title: 'Updated Title' };
      fixture.componentRef.setInput('task', newTask);
      await fixture.whenStable();
      expect(component.task().title).toBe('Updated Title');
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

    it('should update when sectionIcons change', async () => {
      const newIcons = { ...mockSectionIcons, description: Icons.plus };
      fixture.componentRef.setInput('sectionIcons', newIcons);
      await fixture.whenStable();
      expect(component.sectionIcons().description).toBe(Icons.plus);
    });
  });
});
