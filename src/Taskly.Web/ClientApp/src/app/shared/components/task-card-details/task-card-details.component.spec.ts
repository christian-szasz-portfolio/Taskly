import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getDialogTestProviders } from '@testing/test-helpers';
import { TaskCardDetailsComponent } from './task-card-details.component';
import { IssuePriority, IssueStatus } from '../../../core/models/task.enums';
import { createMockTask } from '@testing';

describe('TaskCardDetailsComponent', (): void => {
  let component: TaskCardDetailsComponent;
  let fixture: ComponentFixture<TaskCardDetailsComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [TaskCardDetailsComponent],
      providers: getDialogTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', (): void => {
    fixture.componentRef.setInput('task', createMockTask());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('icons', (): void => {
    it('should have all required icons', (): void => {
      fixture.componentRef.setInput('task', createMockTask());
      fixture.detectChanges();

      expect(component.icons.assignee).toBeDefined();
      expect(component.icons.dueDate).toBeDefined();
      expect(component.icons.priority).toBeDefined();
      expect(component.icons.status).toBeDefined();
      expect(component.icons.labels).toBeDefined();
      expect(component.icons.components).toBeDefined();
    });
  });

  describe('formattedDueDate computed', (): void => {
    it('should format due date correctly', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        dueAtUtc: '2025-12-31T00:00:00Z'
      }));
      fixture.detectChanges();
      expect(component.formattedDueDate()).toBe('Dec 31, 2025');
    });

    it('should return null when due date is null', (): void => {
      fixture.componentRef.setInput('task', createMockTask({ dueAtUtc: null }));
      fixture.detectChanges();
      expect(component.formattedDueDate()).toBeNull();
    });

    it('should return null when due date is undefined', (): void => {
      fixture.componentRef.setInput('task', createMockTask({ dueAtUtc: undefined }));
      fixture.detectChanges();
      expect(component.formattedDueDate()).toBeNull();
    });
  });

  describe('hasDescription computed', (): void => {
    it('should return true when description exists', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        description: 'Some description'
      }));
      fixture.detectChanges();
      expect(component.hasDescription()).toBeTrue();
    });

    it('should return false when description is null', (): void => {
      fixture.componentRef.setInput('task', createMockTask({ description: null }));
      fixture.detectChanges();
      expect(component.hasDescription()).toBeFalse();
    });

    it('should return false when description is empty string', (): void => {
      fixture.componentRef.setInput('task', createMockTask({ description: '' }));
      fixture.detectChanges();
      expect(component.hasDescription()).toBeFalse();
    });
  });

  describe('hasLabels computed', (): void => {
    it('should return true when labels exist', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        labels: ['Label1', 'Label2']
      }));
      fixture.detectChanges();
      expect(component.hasLabels()).toBeTrue();
    });

    it('should return false when labels is empty array', (): void => {
      fixture.componentRef.setInput('task', createMockTask({ labels: [] }));
      fixture.detectChanges();
      expect(component.hasLabels()).toBeFalse();
    });
  });

  describe('hasComponents computed', (): void => {
    it('should return true when components exist', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        components: ['Component1', 'Component2']
      }));
      fixture.detectChanges();
      expect(component.hasComponents()).toBeTrue();
    });

    it('should return false when components is empty array', (): void => {
      fixture.componentRef.setInput('task', createMockTask({ components: [] }));
      fixture.detectChanges();
      expect(component.hasComponents()).toBeFalse();
    });
  });

  describe('priorityLabel computed', (): void => {
    it('should return a priority label', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        priority: IssuePriority.High
      }));
      fixture.detectChanges();
      expect(component.priorityLabel()).toBeTruthy();
      expect(typeof component.priorityLabel()).toBe('string');
    });

    it('should return different labels for different priorities', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        priority: IssuePriority.Low
      }));
      fixture.detectChanges();
      const lowLabel = component.priorityLabel();

      fixture.componentRef.setInput('task', createMockTask({
        priority: IssuePriority.High
      }));
      fixture.detectChanges();
      const highLabel = component.priorityLabel();

      expect(lowLabel).not.toBe(highLabel);
    });
  });

  describe('statusLabel computed', (): void => {
    it('should return a status label', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        status: IssueStatus.InProgress
      }));
      fixture.detectChanges();
      expect(component.statusLabel()).toBeTruthy();
      expect(typeof component.statusLabel()).toBe('string');
    });

    it('should return different labels for different statuses', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        status: IssueStatus.Todo
      }));
      fixture.detectChanges();
      const todoLabel = component.statusLabel();

      fixture.componentRef.setInput('task', createMockTask({
        status: IssueStatus.Done
      }));
      fixture.detectChanges();
      const doneLabel = component.statusLabel();

      expect(todoLabel).not.toBe(doneLabel);
    });
  });

  describe('rendering', (): void => {
    it('should render assignee when provided', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        assignedTo: 'John Doe'
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Assignee');
      expect(compiled.textContent).toContain('John Doe');
    });

    it('should not render assignee when not provided', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        assignedTo: null
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hasAssigneeLabel = Array.from(compiled.querySelectorAll('.detail-label'))
        .some((el) => el.textContent?.includes('Assignee'));
      expect(hasAssigneeLabel).toBeFalse();
    });

    it('should render due date when provided', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        dueAtUtc: '2025-12-31T00:00:00Z'
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Due Date');
      expect(compiled.textContent).toContain('Dec 31, 2025');
    });

    it('should not render due date when not provided', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        dueAtUtc: null
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hasDueDateLabel = Array.from(compiled.querySelectorAll('.detail-label'))
        .some((el) => el.textContent?.includes('Due Date'));
      expect(hasDueDateLabel).toBeFalse();
    });

    it('should always render priority', (): void => {
      fixture.componentRef.setInput('task', createMockTask());
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Priority');
    });

    it('should always render status', (): void => {
      fixture.componentRef.setInput('task', createMockTask());
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Status');
    });

    it('should render description when provided', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        description: '<p>Test description content</p>'
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const descriptionRow = compiled.querySelector('.detail-row--description');
      expect(descriptionRow).toBeTruthy();
      expect(descriptionRow?.textContent).toContain('Test description content');
    });

    it('should not render description section when not provided', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        description: null
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const descriptionRow = compiled.querySelector('.detail-row--description');
      expect(descriptionRow).toBeNull();
    });

    it('should render labels as chips', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        labels: ['Label1', 'Label2', 'Label3']
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Labels');
      expect(compiled.textContent).toContain('Label1');
      expect(compiled.textContent).toContain('Label2');
      expect(compiled.textContent).toContain('Label3');

      const chips = compiled.querySelectorAll('.chip--label');
      expect(chips.length).toBe(3);
    });

    it('should not render labels section when empty', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        labels: []
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hasLabelsLabel = Array.from(compiled.querySelectorAll('.detail-label'))
        .some((el) => el.textContent?.includes('Labels'));
      expect(hasLabelsLabel).toBeFalse();
    });

    it('should render components as chips', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        components: ['Core', 'API', 'Frontend']
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Components');
      expect(compiled.textContent).toContain('Core');
      expect(compiled.textContent).toContain('API');
      expect(compiled.textContent).toContain('Frontend');

      const chips = compiled.querySelectorAll('.chip--component');
      expect(chips.length).toBe(3);
    });

    it('should not render components section when empty', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        components: []
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hasComponentsLabel = Array.from(compiled.querySelectorAll('.detail-label'))
        .some((el) => el.textContent?.includes('Components'));
      expect(hasComponentsLabel).toBeFalse();
    });

    it('should render full task with all details', (): void => {
      fixture.componentRef.setInput('task', createMockTask({
        description: 'Full description',
        assignedTo: 'Full Assignee',
        dueAtUtc: '2025-06-15T00:00:00Z',
        labels: ['FullLabel'],
        components: ['FullComponent']
      }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Full description');
      expect(compiled.textContent).toContain('Full Assignee');
      expect(compiled.textContent).toContain('Jun 15, 2025');
      expect(compiled.textContent).toContain('FullLabel');
      expect(compiled.textContent).toContain('FullComponent');
      expect(compiled.textContent).toContain('Priority');
      expect(compiled.textContent).toContain('Status');
    });
  });
});
