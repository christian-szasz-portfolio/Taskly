import { TestBed } from '@angular/core/testing';
import { UrlTree, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { type Observable, of, firstValueFrom } from 'rxjs';
import { getDialogTestProviders, createSpyObj, type MockedObject } from '@testing/test-helpers';
import { activeProjectGuard, noActiveProjectGuard } from './active-project.guard';
import { SessionContextService } from '../services/project/session-context.service';
import type { Project } from '../models/project.interfaces';
import { ProjectStatus } from '../models/task.enums';

const mockActiveProject: Project = {
  id: 'project-1',
  key: 'DEMO',
  title: 'Demo Project',
  status: ProjectStatus.Active,
  isCompleted: false,
  labels: [],
  components: [],
  createdAtUtc: new Date().toISOString()
};

describe('activeProjectGuard', () => {
  let sessionContextSpy: MockedObject<SessionContextService>;

  const createMockRoute = (projectKey?: string): ActivatedRouteSnapshot => ({
    paramMap: {
      get: (key: string) => key === 'projectKey' ? projectKey ?? null : null,
      has: () => false,
      getAll: () => [],
      keys: []
    },
    url: projectKey ? [{ path: projectKey, parameters: {}, parameterMap: { get: () => null, has: () => false, getAll: () => [], keys: [] } }] : []
  } as unknown as ActivatedRouteSnapshot);

  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    sessionContextSpy = createSpyObj<SessionContextService>(['currentProject'], {
      whenReady$: of(true)
    });

    TestBed.configureTestingModule({
      providers: [
        ...getDialogTestProviders(),
        provideRouter([
          { path: 'tasks/:projectKey', children: [] },
          { path: 'no-active-project', children: [] }
        ]),
        { provide: SessionContextService, useValue: sessionContextSpy }
      ]
    });
  });

  it('should allow access when there is an active project and route key matches', async () => {
    sessionContextSpy.currentProject.mockReturnValue(mockActiveProject);

    const value = await TestBed.runInInjectionContext(async () => {
      const result = activeProjectGuard(createMockRoute('DEMO'), mockState) as Observable<boolean | UrlTree>;
      return firstValueFrom(result);
    });

    expect(value).toBeTrue();
  });

  it('should redirect to no-active-project when there is no active project', async () => {
    sessionContextSpy.currentProject.mockReturnValue(null);

    const value = await TestBed.runInInjectionContext(async () => {
      const result = activeProjectGuard(createMockRoute(), mockState) as Observable<boolean | UrlTree>;
      return firstValueFrom(result);
    });

    expect(value).toBeInstanceOf(UrlTree);
    expect((value as UrlTree).toString()).toBe('/no-active-project');
  });

  it('should redirect to correct project key when route key does not match', async () => {
    sessionContextSpy.currentProject.mockReturnValue(mockActiveProject);

    const value = await TestBed.runInInjectionContext(async () => {
      const result = activeProjectGuard(createMockRoute('WRONG'), mockState) as Observable<boolean | UrlTree>;
      return firstValueFrom(result);
    });

    expect(value).toBeInstanceOf(UrlTree);
    expect((value as UrlTree).toString()).toBe('/tasks/DEMO');
  });
});

describe('noActiveProjectGuard', () => {
  let sessionContextSpy: MockedObject<SessionContextService>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    sessionContextSpy = createSpyObj<SessionContextService>(['currentProject'], {
      whenReady$: of(true)
    });

    TestBed.configureTestingModule({
      providers: [
        ...getDialogTestProviders(),
        provideRouter([
          { path: 'tasks/:projectKey', children: [] },
          { path: 'no-active-project', children: [] }
        ]),
        { provide: SessionContextService, useValue: sessionContextSpy }
      ]
    });
  });

  it('should allow access when there is no active project', async () => {
    sessionContextSpy.currentProject.mockReturnValue(null);

    const value = await TestBed.runInInjectionContext(async () => {
      const result = noActiveProjectGuard(mockRoute, mockState) as Observable<boolean | UrlTree>;
      return firstValueFrom(result);
    });

    expect(value).toBeTrue();
  });

  it('should redirect to tasks with project key when there is an active project', async () => {
    sessionContextSpy.currentProject.mockReturnValue(mockActiveProject);

    const value = await TestBed.runInInjectionContext(async () => {
      const result = noActiveProjectGuard(mockRoute, mockState) as Observable<boolean | UrlTree>;
      return firstValueFrom(result);
    });

    expect(value).toBeInstanceOf(UrlTree);
    expect((value as UrlTree).toString()).toBe('/tasks/DEMO');
  });
});
