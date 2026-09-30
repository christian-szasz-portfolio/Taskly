import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { ProjectListComponent } from './project-list.component';
import type { Project } from '../../../../core/models/project.interfaces';
import { ProjectStatus } from '../../../../core/models/task.enums';

describe('ProjectListComponent', (): void => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;

  const createMockProject = (overrides: Partial<Project> = {}): Project => ({
    id: 'project-1',
    key: 'PROJ-1',
    status: ProjectStatus.Inactive,
    title: 'Test Project',
    description: 'A test project description',
    dueAtUtc: '2025-12-31T00:00:00Z',
    isCompleted: false,
    owner: 'Test Owner',
    labels: ['label1'],
    components: ['component1'],
    createdAtUtc: '2025-01-01T00:00:00Z',
    updatedAtUtc: null,
    completedAtUtc: null,
    ...overrides
  });

  const createMockProjects = (count: number): Project[] =>
    Array.from({ length: count }, (_, index) =>
      createMockProject({
        id: `project-${index + 1}`,
        key: `PROJ-${index + 1}`,
        title: `Test Project ${index + 1}`
      })
    );

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
  });

  it('should create', (): void => {
    fixture.componentRef.setInput('projects', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('projects input', (): void => {
    it('should accept empty array', (): void => {
      fixture.componentRef.setInput('projects', []);
      fixture.detectChanges();
      expect(component.projects()).toEqual([]);
    });

    it('should accept array of projects', (): void => {
      const projects = createMockProjects(3);
      fixture.componentRef.setInput('projects', projects);
      fixture.detectChanges();
      expect(component.projects().length).toBe(3);
    });
  });

  describe('trackById', (): void => {
    it('should return project id', (): void => {
      const project = createMockProject({ id: 'unique-id-123' });
      fixture.componentRef.setInput('projects', [project]);
      fixture.detectChanges();

      const result = component.trackById(0, project);
      expect(result).toBe('unique-id-123');
    });

    it('should return different ids for different projects', (): void => {
      const project1 = createMockProject({ id: 'id-1' });
      const project2 = createMockProject({ id: 'id-2' });
      fixture.componentRef.setInput('projects', [project1, project2]);
      fixture.detectChanges();

      expect(component.trackById(0, project1)).toBe('id-1');
      expect(component.trackById(1, project2)).toBe('id-2');
    });
  });

  describe('rendering', (): void => {
    it('should render project cards for each project', (): void => {
      const projects = createMockProjects(3);
      fixture.componentRef.setInput('projects', projects);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const projectCards = compiled.querySelectorAll('app-project-card');
      expect(projectCards.length).toBe(3);
    });

    it('should render no project cards when projects array is empty', (): void => {
      fixture.componentRef.setInput('projects', []);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const projectCards = compiled.querySelectorAll('app-project-card');
      expect(projectCards.length).toBe(0);
    });
  });
});
