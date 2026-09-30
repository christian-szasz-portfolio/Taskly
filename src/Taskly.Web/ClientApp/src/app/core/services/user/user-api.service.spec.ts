import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { getFormTestProviders, createSpyObj, type MockedObject } from '@testing/test-helpers';
import { UserApiService } from './user-api.service';
import { AuthStore } from '../../state/auth.store';
import { ProjectApiService } from '../project/project-api.service';
import { SessionContextService } from '../project/session-context.service';
import type { DemoUser } from '../../models/auth.model';
import type { Project } from '../../models/project.interfaces';

const createMockAuthUser = (overrides: Partial<DemoUser> = {}): DemoUser => ({
  id: 'user-1',
  email: 'testuser@example.com',
  firstName: 'Test',
  fullName: 'Test User',
  ...overrides
});

import type { Observable } from 'rxjs';

describe('UserApiService', () => {
  let service: UserApiService;
  let mockAuthService: { user: ReturnType<typeof signal<DemoUser | null>> };
  let mockSessionContext: { project$: Observable<Project | null>; currentProject: ReturnType<typeof signal<Project | null>> };
  let mockProjectApi: MockedObject<ProjectApiService>;

  beforeEach(() => {
    mockAuthService = {
      user: signal<DemoUser | null>(null)
    };

    // Default: no active project, so contributors will be empty
    mockSessionContext = {
      project$: of(null),
      currentProject: signal<Project | null>(null)
    };

    mockProjectApi = createSpyObj<ProjectApiService>(['getContributors']);
    mockProjectApi.getContributors.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        ...getFormTestProviders(),
        UserApiService,
        { provide: AuthStore, useValue: mockAuthService },
        { provide: SessionContextService, useValue: mockSessionContext },
        { provide: ProjectApiService, useValue: mockProjectApi }
      ]
    });

    service = TestBed.inject(UserApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('currentUser', () => {
    it('should return null when auth user is null', () => {
      mockAuthService.user.set(null);
      expect(service.currentUser()).toBeNull();
    });

    it('should return null when auth user has no email', () => {
      mockAuthService.user.set(createMockAuthUser({ email: '' }));
      expect(service.currentUser()).toBeNull();
    });

    it('should return user info when auth user is valid', () => {
      mockAuthService.user.set(createMockAuthUser({
        email: 'testuser@example.com',
        fullName: 'Test User'
      }));

      const currentUser = service.currentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.name).toBe('testuser@example.com');
      expect(currentUser?.displayName).toBe('Test User');
    });

    it('should handle empty fullName', () => {
      mockAuthService.user.set(createMockAuthUser({
        email: 'testuser@example.com',
        fullName: ''
      }));

      const currentUser = service.currentUser();
      expect(currentUser?.displayName).toBe('');
    });
  });

  describe('getUserOptions', () => {
    it('should return only Unassigned option when no contributors', () => {
      mockAuthService.user.set(null);

      const options = service.getUserOptions();

      // With no active project and no contributors, only Unassigned option
      expect(options.length).toBe(1);
      expect(options[0].value).toBe('');
      expect(options[0].label).toBe('Unassigned');
    });

    it('should always include Unassigned as first option', () => {
      mockAuthService.user.set(createMockAuthUser({
        email: 'testuser@example.com',
        fullName: 'Test User'
      }));

      const options = service.getUserOptions();

      expect(options[0].value).toBe('');
      expect(options[0].label).toBe('Unassigned');
    });
  });

  describe('isActiveContributor', () => {
    it('should return false when no contributors', () => {
      expect(service.isActiveContributor('someone@example.com')).toBeFalse();
    });

    it('should return false for null or undefined email', () => {
      expect(service.isActiveContributor(null)).toBeFalse();
      expect(service.isActiveContributor(undefined)).toBeFalse();
    });
  });
});
