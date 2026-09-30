// =============================================================================
// Time Entry Mock Factories
// =============================================================================
// Centralized mock factories for TimeEntry testing
// Import with: import { createMockTimeEntry } from '@testing/mock-factories';

import type { TimeEntry } from '../../app/core/models/time-tracking.interfaces';

// =============================================================================
// Raw API Response Types
// =============================================================================

/**
 * Raw API response format for TimeEntry.
 */
export interface RawTimeEntry {
  id: string;
  userId: string;
  taskItemId: string | null;
  subtaskId: string | null;
  taskKey: string | null;
  taskTitle: string | null;
  description: string | null;
  startTimeUtc: string;
  endTimeUtc: string;
  durationMinutes: number;
  isAllDay: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Creates a mock TimeEntry with sensible defaults.
 *
 * @param overrides - Partial TimeEntry to override defaults
 * @returns A complete TimeEntry for testing
 */
export function createMockTimeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    id: 'te-1',
    userId: 'user-1',
    taskItemId: 'wf-1',
    subtaskId: null,
    taskKey: 'WF-101',
    taskTitle: 'Test Task',
    description: 'Time entry description',
    startTimeUtc: now.toISOString(),
    endTimeUtc: oneHourLater.toISOString(),
    durationMinutes: 60,
    isAllDay: false,
    createdAtUtc: now.toISOString(),
    updatedAtUtc: null,
    ...overrides
  };
}

/**
 * Creates a raw API response mock for TimeEntry.
 *
 * @param overrides - Partial RawTimeEntry to override defaults
 * @returns A raw API response format for HTTP mocking
 */
export function createRawMockTimeEntry(overrides: Partial<RawTimeEntry> = {}): RawTimeEntry {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    id: 'te-1',
    userId: 'user-1',
    taskItemId: 'wf-1',
    subtaskId: null,
    taskKey: 'WF-101',
    taskTitle: 'Test Task',
    description: 'Time entry description',
    startTimeUtc: now.toISOString(),
    endTimeUtc: oneHourLater.toISOString(),
    durationMinutes: 60,
    isAllDay: false,
    createdAtUtc: now.toISOString(),
    updatedAtUtc: null,
    ...overrides
  };
}

/**
 * Creates multiple mock time entries with unique IDs.
 *
 * @param count - Number of time entries to create
 * @param overrides - Common overrides to apply to all items
 * @returns Array of TimeEntries
 */
export function createMockTimeEntries(count: number, overrides: Partial<TimeEntry> = {}): TimeEntry[] {
  const baseTime = new Date();

  return Array.from({ length: count }, (_, index) => {
    const startTime = new Date(baseTime.getTime() + index * 2 * 60 * 60 * 1000); // 2 hour intervals
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    return createMockTimeEntry({
      id: `te-${index + 1}`,
      startTimeUtc: startTime.toISOString(),
      endTimeUtc: endTime.toISOString(),
      ...overrides
    });
  });
}

/**
 * Creates an all-day time entry mock.
 */
export function createMockAllDayTimeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  return createMockTimeEntry({
    isAllDay: true,
    startTimeUtc: today.toISOString(),
    endTimeUtc: tomorrow.toISOString(),
    durationMinutes: 24 * 60,
    ...overrides
  });
}

/**
 * Creates a standalone time entry (not linked to any work item).
 */
export function createMockStandaloneTimeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return createMockTimeEntry({
    taskItemId: null,
    subtaskId: null,
    taskKey: null,
    taskTitle: null,
    description: 'Standalone time entry',
    ...overrides
  });
}
