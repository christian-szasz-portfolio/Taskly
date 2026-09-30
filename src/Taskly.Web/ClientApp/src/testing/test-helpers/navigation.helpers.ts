// =============================================================================
// Navigation Test Helpers
// =============================================================================
// Centralized navigation mock utilities for testing
// Import with: import { createTaskNavigationMock, createActivatedRouteMock } from '@testing/test-helpers';

import { signal } from '@angular/core';
import {
  type ActivatedRoute,
  type ActivatedRouteSnapshot,
  type Router,
  type ParamMap,
  UrlSegment,
  type UrlTree,
  DefaultUrlSerializer,
  convertToParamMap
} from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import type { TaskNavigationService } from '../../app/core/services/task/task-navigation.service';
import { createSpyObj, type MockedObject } from './spy.helpers';

// =============================================================================
// TaskNavigationService Mock
// =============================================================================

/**
 * Creates a mock TaskNavigationService for testing.
 * Includes all computed route signals and navigation methods.
 *
 * @param projectKey - The project key to use in routes (default: 'DEMO')
 * @returns Mocked TaskNavigationService
 *
 * @example
 * // In test setup
 * const taskNavSpy = createTaskNavigationMock();
 *
 * // In providers
 * { provide: TaskNavigationService, useValue: taskNavSpy }
 */
export function createTaskNavigationMock(
  projectKey = 'DEMO'
): MockedObject<TaskNavigationService> {
  const spy = createSpyObj<TaskNavigationService>(
    ['getDetailRoute', 'getEditRoute'],
    {
      kanbanRoute: signal(['/tasks', projectKey]),
      backlogRoute: signal(['/tasks', projectKey, 'backlog']),
      resolvedRoute: signal(['/tasks', projectKey, 'resolved']),
      epicsRoute: signal(['/tasks', projectKey, 'epics'])
    }
  );

  spy.getDetailRoute.mockImplementation((issueKey: string) => ['/tasks', projectKey, issueKey]);
  spy.getEditRoute.mockImplementation((issueKey: string) => ['/tasks', projectKey, issueKey, 'edit']);

  return spy;
}

// =============================================================================
// ActivatedRoute Mock
// =============================================================================

/**
 * Options for creating an ActivatedRoute mock.
 */
export interface ActivatedRouteMockOptions {
  /** Route parameters (e.g., { id: '123', issueKey: 'WF-101' }) */
  params?: Record<string, string>;
  /** Query parameters */
  queryParams?: Record<string, string>;
  /** Route data */
  data?: Record<string, unknown>;
  /** URL segments */
  url?: string[];
  /** Fragment */
  fragment?: string | null;
}

/**
 * Result from createActivatedRouteMock containing the mock and update functions.
 */
export interface ActivatedRouteMockResult {
  /** The mock ActivatedRoute object */
  mock: Partial<ActivatedRoute>;
  /** Subject for updating paramMap */
  paramMapSubject: BehaviorSubject<ParamMap>;
  /** Subject for updating queryParamMap */
  queryParamMapSubject: BehaviorSubject<ParamMap>;
  /** Subject for updating data */
  dataSubject: BehaviorSubject<Record<string, unknown>>;
  /** Helper function to update params */
  updateParams: (params: Record<string, string>) => void;
  /** Helper function to update query params */
  updateQueryParams: (queryParams: Record<string, string>) => void;
  /** Helper function to update data */
  updateData: (data: Record<string, unknown>) => void;
}

/**
 * Creates a mock ActivatedRoute for testing.
 * Includes BehaviorSubjects for dynamic parameter updates during tests.
 *
 * @param options - Configuration options for the mock
 * @returns Object containing mock and update helpers
 *
 * @example
 * // Basic usage
 * const { mock } = createActivatedRouteMock({ params: { issueKey: 'WF-101' } });
 *
 * // In providers
 * { provide: ActivatedRoute, useValue: mock }
 *
 * // Update params during test
 * const { mock, updateParams } = createActivatedRouteMock({ params: { id: '1' } });
 * updateParams({ id: '2' }); // Triggers paramMap update
 */
export function createActivatedRouteMock(
  options: ActivatedRouteMockOptions = {}
): ActivatedRouteMockResult {
  const { params = {}, queryParams = {}, data = {}, url = [], fragment = null } = options;

  const paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap(params));
  const queryParamMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap(queryParams));
  const dataSubject = new BehaviorSubject<Record<string, unknown>>(data);

  const mock: Partial<ActivatedRoute> = {
    paramMap: paramMapSubject.asObservable(),
    queryParamMap: queryParamMapSubject.asObservable(),
    data: dataSubject.asObservable(),
    params: of(params),
    queryParams: of(queryParams),
    fragment: of(fragment),
    url: of(url.map((segment) => new UrlSegment(segment, {}))),
    snapshot: {
      paramMap: convertToParamMap(params),
      queryParamMap: convertToParamMap(queryParams),
      data,
      params,
      queryParams,
      fragment,
      url: url.map((segment) => new UrlSegment(segment, {})),
      outlet: 'primary',
      component: null,
      routeConfig: null,
      root: null as unknown as ActivatedRouteSnapshot,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      title: undefined
    }
  };

  const updateParams = (newParams: Record<string, string>): void => {
    paramMapSubject.next(convertToParamMap(newParams));
    if (mock.snapshot) {
      (mock.snapshot as unknown as Record<string, unknown>)['params'] = newParams;
    }
  };

  const updateQueryParams = (newQueryParams: Record<string, string>): void => {
    queryParamMapSubject.next(convertToParamMap(newQueryParams));
    if (mock.snapshot) {
      (mock.snapshot as unknown as Record<string, unknown>)['queryParams'] = newQueryParams;
    }
  };

  const updateData = (newData: Record<string, unknown>): void => {
    dataSubject.next(newData);
    if (mock.snapshot) {
      mock.snapshot.data = newData;
    }
  };

  return {
    mock,
    paramMapSubject,
    queryParamMapSubject,
    dataSubject,
    updateParams,
    updateQueryParams,
    updateData
  };
}

// =============================================================================
// Router Mock
// =============================================================================

/**
 * Creates a mock Router for testing.
 *
 * @param currentUrl - The current URL to return from router.url
 * @returns Mocked Router
 */
export function createRouterMock(currentUrl = '/'): MockedObject<Router> {
  const urlSerializer = new DefaultUrlSerializer();

  const routerSpy = createSpyObj<Router>(
    ['navigate', 'navigateByUrl', 'createUrlTree', 'serializeUrl', 'parseUrl'],
    {
      url: currentUrl,
      events: of()
    }
  );

  routerSpy.navigate.mockReturnValue(Promise.resolve(true));
  routerSpy.navigateByUrl.mockReturnValue(Promise.resolve(true));
  routerSpy.createUrlTree.mockImplementation((commands: readonly unknown[]) => {
    const path = '/' + (commands as string[]).filter((c) => c !== null && c !== undefined).join('/');
    return urlSerializer.parse(path);
  });
  routerSpy.serializeUrl.mockImplementation((tree: UrlTree) => urlSerializer.serialize(tree));

  return routerSpy;
}
