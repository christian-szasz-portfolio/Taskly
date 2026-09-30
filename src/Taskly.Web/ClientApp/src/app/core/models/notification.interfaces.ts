/**
 * Notification type enum matching the backend.
 */
export enum NotificationType {
  ProjectActivated = 'ProjectActivated',
  ItemCreated = 'ItemCreated',
  ItemResolved = 'ItemResolved',
  ItemBacklogged = 'ItemBacklogged',
  DeadlineApproaching = 'DeadlineApproaching',
  DeadlineOverdue = 'DeadlineOverdue',
  WeeklyDigestReady = 'WeeklyDigestReady',
  ContributorAdded = 'ContributorAdded',
  ContributorRemoved = 'ContributorRemoved'
}

/**
 * Notification interface matching the backend DTO.
 */
export interface Notification {
  /** Unique identifier. */
  id: string;

  /** User ID who owns this notification. */
  userId: string;

  /** Localized title. */
  title: string;

  /** Localized message. */
  message: string | null;

  /** Notification type. */
  type: NotificationType;

  /** Whether the notification has been read. */
  isRead: boolean;

  /** When the notification was created. */
  createdAtUtc: string;

  /** When the notification was read. */
  readAtUtc: string | null;

  /** ID of the related entity. */
  relatedEntityId: string | null;

  /** Type of the related entity. */
  relatedEntityType: string | null;
}
