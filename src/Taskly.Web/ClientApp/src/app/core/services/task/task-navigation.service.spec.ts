import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { TaskNavigationService } from './task-navigation.service';
import { SessionContextService } from '../project/session-context.service';
import type { Project } from '../../models/project.interfaces';
import { ProjectStatus } from '../../models/task.enums';

describe('TaskNavigationService', () => {
  let service: TaskNavigationService;
  let sessionContextSpy: MockedObject<SessionContextService>;
  let currentProjectSignal: ReturnType<typeof signal<Project | null>>;

  const mockProject: Project = {
    id: 'project-1',
    key: 'DEMO',
    title: 'Demo Project',
    description: 'Test description',
    status: ProjectStatus.Active,
    labels: [],
    components: [],
    createdAtUtc: '2026-01-01T00:00:00Z',
    updatedAtUtc: null,
    isCompleted: false
  };

  beforeEach(() => {
    currentProjectSignal = signal<Project | null>(null);

    sessionContextSpy = createSpyObj<SessionContextService>(
      ['loadActiveProject', 'setActiveProject', 'syncProject', 'isProjectActive'],
      {
        currentProject: currentProjectSignal.asReadonly()
      }
    );

    TestBed.configureTestingModule({
      providers: [
        TaskNavigationService,
        { provide: SessionContextService, useValue: sessionContextSpy }
      ]
    });

    service = TestBed.inject(TaskNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('projectKey', () => {
    it('should return null when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.projectKey()).toBeNull();
    });

    it('should return project key when available', () => {
      currentProjectSignal.set(mockProject);
      expect(service.projectKey()).toBe('DEMO');
    });

    it('should fall back to project ID when key is null', () => {
      currentProjectSignal.set({ ...mockProject, key: null as unknown as string });
      expect(service.projectKey()).toBe('project-1');
    });
  });

  describe('canNavigate', () => {
    it('should return false when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.canNavigate()).toBe(false);
    });

    it('should return true when project is active', () => {
      currentProjectSignal.set(mockProject);
      expect(service.canNavigate()).toBe(true);
    });
  });

  describe('kanbanRoute', () => {
    it('should return null when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.kanbanRoute()).toBeNull();
    });

    it('should return kanban route when project is active', () => {
      currentProjectSignal.set(mockProject);
      expect(service.kanbanRoute()).toEqual(['/tasks', 'DEMO']);
    });
  });

  describe('epicsRoute', () => {
    it('should return null when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.epicsRoute()).toBeNull();
    });

    it('should return epics route when project is active', () => {
      currentProjectSignal.set(mockProject);
      expect(service.epicsRoute()).toEqual(['/tasks', 'DEMO', 'epics']);
    });
  });

  describe('backlogRoute', () => {
    it('should return null when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.backlogRoute()).toBeNull();
    });

    it('should return backlog route when project is active', () => {
      currentProjectSignal.set(mockProject);
      expect(service.backlogRoute()).toEqual(['/tasks', 'DEMO', 'backlog']);
    });
  });

  describe('resolvedRoute', () => {
    it('should return null when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.resolvedRoute()).toBeNull();
    });

    it('should return resolved route when project is active', () => {
      currentProjectSignal.set(mockProject);
      expect(service.resolvedRoute()).toEqual(['/tasks', 'DEMO', 'resolved']);
    });
  });

  describe('getDetailRoute', () => {
    it('should return null when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.getDetailRoute('DEMO-1')).toBeNull();
    });

    it('should return detail route when project is active', () => {
      currentProjectSignal.set(mockProject);
      expect(service.getDetailRoute('DEMO-1')).toEqual(['/tasks', 'DEMO', 'DEMO-1']);
    });
  });

  describe('getEditRoute', () => {
    it('should return null when no project is active', () => {
      currentProjectSignal.set(null);
      expect(service.getEditRoute('DEMO-1')).toBeNull();
    });

    it('should return edit route when project is active', () => {
      currentProjectSignal.set(mockProject);
      expect(service.getEditRoute('DEMO-1')).toEqual(['/tasks', 'DEMO', 'DEMO-1', 'edit']);
    });
  });
});
