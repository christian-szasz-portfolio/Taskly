/**
 * Per-page background classes. Each route maps to one of these, which the app shell applies to
 * <body> so every page renders its own aurora background (see the `body.page-*` blocks in styles.scss).
 * Exported so the shell can clear the previous class before adding the next.
 */
export const PAGE_BACKGROUND_CLASSES = [
  'page-home',
  'page-kanban',
  'page-task-detail',
  'page-epics',
  'page-backlog',
  'page-resolved',
  'page-time',
  'page-maintenance',
  'page-no-project',
  'page-trial',
  'page-default',
] as const;

export type PageBackgroundClass = (typeof PAGE_BACKGROUND_CLASSES)[number];

/**
 * Maps a router URL to its per-page background class.
 *
 * Task routes are disambiguated by segment count: `/tasks/:projectKey` is the board, while a third
 * segment (`/tasks/:projectKey/:issueKey`) is a task detail/edit view. The epics/backlog/resolved
 * catalog routes are matched first since they are more specific.
 */
export function pageClassForUrl(url: string): PageBackgroundClass {
  const path = url.split('?')[0].split('#')[0];

  if (path.startsWith('/home')) return 'page-home';
  if (path.startsWith('/time-tracking')) return 'page-time';
  if (path.startsWith('/maintenance')) return 'page-maintenance';
  if (path.startsWith('/no-active-project')) return 'page-no-project';
  if (path.startsWith('/trial-expired')) return 'page-trial';

  if (path.startsWith('/tasks')) {
    if (path.endsWith('/epics')) return 'page-epics';
    if (path.endsWith('/backlog')) return 'page-backlog';
    if (path.endsWith('/resolved')) return 'page-resolved';
    const segments = path.split('/').filter(Boolean); // ['tasks', projectKey, (issueKey?), ('edit'?)]
    return segments.length >= 3 ? 'page-task-detail' : 'page-kanban';
  }

  return 'page-default';
}
