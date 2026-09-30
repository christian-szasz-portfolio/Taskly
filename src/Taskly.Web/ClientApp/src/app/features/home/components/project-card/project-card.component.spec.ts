import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { ProjectCardComponent } from './project-card.component';
import type { Project } from '../../../../core/models/project.interfaces';
import { ProjectStatus } from '../../../../core/models/task.enums';

describe('ProjectCardComponent', (): void => {
  let component: ProjectCardComponent;
  let fixture: ComponentFixture<ProjectCardComponent>;

  const createMockProject = (overrides: Partial<Project> = {}): Project => ({
    id: 'project-1',
    key: 'PROJ-1',
    status: ProjectStatus.Inactive,
    title: 'Test Project',
    description: 'A test project description',
    dueAtUtc: '2025-12-31T00:00:00Z',
    isCompleted: false,
    owner: 'Test Owner',
    labels: ['label1', 'label2'],
    components: ['component1'],
    createdAtUtc: '2025-01-01T00:00:00Z',
    updatedAtUtc: null,
    completedAtUtc: null,
    ...overrides
  });

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ProjectCardComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', (): void => {
    fixture.componentRef.setInput('project', createMockProject());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('projectKey computed', (): void => {
    it('should return project key when defined', (): void => {
      fixture.componentRef.setInput('project', createMockProject({ key: 'MY-KEY' }));
      fixture.detectChanges();
      expect(component.projectKey()).toBe('MY-KEY');
    });

    it('should return "NO KEY" when project key is null', (): void => {
      fixture.componentRef.setInput('project', createMockProject({ key: null }));
      fixture.detectChanges();
      expect(component.projectKey()).toBe('NO KEY');
    });

    it('should return "NO KEY" when project key is undefined', (): void => {
      fixture.componentRef.setInput('project', createMockProject({ key: undefined }));
      fixture.detectChanges();
      expect(component.projectKey()).toBe('NO KEY');
    });
  });

  describe('hasDetails computed', (): void => {
    it('should return true when project has description', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        description: 'Some description',
        labels: [],
        components: [],
        dueAtUtc: null,
        owner: null
      }));
      fixture.detectChanges();
      expect(component.hasDetails()).toBeTrue();
    });

    it('should return true when project has labels', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        description: null,
        labels: ['label1'],
        components: [],
        dueAtUtc: null,
        owner: null
      }));
      fixture.detectChanges();
      expect(component.hasDetails()).toBeTrue();
    });

    it('should return true when project has components', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        description: null,
        labels: [],
        components: ['component1'],
        dueAtUtc: null,
        owner: null
      }));
      fixture.detectChanges();
      expect(component.hasDetails()).toBeTrue();
    });

    it('should return true when project has due date', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        description: null,
        labels: [],
        components: [],
        dueAtUtc: '2025-12-31T00:00:00Z',
        owner: null
      }));
      fixture.detectChanges();
      expect(component.hasDetails()).toBeTrue();
    });

    it('should return true when project has owner', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        description: null,
        labels: [],
        components: [],
        dueAtUtc: null,
        owner: 'Owner Name'
      }));
      fixture.detectChanges();
      expect(component.hasDetails()).toBeTrue();
    });

    it('should return false when project has no details', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        description: null,
        labels: [],
        components: [],
        dueAtUtc: null,
        owner: null
      }));
      fixture.detectChanges();
      expect(component.hasDetails()).toBeFalse();
    });

    it('should return false when description is empty string', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        description: '',
        labels: [],
        components: [],
        dueAtUtc: null,
        owner: ''
      }));
      fixture.detectChanges();
      expect(component.hasDetails()).toBeFalse();
    });
  });

  describe('formattedDueDate computed', (): void => {
    it('should format due date correctly', (): void => {
      fixture.componentRef.setInput('project', createMockProject({
        dueAtUtc: '2025-12-31T00:00:00Z'
      }));
      fixture.detectChanges();
      expect(component.formattedDueDate()).toBe('Dec 31, 2025');
    });

    it('should return null when due date is null', (): void => {
      fixture.componentRef.setInput('project', createMockProject({ dueAtUtc: null }));
      fixture.detectChanges();
      expect(component.formattedDueDate()).toBeNull();
    });

    it('should return null when due date is undefined', (): void => {
      fixture.componentRef.setInput('project', createMockProject({ dueAtUtc: undefined }));
      fixture.detectChanges();
      expect(component.formattedDueDate()).toBeNull();
    });
  });

  describe('isExpanded signal', (): void => {
    it('should be false by default', (): void => {
      fixture.componentRef.setInput('project', createMockProject());
      fixture.detectChanges();
      expect(component.isExpanded()).toBeFalse();
    });
  });

  describe('toggleExpanded', (): void => {
    it('should toggle isExpanded from false to true', (): void => {
      fixture.componentRef.setInput('project', createMockProject());
      fixture.detectChanges();

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      component.toggleExpanded(mockEvent);

      expect(component.isExpanded()).toBeTrue();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should toggle isExpanded from true to false', (): void => {
      fixture.componentRef.setInput('project', createMockProject());
      fixture.detectChanges();
      component.isExpanded.set(true);

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      component.toggleExpanded(mockEvent);

      expect(component.isExpanded()).toBeFalse();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('edit button', (): void => {
    it('is disabled, with the reason: the seeded projects are fixed', (): void => {
      fixture.componentRef.setInput('project', createMockProject());
      fixture.detectChanges();

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.project-card__edit');
      expect(button?.disabled).toBeTrue();
      expect(component.editDisabledNote).toContain('does not allow editing projects');
    });
  });

  describe('icons signal', (): void => {
    it('should have all required icons', (): void => {
      fixture.componentRef.setInput('project', createMockProject());
      fixture.detectChanges();

      const icons = component.icons();
      expect(icons.edit).toBeDefined();
      expect(icons.expand).toBeDefined();
      expect(icons.collapse).toBeDefined();
      expect(icons.owner).toBeDefined();
      expect(icons.dueDate).toBeDefined();
      expect(icons.labels).toBeDefined();
      expect(icons.components).toBeDefined();
    });
  });

  describe('rendering', (): void => {
    it('should render project title', (): void => {
      fixture.componentRef.setInput('project', createMockProject({ title: 'My Test Title' }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('My Test Title');
    });

    it('should render project key', (): void => {
      fixture.componentRef.setInput('project', createMockProject({ key: 'TEST-123' }));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('TEST-123');
    });
  });
});
