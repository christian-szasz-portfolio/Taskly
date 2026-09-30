import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { getBaseTestProviders, createSpyObj, type MockedObject } from '@testing/test-helpers';
import { vi } from 'vitest';
import { HomePageComponent } from './home-page.component';
import { ProjectStore } from '../../../core/state/project.store';
import { NotificationStore } from '../../../core/state/notification.store';
import { ProjectStatus } from '../../../core/models/task.enums';
import type { Project } from '../../../core/models/project.interfaces';

describe('HomePageComponent', (): void => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let mockProjectStore: MockedObject<ProjectStore>;
  let dialogSpy: MockedObject<MatDialog>;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown>>;

  // Notification store mock signals
  const mockUnreadCount = signal(3);
  const mockNotificationVm = computed(() => ({
    notifications: [],
    unreadCount: mockUnreadCount(),
    loading: false,
    error: null
  }));
  const mockNotificationStore = {
    vm: mockNotificationVm,
    loadUnreadCount: vi.fn()
  };

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
    mockProjectStore = createSpyObj<ProjectStore>(['load'], {
      vm: vi.fn().mockReturnValue({
        projects: [],
        loading: false,
        saving: false,
        error: null
      }),
      ownedProjects: vi.fn().mockReturnValue([])
    });

    dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['afterClosed', 'close']);
    dialogRefSpy.afterClosed.mockReturnValue(of(undefined));

    dialogSpy = createSpyObj<MatDialog>(['open'], {
      _openDialogs: [],
      openDialogs: []
    });
    dialogSpy.open.mockReturnValue(dialogRefSpy as MatDialogRef<unknown>);

    // Reset notification store spy
    mockNotificationStore.loadUnreadCount.mockClear();
    mockUnreadCount.set(3);

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        ...getBaseTestProviders(),
        { provide: ProjectStore, useValue: mockProjectStore },
        { provide: NotificationStore, useValue: mockNotificationStore }
      ]
    })
      .overrideComponent(HomePageComponent, {
        add: {
          providers: [{ provide: MatDialog, useValue: dialogSpy }]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('startup', (): void => {
    it('should call projectStore.load on init', (): void => {
      fixture.detectChanges();
      expect(mockProjectStore.load).toHaveBeenCalled();
    });
  });

  describe('isEmpty computed', (): void => {
    it('should return true when projects array is empty', (): void => {
      (mockProjectStore.ownedProjects as ReturnType<typeof vi.fn>).mockReturnValue([]);
      fixture.detectChanges();
      expect(component.isEmpty()).toBeTrue();
    });

    it('should return false when projects array has items', (): void => {
      (mockProjectStore.ownedProjects as ReturnType<typeof vi.fn>).mockReturnValue(createMockProjects(2));
      fixture.detectChanges();
      expect(component.isEmpty()).toBeFalse();
    });
  });

  describe('icons signal', (): void => {
    it('should have all required icons', (): void => {
      fixture.detectChanges();
      const icons = component.icons();
      expect(icons.notifications).toBeDefined();
      expect(icons.preferences).toBeDefined();
      expect(icons.addProject).toBeDefined();
      expect(icons.activity).toBeDefined();
    });
  });

  describe('notificationCount signal', (): void => {
    it('should have a default notification count of 3', (): void => {
      fixture.detectChanges();
      expect(component.notificationCount()).toBe(3);
    });
  });

  describe('userName signal', (): void => {
    it('should have a default user name of "User"', (): void => {
      fixture.detectChanges();
      expect(component.userName()).toBe('User');
    });
  });

  describe('create and import', (): void => {
    it('keeps both buttons disabled, with the reason: the seeded projects frame the demo', (): void => {
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;

      expect(element.querySelector<HTMLButtonElement>('[aria-label="Create new project"]')?.disabled).toBeTrue();
      expect(element.querySelector<HTMLButtonElement>('.import-button')?.disabled).toBeTrue();
      expect(component.disabledNotes.createProject).toContain('does not allow creating projects');
      expect(component.disabledNotes.importProject).toContain('does not allow importing projects');
    });
  });

  describe('refresh', (): void => {
    it('should call projectStore.load', (): void => {
      fixture.detectChanges();
      mockProjectStore.load.mockClear();

      component.refresh();

      expect(mockProjectStore.load).toHaveBeenCalled();
    });
  });

  describe('openPreferencesDialog', (): void => {
    it('should open preferences dialog with correct configuration', async (): Promise<void> => {
      fixture.detectChanges();
      dialogSpy.open.mockClear();

      component.openPreferencesDialog();
      await fixture.whenStable();

      expect(dialogSpy.open).toHaveBeenCalled();
      const dialogConfig = dialogSpy.open.mock.calls.at(-1)?.[1];
      expect(dialogConfig?.width).toBe('720px');
      expect(dialogConfig?.maxWidth).toBe('90vw');
      expect(dialogConfig?.autoFocus).toBe('first-tabbable');
    });
  });
});
