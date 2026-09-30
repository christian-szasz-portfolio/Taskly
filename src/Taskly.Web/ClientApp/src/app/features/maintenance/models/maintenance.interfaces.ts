/**
 * Generic interface for paginated API responses.
 */
export interface PagedResult<T> {
  /** The items in the current page. */
  items: readonly T[];

  /** The current page number (1-based). */
  page: number;

  /** The page size. */
  pageSize: number;

  /** The total number of items across all pages. */
  totalItems: number;

  /** The total number of pages. */
  totalPages: number;

  /** Whether there is a previous page. */
  hasPreviousPage: boolean;

  /** Whether there is a next page. */
  hasNextPage: boolean;
}

/**
 * Read status filter options for notifications.
 */
export enum ReadStatusFilter {
  All = 'all',
  UnreadOnly = 'unread',
  ReadOnly = 'read'
}
