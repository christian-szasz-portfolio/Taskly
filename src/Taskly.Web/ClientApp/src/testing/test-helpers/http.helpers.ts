// =============================================================================
// HTTP Test Helpers
// =============================================================================
// Centralized HTTP mock utilities for testing
// Import with: import { flushHttpRequests, expectHttpRequest } from '@testing/test-helpers';

import type { HttpRequest } from '@angular/common/http';
import type { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

// =============================================================================
// Request Helpers
// =============================================================================

/**
 * Flushes all pending HTTP requests matching a URL pattern.
 *
 * @param httpMock - The HttpTestingController
 * @param urlPattern - String or RegExp to match request URLs
 * @param response - Response data to flush
 * @returns Array of matched requests
 */
export function flushHttpRequests(
  httpMock: HttpTestingController,
  urlPattern: string | RegExp,
  response: object | string | null
): TestRequest[] {
  const matcher = typeof urlPattern === 'string'
    ? (req: HttpRequest<unknown>) => req.url.includes(urlPattern)
    : (req: HttpRequest<unknown>) => urlPattern.test(req.url);

  const requests = httpMock.match(matcher);
  requests.forEach((req) => req.flush(response));
  return requests;
}

/**
 * Expects a single HTTP request and returns it for assertions.
 *
 * @param httpMock - The HttpTestingController
 * @param method - Expected HTTP method
 * @param urlPath - URL path (will be prefixed with API base URL)
 * @returns The matched TestRequest
 */
export function expectHttpRequest(
  httpMock: HttpTestingController,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  urlPath: string
): TestRequest {
  const fullUrl = `${environment.apiBaseUrl}${urlPath}`;
  const req = httpMock.expectOne(fullUrl);
  expect(req.request.method).toBe(method);
  return req;
}

/**
 * Expects a GET request to the specified API path.
 */
export function expectGet(httpMock: HttpTestingController, urlPath: string): TestRequest {
  return expectHttpRequest(httpMock, 'GET', urlPath);
}

/**
 * Expects a POST request to the specified API path.
 */
export function expectPost(httpMock: HttpTestingController, urlPath: string): TestRequest {
  return expectHttpRequest(httpMock, 'POST', urlPath);
}

/**
 * Expects a PUT request to the specified API path.
 */
export function expectPut(httpMock: HttpTestingController, urlPath: string): TestRequest {
  return expectHttpRequest(httpMock, 'PUT', urlPath);
}

/**
 * Expects a PATCH request to the specified API path.
 */
export function expectPatch(httpMock: HttpTestingController, urlPath: string): TestRequest {
  return expectHttpRequest(httpMock, 'PATCH', urlPath);
}

/**
 * Expects a DELETE request to the specified API path.
 */
export function expectDelete(httpMock: HttpTestingController, urlPath: string): TestRequest {
  return expectHttpRequest(httpMock, 'DELETE', urlPath);
}

// =============================================================================
// Common API Endpoints
// =============================================================================

/**
 * Common API endpoint paths for task-related requests.
 */
export const ApiEndpoints = {
  // Task Items
  taskList: '/task-items/list',
  taskGet: (id: string) => `/task-items/get/${id}`,
  taskCreate: '/task-items/create',
  taskUpdate: (id: string) => `/task-items/update/${id}`,
  taskUpdateStatus: (id: string) => `/task-items/update-status/${id}`,
  taskDelete: (id: string) => `/task-items/delete/${id}`,

  // Subtasks
  subtaskList: '/subtasks/list',
  subtaskListByParents: '/subtasks/list-by-parents',
  subtaskGet: (id: string) => `/subtasks/get/${id}`,
  subtaskCreate: '/subtasks/create',
  subtaskUpdate: (id: string) => `/subtasks/update/${id}`,
  subtaskDelete: (id: string) => `/subtasks/delete/${id}`,

  // Projects
  projectList: '/projects/list',
  projectGet: (id: string) => `/projects/get/${id}`,
  projectCreate: '/projects/create',
  projectUpdate: (id: string) => `/projects/update/${id}`,
  projectActivate: (id: string) => `/projects/activate/${id}`,
  projectDeactivate: (id: string) => `/projects/deactivate/${id}`,

  // Time Entries
  timeEntryList: '/time-entries/list',
  timeEntryListByRange: '/time-entries/list-by-range',
  timeEntryCreate: '/time-entries/create',
  timeEntryUpdate: (id: string) => `/time-entries/update/${id}`,
  timeEntryDelete: (id: string) => `/time-entries/delete/${id}`,

  // Attachments
  attachmentsByTask: (id: string) => `/attachments/by-task-item/${id}`,
  attachmentUpload: '/attachments/upload',

  // Auth
  authToken: '/auth/token',
  authRefresh: '/auth/refresh',
  authLogout: '/auth/logout'
} as const;

// =============================================================================
// Task-Specific Helpers
// =============================================================================

/**
 * Flushes the initial task list request that occurs on component init.
 *
 * @param httpMock - The HttpTestingController
 * @param tasks - Array of tasks to return (default: empty array)
 */
export function flushInitialTaskList<T>(
  httpMock: HttpTestingController,
  tasks: T[] = []
): void {
  const req = httpMock.expectOne(`${environment.apiBaseUrl}${ApiEndpoints.taskList}`);
  req.flush(tasks);
}

/**
 * Flushes subtask batch requests.
 *
 * @param httpMock - The HttpTestingController
 * @param subtasksByParent - Record mapping parent IDs to subtasks
 */
export function flushSubtaskBatchRequest<T>(
  httpMock: HttpTestingController,
  subtasksByParent: Record<string, T[]> = {}
): void {
  const reqs = httpMock.match((req) => req.url.includes(ApiEndpoints.subtaskListByParents));
  reqs.forEach((req) => req.flush(subtasksByParent));
}

/**
 * Flushes attachment list requests for a task item.
 *
 * @param httpMock - The HttpTestingController
 * @param taskId - The task item ID
 * @param attachments - Array of attachments to return
 */
export function flushAttachmentRequest<T>(
  httpMock: HttpTestingController,
  taskId: string,
  attachments: T[] = []
): void {
  const reqs = httpMock.match((req) =>
    req.url.includes(ApiEndpoints.attachmentsByTask(taskId))
  );
  reqs.forEach((req) => req.flush(attachments));
}
