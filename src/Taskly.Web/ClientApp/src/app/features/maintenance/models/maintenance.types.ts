import type { SystemTaskState } from '../../../core/models/system-task.interfaces';
import type { NotificationType } from '../../../core/models/notification.interfaces';
import type { ReadStatusFilter } from './maintenance.interfaces';

/**
 * Filter parameters for paginating system tasks.
 */
export interface SystemTaskFilter {
  /** Page number (1-based). */
  page: number;

  /** Number of items per page. */
  pageSize: number;

  /** Start date filter (ISO string). */
  fromDate?: string;

  /** End date filter (ISO string). */
  toDate?: string;

  /** State filter. */
  state?: SystemTaskState;

  /** Search term for task name. */
  search?: string;
}

/**
 * Filter parameters for paginating notifications.
 */
export interface NotificationFilter {
  /** Page number (1-based). */
  page: number;

  /** Number of items per page. */
  pageSize: number;

  /** Start date filter (ISO string). */
  fromDate?: string;

  /** End date filter (ISO string). */
  toDate?: string;

  /** Notification type filter. */
  type?: NotificationType;

  /** Read status filter. */
  readStatus?: ReadStatusFilter;

  /** Search term for notification title. */
  search?: string;
}

/**
 * Default system task filter values.
 */
export const DEFAULT_SYSTEM_TASK_FILTER: SystemTaskFilter = {
  page: 1,
  pageSize: 20
};

/**
 * Default notification filter values.
 */
export const DEFAULT_NOTIFICATION_FILTER: NotificationFilter = {
  page: 1,
  pageSize: 20
};
