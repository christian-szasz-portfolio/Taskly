import { PAGE_BACKGROUND_CLASSES, pageClassForUrl } from './page-background.utility';

describe('pageClassForUrl', () => {
  it('maps the home area', () => {
    expect(pageClassForUrl('/home')).toBe('page-home');
    expect(pageClassForUrl('/home/projects/abc')).toBe('page-home');
  });

  it('maps the standalone areas', () => {
    expect(pageClassForUrl('/time-tracking')).toBe('page-time');
    expect(pageClassForUrl('/maintenance/system-tasks')).toBe('page-maintenance');
    expect(pageClassForUrl('/maintenance/notifications')).toBe('page-maintenance');
    expect(pageClassForUrl('/no-active-project')).toBe('page-no-project');
    expect(pageClassForUrl('/trial-expired')).toBe('page-trial');
  });

  it('maps the task catalog routes before falling back to the board', () => {
    expect(pageClassForUrl('/tasks/TAS/epics')).toBe('page-epics');
    expect(pageClassForUrl('/tasks/TAS/backlog')).toBe('page-backlog');
    expect(pageClassForUrl('/tasks/TAS/resolved')).toBe('page-resolved');
  });

  it('distinguishes the board from a task detail/edit view by segment count', () => {
    expect(pageClassForUrl('/tasks/TAS')).toBe('page-kanban');
    expect(pageClassForUrl('/tasks/TAS/TAS-1')).toBe('page-task-detail');
    expect(pageClassForUrl('/tasks/TAS/TAS-1/edit')).toBe('page-task-detail');
  });

  it('ignores query strings and fragments', () => {
    expect(pageClassForUrl('/tasks/TAS?view=grid')).toBe('page-kanban');
    expect(pageClassForUrl('/home#section')).toBe('page-home');
  });

  it('falls back to the default class for unknown routes', () => {
    expect(pageClassForUrl('/')).toBe('page-default');
    expect(pageClassForUrl('/something-else')).toBe('page-default');
  });

  it('only ever returns a known background class', () => {
    const urls = ['/home', '/tasks/TAS', '/tasks/TAS/TAS-1', '/time-tracking', '/maintenance/notifications', '/x'];
    for (const url of urls) {
      expect(PAGE_BACKGROUND_CLASSES).toContain(pageClassForUrl(url));
    }
  });
});
