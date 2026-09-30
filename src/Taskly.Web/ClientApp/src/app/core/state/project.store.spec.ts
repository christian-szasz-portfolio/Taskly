import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { ProjectStore } from './project.store';
import { ProjectApiService } from '../services/project/project-api.service';
import { SessionContextService } from '../services/project/session-context.service';
import type { Project } from '../models/project.interfaces';
import { ProjectStatus } from '../models/task.enums';

describe('ProjectStore', () => {
  let store: ProjectStore;
  let apiSpy: MockedObject<ProjectApiService>;
  let sessionContextSpy: MockedObject<SessionContextService>;
  let currentProjectSignal: ReturnType<typeof signal<Project | null>>;
  let currentProjectIdSignal: ReturnType<typeof signal<string | null>>;

  const createMockProject = (overrides: Partial<Project> = {}): Project => ({
    id: 'project-1',
    key: 'DEMO',
    title: 'Demo Project',
    description: 'Test description',
    status: ProjectStatus.Inactive,
    createdAtUtc: '2026-01-01T00:00:00Z',
    updatedAtUtc: null,
    isCompleted: false,
    labels: [],
    components: [],
    ...overrides
  });

  beforeEach(() => {
    currentProjectSignal = signal<Project | null>(null);
    currentProjectIdSignal = signal<string | null>(null);

    apiSpy = createSpyObj<ProjectApiService>(
      ['list', 'activate', 'deactivate']
    );
    apiSpy.list.mockReturnValue(of([]));
    apiSpy.activate.mockReturnValue(of(createMockProject({ status: ProjectStatus.Active })));
    apiSpy.deactivate.mockReturnValue(of(createMockProject({ status: ProjectStatus.Inactive })));

    sessionContextSpy = createSpyObj<SessionContextService>(
      ['setActiveProject', 'syncProject', 'isProjectActive'],
      {
        currentProject: currentProjectSignal.asReadonly(),
        currentProjectId: currentProjectIdSignal.asReadonly()
      }
    );
    sessionContextSpy.isProjectActive.mockReturnValue(false);

    TestBed.configureTestingModule({
      providers: [
        ProjectStore,
        { provide: ProjectApiService, useValue: apiSpy },
        { provide: SessionContextService, useValue: sessionContextSpy }
      ]
    });

    store = TestBed.inject(ProjectStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('vm', () => {
    it('should provide view model', () => {
      const vm = store.vm();

      expect(vm.projects).toEqual([]);
      expect(vm.loading).toBe(false);
      expect(vm.saving).toBe(false);
      expect(vm.error).toBeNull();
    });
  });

  describe('load', () => {
    it('should load projects from API', () => {
      const mockProjects = [createMockProject()];
      apiSpy.list.mockReturnValue(of(mockProjects));

      store.load();

      expect(store.vm().projects).toEqual(mockProjects);
      expect(store.vm().loading).toBe(false);
    });

    it('should pass includeCompleted parameter', () => {
      store.load(true);

      expect(apiSpy.list).toHaveBeenCalledWith(true);
    });

    it('should set active project when found', () => {
      const activeProject = createMockProject({ status: ProjectStatus.Active });
      apiSpy.list.mockReturnValue(of([activeProject]));

      store.load();

      expect(sessionContextSpy.setActiveProject).toHaveBeenCalledWith(activeProject);
    });

    it('should set error on load failure', () => {
      apiSpy.list.mockReturnValue(throwError(() => new Error('Load failed')));

      store.load();

      expect(store.vm().error).toBe('Load failed');
    });
  });

  describe('getById', () => {
    it('should return project by id', () => {
      const mockProject = createMockProject({ id: 'project-1' });
      apiSpy.list.mockReturnValue(of([mockProject]));
      store.load();

      const result = store.getById('project-1');

      expect(result).toEqual(mockProject);
    });

    it('should return undefined for non-existent id', () => {
      apiSpy.list.mockReturnValue(of([]));
      store.load();

      const result = store.getById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('activate', () => {
    it('should activate project', () => {
      const activeProject = createMockProject({ id: 'project-1', status: ProjectStatus.Active });
      apiSpy.activate.mockReturnValue(of(activeProject));
      apiSpy.list.mockReturnValue(of([createMockProject({ id: 'project-1' })]));
      store.load();

      store.activate('project-1');

      expect(store.vm().projects[0].status).toBe(ProjectStatus.Active);
    });

    it('should deactivate other projects', () => {
      const projects = [
        createMockProject({ id: 'project-1', status: ProjectStatus.Active }),
        createMockProject({ id: 'project-2', status: ProjectStatus.Inactive })
      ];
      const activatedProject = createMockProject({ id: 'project-2', status: ProjectStatus.Active });
      apiSpy.list.mockReturnValue(of(projects));
      apiSpy.activate.mockReturnValue(of(activatedProject));
      store.load();

      store.activate('project-2');

      expect(store.vm().projects.find((p) => p.id === 'project-1')?.status).toBe(ProjectStatus.Inactive);
      expect(store.vm().projects.find((p) => p.id === 'project-2')?.status).toBe(ProjectStatus.Active);
    });

    it('should update session context', () => {
      const activeProject = createMockProject({ status: ProjectStatus.Active });
      apiSpy.activate.mockReturnValue(of(activeProject));

      store.activate('project-1');

      expect(sessionContextSpy.setActiveProject).toHaveBeenCalledWith(activeProject);
    });
  });

  describe('deactivate', () => {
    it('should deactivate project', () => {
      const inactiveProject = createMockProject({ id: 'project-1', status: ProjectStatus.Inactive });
      apiSpy.deactivate.mockReturnValue(of(inactiveProject));
      apiSpy.list.mockReturnValue(of([createMockProject({ id: 'project-1', status: ProjectStatus.Active })]));
      store.load();

      store.deactivate('project-1');

      expect(store.vm().projects[0].status).toBe(ProjectStatus.Inactive);
    });

    it('should clear session context if deactivated project was active', () => {
      sessionContextSpy.isProjectActive.mockReturnValue(true);

      store.deactivate('project-1');

      expect(sessionContextSpy.setActiveProject).toHaveBeenCalledWith(null);
    });
  });

  describe('computed properties', () => {
    it('should filter active projects', () => {
      const mockProjects = [
        createMockProject({ id: 'project-1', isCompleted: false }),
        createMockProject({ id: 'project-2', isCompleted: true })
      ];
      apiSpy.list.mockReturnValue(of(mockProjects));
      store.load();

      expect(store.activeProjects().length).toBe(1);
      expect(store.activeProjects()[0].id).toBe('project-1');
    });

    it('should expose currentProject from session context', () => {
      const mockProject = createMockProject();
      currentProjectSignal.set(mockProject);

      expect(store.currentProject()).toEqual(mockProject);
    });

    it('should expose currentProjectId from session context', () => {
      currentProjectIdSignal.set('project-1');

      expect(store.currentProjectId()).toBe('project-1');
    });
  });
});
