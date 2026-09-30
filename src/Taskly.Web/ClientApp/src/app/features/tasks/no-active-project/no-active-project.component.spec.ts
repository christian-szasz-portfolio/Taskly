import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { createSpyObj, getBaseTestProviders, type MockedObject } from '@testing/test-helpers';
import { NoActiveProjectComponent } from './no-active-project.component';
import { SessionContextService } from '../../../core/services/project/session-context.service';
import { ProjectStore } from '../../../core/state/project.store';
import type { Project } from '../../../core/models/project.interfaces';
import { ProjectStatus } from '../../../core/models/task.enums';

describe('NoActiveProjectComponent', () => {
  let component: NoActiveProjectComponent;
  let fixture: ComponentFixture<NoActiveProjectComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let sessionContextSpy: MockedObject<SessionContextService>;
  let projectStoreSpy: MockedObject<ProjectStore>;

  const mockProjects: Project[] = [
    {
      id: 'project-1',
      key: 'PROJ1',
      title: 'Test Project 1',
      status: ProjectStatus.Inactive,
      isCompleted: false,
      labels: [],
      components: [],
      createdAtUtc: new Date().toISOString()
    },
    {
      id: 'project-2',
      key: 'PROJ2',
      title: 'Test Project 2',
      status: ProjectStatus.Inactive,
      isCompleted: false,
      labels: [],
      components: [],
      createdAtUtc: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    sessionContextSpy = createSpyObj(['hasActiveProject'], {
      isLoading: signal(false),
      hasActiveProject: signal(false)
    });

    projectStoreSpy = createSpyObj(['load', 'activate'], {
      activeProjects: signal(mockProjects)
    });

    await TestBed.configureTestingModule({
      imports: [NoActiveProjectComponent],
      providers: [
        ...getBaseTestProviders(),
        { provide: SessionContextService, useValue: sessionContextSpy },
        { provide: ProjectStore, useValue: projectStoreSpy }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoActiveProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    expect(projectStoreSpy.load).toHaveBeenCalled();
  });

  it('should show available projects', () => {
    expect(component.hasProjects()).toBeTrue();
    expect(component.projects().length).toBe(2);
  });

  it('should activate project when clicked', () => {
    spyOn(router, 'navigate');
    const project = mockProjects[0];

    component.activateProject(project);

    expect(projectStoreSpy.activate).toHaveBeenCalledWith('project-1');
  });

  it('should refresh projects when refresh is called', () => {
    projectStoreSpy.load.mockClear();

    component.refresh();

    expect(projectStoreSpy.load).toHaveBeenCalled();
  });
});
