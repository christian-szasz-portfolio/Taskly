/**
 * System task state enum matching the backend.
 */
export enum SystemTaskState {
  Starting = 'Starting',
  Started = 'Started',
  Cancelled = 'Cancelled',
  Finished = 'Finished'
}

/**
 * System task interface matching the backend DTO.
 */
export interface SystemTask {
  /** Unique identifier. */
  id: string;

  /** User ID who performed the task. */
  userId: string;

  /** Localized display name of the task. */
  name: string;

  /** Localized description of the task. */
  description: string | null;

  /** Current state of the task. */
  state: SystemTaskState;

  /** UTC timestamp when the task was created. */
  createdAtUtc: string;

  /** UTC timestamp when the task completed. */
  completedAtUtc: string | null;

  /** ID of the related entity. */
  relatedEntityId: string | null;

  /** Type of the related entity. */
  relatedEntityType: string | null;
}
