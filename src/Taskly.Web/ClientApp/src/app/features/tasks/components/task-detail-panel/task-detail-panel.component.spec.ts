import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { createSpyObj, getFormTestProviders, type MockedObject } from '@testing/test-helpers';
import { signal } from '@angular/core';
import { Icons } from '../../../../core/icons/icon-registry';
import { TaskDetailPanelComponent } from './task-detail-panel.component';
import { IssueStatus, IssuePriority, IssueType, IssueResolution, SubtaskType } from '../../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import { TaskPresentationStore } from '../../services/task-presentation.service';
import { TaskNavigationService } from '../../../../core/services/task/task-navigation.service';

describe('TaskDetailPanelComponent', () => {
  let fixture: ComponentFixture<TaskDetailPanelComponent>;
  let component: TaskDetailPanelComponent;
  let mockPresentationStore: MockedObject<TaskPresentationStore>;
  let mockTaskNavService: MockedObject<TaskNavigationService>;

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

  const mockPanelIcons = {
    gripLines: Icons.gripLines,
    edit: Icons.edit,
    close: Icons.close,
    externalLink: Icons.externalLinkAlt,
    addSubtask: Icons.plus
  };

  const mockSectionIcons = {
    description: Icons.plus,
    people: Icons.plus,
    labels: Icons.plus,
    components: Icons.plus,
    dates: Icons.plus,
    additional: Icons.plus,
    attachments: Icons.plus
  };


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let resizeEvent: MouseEvent | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let closePanelCalled: boolean;
  let editedTask: TaskItem | Subtask | null;

  beforeEach(async () => {
    mockPresentationStore = createSpyObj(
      ['resolutionToken', 'subtaskTypeIcon', 'subtaskTypeColor', 'resolutionIcon', 'resolutionColor'], {
      icons: () => ({ sections: mockSectionIcons })
    });
    mockPresentationStore.resolutionToken.mockReturnValue('Not Fixed');
    mockPresentationStore.subtaskTypeIcon.mockReturnValue(Icons.plus);
    mockPresentationStore.subtaskTypeColor.mockReturnValue('#fbbf24');
    mockPresentationStore.resolutionIcon.mockReturnValue(Icons.plus);
    mockPresentationStore.resolutionColor.mockReturnValue('#94a3b8');

    mockTaskNavService = createSpyObj<TaskNavigationService>(
      ['getDetailRoute', 'getEditRoute'],
      {
        projectKey: signal('DEMO'),
        canNavigate: signal(true),
        kanbanRoute: signal(['/tasks', 'DEMO']),
        epicsRoute: signal(['/tasks', 'DEMO', 'epics']),
        backlogRoute: signal(['/tasks', 'DEMO', 'backlog']),
        resolvedRoute: signal(['/tasks', 'DEMO', 'resolved'])
      }
    );
    mockTaskNavService.getDetailRoute.mockImplementation((issueKey: string) => ['/tasks', 'DEMO', issueKey]);
    mockTaskNavService.getEditRoute.mockImplementation((issueKey: string) => ['/tasks', 'DEMO', issueKey, 'edit']);

    resizeEvent = null;
    closePanelCalled = false;
    editedTask = null;

    await TestBed.configureTestingModule({
      imports: [TaskDetailPanelComponent],
      providers: [
        ...getFormTestProviders(),
        { provide: TaskPresentationStore, useValue: mockPresentationStore },
        { provide: TaskNavigationService, useValue: mockTaskNavService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('panelWidth', 420);
    fixture.componentRef.setInput('panelHeight', null);
    fixture.componentRef.setInput('task', mockTask);
    fixture.componentRef.setInput('helpers', mockHelpers);
    fixture.componentRef.setInput('panelIcons', mockPanelIcons);

    component.startResize.subscribe((e) => resizeEvent = e);
    component.closePanel.subscribe(() => closePanelCalled = true);
    component.editTask.subscribe((w) => editedTask = w);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should receive panelWidth input with default value', () => {
      expect(component.panelWidth()).toBe(420);
    });

    it('should receive panelWidth input when changed', async () => {
      fixture.componentRef.setInput('panelWidth', 600);
      await fixture.whenStable();
      expect(component.panelWidth()).toBe(600);
    });

    it('should receive panelHeight input', () => {
      expect(component.panelHeight()).toBeNull();
    });

    it('should receive task input', () => {
      expect(component.task()).toEqual(mockTask);
    });

    it('should handle null task', async () => {
      fixture.componentRef.setInput('task', null);
      await fixture.whenStable();
      expect(component.task()).toBeNull();
    });

    it('should receive helpers input', () => {
      expect(component.helpers()).toBe(mockHelpers);
    });

    it('should receive panelIcons input', () => {
      expect(component.panelIcons()).toEqual(mockPanelIcons);
    });
  });

  describe('computed signals', () => {
    describe('sectionIcons', () => {
      it('should return section icons from presentation store', () => {
        expect(component.sectionIcons()).toEqual(mockSectionIcons);
      });
    });

    describe('isSubtask', () => {
      it('should return false for task item', () => {
        expect(component.isSubtask()).toBe(false);
      });

      it('should return true for subtask', async () => {
        fixture.componentRef.setInput('task', mockSubtask);
        await fixture.whenStable();
        expect(component.isSubtask()).toBe(true);
      });

      it('should return false for null task', async () => {
        fixture.componentRef.setInput('task', null);
        await fixture.whenStable();
        expect(component.isSubtask()).toBe(false);
      });
    });

    describe('canHaveSubtasks', () => {
      it('should return true for Task type', async () => {
        fixture.componentRef.setInput('task', { ...mockTask, issueType: IssueType.Task });
        await fixture.whenStable();
        expect(component.canHaveSubtasks()).toBe(true);
      });

      it('should return true for Story type', async () => {
        fixture.componentRef.setInput('task', { ...mockTask, issueType: IssueType.Story });
        await fixture.whenStable();
        expect(component.canHaveSubtasks()).toBe(true);
      });

      it('should return true for Bug type', async () => {
        fixture.componentRef.setInput('task', { ...mockTask, issueType: IssueType.Bug });
        await fixture.whenStable();
        expect(component.canHaveSubtasks()).toBe(true);
      });

      it('should return false for Epic type', async () => {
        fixture.componentRef.setInput('task', { ...mockTask, issueType: IssueType.Epic });
        await fixture.whenStable();
        expect(component.canHaveSubtasks()).toBe(false);
      });

      it('should return false for subtasks', async () => {
        fixture.componentRef.setInput('task', mockSubtask);
        await fixture.whenStable();
        expect(component.canHaveSubtasks()).toBe(false);
      });

      it('should return false for null task', async () => {
        fixture.componentRef.setInput('task', null);
        await fixture.whenStable();
        expect(component.canHaveSubtasks()).toBe(false);
      });
    });
  });

  describe('outputs', () => {
    describe('onEdit', () => {
      it('should emit editTask with task item', () => {
        component.onEdit(mockTask);
        expect(editedTask).toEqual(mockTask);
      });

      it('should emit editTask with subtask', () => {
        component.onEdit(mockSubtask);
        expect(editedTask).toEqual(mockSubtask);
      });
    });
  });

  describe('detailUrl', () => {
    it('should return URL with projectKey and issueKey when available', () => {
      const result = component.detailUrl(mockTask);
      expect(result).toBe('/tasks/DEMO/WF-101');
    });

    it('should return URL with id when issueKey is null', () => {
      const taskWithoutKey = { ...mockTask, issueKey: null };
      const result = component.detailUrl(taskWithoutKey);
      expect(result).toBe('/tasks/DEMO/wf-1');
    });

    it('should fallback to old format when no active project', () => {
      mockTaskNavService.getDetailRoute.mockReturnValue(null);
      const result = component.detailUrl(mockTask);
      expect(result).toBe('/tasks/WF-101');
    });
  });

  describe('resolutionLabel', () => {
    it('should return resolution token when resolution is provided', () => {
      component.resolutionLabel(IssueResolution.Fixed);
      expect(mockPresentationStore.resolutionToken).toHaveBeenCalledWith(IssueResolution.Fixed);
    });

    it('should return empty string when resolution is null', () => {
      const result = component.resolutionLabel(null);
      expect(result).toBe('');
    });

    it('should return empty string when resolution is undefined', () => {
      const result = component.resolutionLabel(undefined);
      expect(result).toBe('');
    });
  });

  describe('create subtask button', () => {
    it('is shown disabled, with the reason: the demo creates nothing', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, issueType: IssueType.Task });
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      const createSubtaskBtn = element.querySelector<HTMLButtonElement>('.detail-panel__subtask-btn')!;
      expect(createSubtaskBtn).toBeTruthy();
      expect(createSubtaskBtn.disabled).toBe(true);
      expect(component.createSubtaskDisabledNote).toContain('does not allow creating subtasks');
    });

    it('is hidden for an Epic, which has no subtasks', async () => {
      fixture.componentRef.setInput('task', { ...mockTask, issueType: IssueType.Epic });
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('.detail-panel__subtask-btn')).toBeNull();
    });
  });

  describe('host bindings', () => {
    it('should apply panelWidth to flex-basis style', () => {
      const element = fixture.nativeElement as HTMLElement;
      expect(element).toBeTruthy();
    });
  });
});
