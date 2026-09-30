// =============================================================================
// Subtask Mock Factories
// =============================================================================
// Centralized mock factories for Subtask testing
// Import with: import { createMockSubtask, createRawMockSubtask } from '@testing/mock-factories';

import { IssuePriority, IssueStatus, IssueResolution, SubtaskType } from '../../app/core/models/task.enums';
import type { Subtask } from '../../app/core/models/task.interfaces';

// =============================================================================
// Raw API Response Types
// =============================================================================

/**
 * Raw API response format for Subtask.
 */
export interface RawSubtask {
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
  subtaskType: string;
  labels: readonly string[] | null;
  components: readonly string[] | null;
  epicKey: string | null;
  resolution: string;
  reporter: string | null;
  linkedTaskId: string | null;
  position: number;
  parentTaskItemId: string;
  timeSpentMinutes: number;
}

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Creates a mock Subtask with sensible defaults.
 *
 * @param overrides - Partial Subtask to override defaults
 * @returns A complete Subtask for testing
 */
export function createMockSubtask(overrides: Partial<Subtask> = {}): Subtask {
  return {
    id: 'st-1',
    issueKey: 'WF-101-1',
    title: 'Test Subtask',
    description: 'Subtask description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: 'dev@test.com',
    category: 'Development',
    priority: IssuePriority.Medium,
    status: IssueStatus.Open,
    subtaskType: SubtaskType.Development,
    labels: [],
    components: [],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: 'reporter@test.com',
    position: 0,
    parentTaskItemId: 'wf-1',
    timeSpentMinutes: 0,
    ...overrides
  };
}

/**
 * Creates a raw API response mock for Subtask.
 *
 * @param overrides - Partial RawSubtask to override defaults
 * @returns A raw API response format for HTTP mocking
 */
export function createRawMockSubtask(overrides: Partial<RawSubtask> = {}): RawSubtask {
  return {
    id: 'st-1',
    issueKey: 'WF-101-1',
    title: 'Test Subtask',
    description: 'Subtask description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: 'dev@test.com',
    category: 'Development',
    priority: 'Medium',
    status: 'Open',
    subtaskType: 'Development',
    labels: [],
    components: [],
    epicKey: null,
    resolution: 'NotFixed',
    reporter: 'reporter@test.com',
    linkedTaskId: null,
    position: 0,
    parentTaskItemId: 'wf-1',
    timeSpentMinutes: 0,
    ...overrides
  };
}

/**
 * Creates multiple mock subtasks with unique IDs.
 *
 * @param count - Number of subtasks to create
 * @param parentId - Parent task item ID
 * @param overrides - Common overrides to apply to all items
 * @returns Array of Subtasks
 */
export function createMockSubtasks(
  count: number,
  parentId = 'wf-1',
  overrides: Partial<Subtask> = {}
): Subtask[] {
  return Array.from({ length: count }, (_, index) =>
    createMockSubtask({
      id: `st-${index + 1}`,
      issueKey: `WF-101-${index + 1}`,
      title: `Test Subtask ${index + 1}`,
      position: index,
      parentTaskItemId: parentId,
      ...overrides
    })
  );
}

/**
 * Creates a subtasks-by-parent map for batch API responses.
 *
 * @param parentIds - Array of parent task item IDs
 * @param subtasksPerParent - Number of subtasks per parent
 * @returns Record mapping parent IDs to their subtasks
 */
export function createMockSubtasksByParent(
  parentIds: readonly string[],
  subtasksPerParent = 2
): Record<string, RawSubtask[]> {
  const result: Record<string, RawSubtask[]> = {};

  parentIds.forEach((parentId) => {
    result[parentId] = Array.from({ length: subtasksPerParent }, (_, index) =>
      createRawMockSubtask({
        id: `${parentId}-st-${index + 1}`,
        issueKey: `${parentId.toUpperCase()}-${index + 1}`,
        parentTaskItemId: parentId,
        position: index
      })
    );
  });

  return result;
}
