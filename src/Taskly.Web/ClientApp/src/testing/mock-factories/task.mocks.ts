// =============================================================================
// Task Mock Factories
// =============================================================================
// Centralized mock factories for TaskItem testing
// Import with: import { createMockTask, createRawMockTask } from '@testing/mock-factories';

import { IssuePriority, IssueStatus, IssueType, IssueResolution } from '../../app/core/models/task.enums';
import type { TaskItem } from '../../app/core/models/task.interfaces';

// =============================================================================
// Raw API Response Types
// =============================================================================

/**
 * Raw API response format - uses 'variant' field instead of 'issueType'.
 * Use this type for HTTP mock flush operations.
 */
export interface RawTaskItem {
  id: string;
  issueKey: string | null;
  title: string;
  description: string | null;
  dueAtUtc: string | null;
  isCompleted: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  completedAtUtc: string | null;
  createdBy: string | null;
  assignedTo: string | null;
  category: string | null;
  priority: string;
  status: string;
  variant: string; // API uses 'variant', frontend uses 'issueType'
  labels: readonly string[] | null;
  components: readonly string[] | null;
  epicKey: string | null;
  resolution: string;
  reporter: string | null;
  linkedTaskId: string | null;
  position: number;
  projectId: string | null;
  timeSpentMinutes: number;
}

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Creates a mock TaskItem with sensible defaults.
 * Use for expectations and component testing where normalized data is expected.
 *
 * @param overrides - Partial TaskItem to override defaults
 * @returns A complete TaskItem for testing
 *
 * @example
 * // Basic usage
 * const task = createMockTask();
 *
 * // With overrides
 * const completedTask = createMockTask({
 *   isCompleted: true,
 *   status: IssueStatus.Done
 * });
 */
export function createMockTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id: 'wf-1',
    issueKey: 'WF-101',
    title: 'Test Task',
    description: 'Test description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: 'dev@test.com',
    category: 'Development',
    priority: IssuePriority.High,
    status: IssueStatus.InProgress,
    issueType: IssueType.Task,
    labels: ['Label1'],
    components: ['Component1'],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: 'reporter@test.com',
    linkedTaskId: null,
    position: 0,
    projectId: 'test-project-id',
    timeSpentMinutes: 0,
    ...overrides
  };
}

/**
 * Creates a raw API response mock for HTTP flush operations.
 * Use this when mocking HTTP responses in tests.
 *
 * @param overrides - Partial RawTaskItem to override defaults
 * @returns A raw API response format for HTTP mocking
 *
 * @example
 * // In a test
 * const listReq = httpMock.expectOne('/api/task-items/list');
 * listReq.flush([createRawMockTask({ variant: 'Epic' })]);
 */
export function createRawMockTask(overrides: Partial<RawTaskItem> = {}): RawTaskItem {
  return {
    id: 'wf-1',
    issueKey: 'WF-101',
    title: 'Test Task',
    description: 'Test description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: 'dev@test.com',
    category: 'Development',
    priority: 'High',
    status: 'InProgress',
    variant: 'Task', // Raw API uses 'variant' not 'issueType'
    labels: ['Label1'],
    components: ['Component1'],
    epicKey: null,
    resolution: 'NotFixed',
    reporter: 'reporter@test.com',
    linkedTaskId: null,
    position: 0,
    projectId: 'test-project-id',
    timeSpentMinutes: 0,
    ...overrides
  };
}

/**
 * Creates multiple mock tasks with unique IDs.
 *
 * @param count - Number of tasks to create
 * @param overrides - Common overrides to apply to all items
 * @returns Array of TaskItems
 */
export function createMockTasks(count: number, overrides: Partial<TaskItem> = {}): TaskItem[] {
  return Array.from({ length: count }, (_, index) =>
    createMockTask({
      id: `wf-${index + 1}`,
      issueKey: `WF-${101 + index}`,
      title: `Test Task ${index + 1}`,
      position: index,
      ...overrides
    })
  );
}

/**
 * Creates multiple raw mock tasks for HTTP responses.
 *
 * @param count - Number of raw tasks to create
 * @param overrides - Common overrides to apply to all items
 * @returns Array of RawTaskItems for HTTP mocking
 */
export function createRawMockTasks(count: number, overrides: Partial<RawTaskItem> = {}): RawTaskItem[] {
  return Array.from({ length: count }, (_, index) =>
    createRawMockTask({
      id: `wf-${index + 1}`,
      issueKey: `WF-${101 + index}`,
      title: `Test Task ${index + 1}`,
      position: index,
      ...overrides
    })
  );
}

// =============================================================================
// Preset Factories
// =============================================================================

/**
 * Creates a mock Epic task item.
 */
export function createMockEpic(overrides: Partial<TaskItem> = {}): TaskItem {
  return createMockTask({
    issueKey: 'EPIC-1',
    title: 'Test Epic',
    issueType: IssueType.Epic,
    status: IssueStatus.Administrative,
    assignedTo: 'System',
    labels: [],
    components: [],
    epicKey: null,
    ...overrides
  });
}

/**
 * Creates a raw mock Epic for HTTP responses.
 */
export function createRawMockEpic(overrides: Partial<RawTaskItem> = {}): RawTaskItem {
  return createRawMockTask({
    issueKey: 'EPIC-1',
    title: 'Test Epic',
    variant: 'Epic',
    status: 'Administrative',
    assignedTo: 'System',
    labels: [],
    components: [],
    epicKey: null,
    ...overrides
  });
}

/**
 * Creates a completed task item.
 */
export function createMockCompletedTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return createMockTask({
    isCompleted: true,
    status: IssueStatus.Done,
    resolution: IssueResolution.Fixed,
    completedAtUtc: new Date().toISOString(),
    ...overrides
  });
}

/**
 * Creates a backlog task item.
 */
export function createMockBacklogTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return createMockTask({
    status: IssueStatus.Created,
    ...overrides
  });
}
