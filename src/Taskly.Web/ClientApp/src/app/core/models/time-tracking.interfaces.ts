/**
 * Represents a time tracking entry.
 */
export interface TimeEntry {
  id: string;
  taskKey?: string | null;
  description?: string | null;
  startTimeUtc: string;
  endTimeUtc: string;
  durationMinutes: number;
  isAllDay: boolean;
  userId: string;
  taskItemId?: string | null;
  subtaskId?: string | null;
  taskTitle?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

/**
 * Payload for updating an existing time entry.
 */
export interface UpdateTimeEntryPayload {
  taskKey?: string | null;
  description?: string | null;
  startTimeUtc?: string | null;
  endTimeUtc?: string | null;
  isAllDay?: boolean | null;
}
