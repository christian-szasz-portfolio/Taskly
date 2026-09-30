import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { spyOn, getDialogTestProviders } from '@testing/test-helpers';
import { SubtaskEditorFormComponent } from './subtask-editor-form.component';
import { TaskStore } from '../../../core/state/task.store';
import { TaskPresentationStore } from '../services/task-presentation.service';
import { IssuePriority, IssueResolution, IssueStatus, SubtaskType } from '../../../core/models/task.enums';
import type { Subtask } from '../../../core/models/task.interfaces';

describe('SubtaskEditorFormComponent', () => {
  let component: SubtaskEditorFormComponent;
  let fixture: ComponentFixture<SubtaskEditorFormComponent>;

  const createMockSubtask = (overrides: Partial<Subtask> = {}): Subtask => ({
    id: 'subtask-1',
    issueKey: 'ST-101',
    title: 'Test Subtask',
    description: 'Test subtask description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: 'dev@test.com',
    category: 'Development',
    priority: IssuePriority.Medium,
    status: IssueStatus.Open,
    subtaskType: SubtaskType.Development,
    labels: ['Label1'],
    components: ['Component1'],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: 'reporter@test.com',
    position: 0,
    parentTaskItemId: 'parent-1',
    timeSpentMinutes: 0,
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtaskEditorFormComponent],
      providers: [
        ...getDialogTestProviders(),
        TaskStore,
        TaskPresentationStore
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtaskEditorFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('before a subtask is given', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have default priority as Medium', () => {
      expect(component.subtaskForm.priority().value()).toBe(IssuePriority.Medium);
    });

    it('should have default subtask type as Development', () => {
      expect(component.subtaskForm.subtaskType().value()).toBe(SubtaskType.Development);
    });

    it('should emit cancelled event when cancel is called', () => {
      const cancelledSpy = spyOn(component.cancelled, 'emit');

      component.cancel();

      expect(cancelledSpy).toHaveBeenCalled();
    });

    it('should not show resolution field without a subtask', () => {
      expect(component.showResolutionField()).toBe(false);
    });
  });

  describe('with a subtask', () => {
    const mockSubtask = createMockSubtask();

    beforeEach(() => {
      fixture.componentRef.setInput('subtask', mockSubtask);
      fixture.detectChanges();

    });

    it('should populate form with subtask data', () => {
      expect(component.subtaskForm.title().value()).toBe(mockSubtask.title);
      expect(component.subtaskForm.priority().value()).toBe(mockSubtask.priority);
    });

    it('should not show resolution field when status is not Done', () => {
      expect(component.showResolutionField()).toBe(false);
    });
  });

  describe('with a Done subtask', () => {
    const doneSubtask = createMockSubtask({
      status: IssueStatus.Done,
      resolution: IssueResolution.Fixed
    });

    beforeEach(() => {
      fixture.componentRef.setInput('subtask', doneSubtask);
      fixture.detectChanges();

    });

    it('should show resolution field when status is Done and resolution is Fixed', () => {
      expect(component.showResolutionField()).toBe(true);
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have title as required', () => {
      component.subtaskForm.title().value.set('');

      expect(component.hasError(component.subtaskForm.title, 'required')).toBe(true);
    });

    it('should have assignedTo as required', () => {
      component.subtaskForm.assignedTo().value.set('');

      expect(component.hasError(component.subtaskForm.assignedTo, 'required')).toBe(true);
    });

    it('should pass validation with valid data', () => {
      component.subtaskForm.title().value.set('Valid Title');
      component.subtaskForm.assignedTo().value.set('user@test.com');

      expect(component.hasError(component.subtaskForm.title, 'required')).toBe(false);
      expect(component.hasError(component.subtaskForm.assignedTo, 'required')).toBe(false);
    });
  });

  describe('chip operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add component chip', () => {
      const mockEvent = {
        value: 'NewComponent',
        chipInput: { clear: vi.fn() }
      };

      component.addComponentChip(mockEvent as never);

      expect(component.subtaskForm.components().value()).toContain('NewComponent');
      expect(mockEvent.chipInput.clear).toHaveBeenCalled();
    });

    it('should remove component chip', () => {
      component.subtaskForm.components().value.set(['Component1', 'Component2']);

      component.removeComponentChip('Component1');

      expect(component.subtaskForm.components().value()).not.toContain('Component1');
      expect(component.subtaskForm.components().value()).toContain('Component2');
    });

    it('should add label chip', () => {
      const mockEvent = {
        value: 'NewLabel',
        chipInput: { clear: vi.fn() }
      };

      component.addLabelChip(mockEvent as never);

      expect(component.subtaskForm.labels().value()).toContain('NewLabel');
      expect(mockEvent.chipInput.clear).toHaveBeenCalled();
    });

    it('should remove label chip', () => {
      component.subtaskForm.labels().value.set(['Label1', 'Label2']);

      component.removeLabelChip('Label1');

      expect(component.subtaskForm.labels().value()).not.toContain('Label1');
      expect(component.subtaskForm.labels().value()).toContain('Label2');
    });

    it('should not add duplicate component chips', () => {
      component.subtaskForm.components().value.set(['ExistingComponent']);
      const mockEvent = {
        value: 'ExistingComponent',
        chipInput: { clear: vi.fn() }
      };

      component.addComponentChip(mockEvent as never);

      expect(component.subtaskForm.components().value().length).toBe(1);
    });
  });

  describe('priority and type changes', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle priority change', () => {
      const mockEvent = { value: IssuePriority.High };

      component.handlePriorityChange(mockEvent as never);

      expect(component.subtaskForm.priority().value()).toBe(IssuePriority.High);
    });

    it('should handle subtask type change', () => {
      const mockEvent = { value: SubtaskType.Translations };

      component.handleSubtaskTypeChange(mockEvent as never);

      expect(component.subtaskForm.subtaskType().value()).toBe(SubtaskType.Translations);
    });

    it('should handle resolution change', () => {
      const mockEvent = { value: IssueResolution.Closed };

      component.handleResolutionChange(mockEvent as never);

      expect(component.subtaskForm.resolution().value()).toBe(IssueResolution.Closed);
    });
  });

  describe('description handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle description change', () => {
      component.handleDescriptionChange('<p>Test description</p>');

      expect(component.subtaskForm.description().value()).toBe('<p>Test description</p>');
    });

    it('should calculate description length excluding HTML tags', () => {
      component.subtaskForm.description().value.set('<p>Hello World</p>');

      expect(component.descriptionLength()).toBe(11);
    });
  });

  describe('options', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have priority options', () => {
      expect(component.priorityOptions().length).toBeGreaterThan(0);
    });

    it('should have subtask type options', () => {
      expect(component.subtaskTypeOptions().length).toBe(3);
    });

    it('should have resolution options', () => {
      expect(component.resolutionOptions().length).toBe(2);
    });

    it('should return selected subtask type option', () => {
      component.subtaskForm.subtaskType().value.set(SubtaskType.Development);

      const selected = component.selectedSubtaskTypeOption();

      expect(selected?.value).toBe(SubtaskType.Development);
    });

    it('should return selected resolution option', () => {
      component.subtaskForm.resolution().value.set(IssueResolution.Fixed);

      const selected = component.selectedResolutionOption();

      expect(selected?.value).toBe(IssueResolution.Fixed);
    });
  });

  describe('computed properties', () => {
    it('should return true for isDialogAppearance when appearance is dialog', () => {
      fixture.componentRef.setInput('appearance', 'dialog');
      fixture.detectChanges();

      expect(component.isDialogAppearance()).toBe(true);
    });

    it('should return false for isDialogAppearance when appearance is page', () => {
      fixture.componentRef.setInput('appearance', 'page');
      fixture.detectChanges();

      expect(component.isDialogAppearance()).toBe(false);
    });
  });

  describe('icons', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should expose close icon', () => {
      expect(component.icons().close).toBeDefined();
    });
  });
});
