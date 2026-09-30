import { expect, type Page } from '@playwright/test';
import { Selectors } from './selectors';

/**
 * Demo e2e helpers.
 *
 * The demo build is auth-free. Each Playwright test runs in an isolated browser context, so
 * localStorage starts empty, the app self-stamps a trial, and `DemoHydrationService` fetches the
 * dataset once from `GET /api/demo/seed` before handing everything over to localStorage. **The
 * .NET host must be running** (vite proxies `/api` to https://localhost:1998) or the seed fetch
 * fails silently and every visitor gets an empty workspace.
 *
 * Every constant below mirrors `Taskly.Web/Demo/DemoSeedManager.cs`. If the seed changes, this
 * file is the only place the specs need updating.
 */

/** localStorage key holding the ISO timestamp at which the demo trial started. */
export const DEMO_STARTED_KEY = 'demoStartedAt';

/** Trial length in AuthStore.DEMO_DURATION_MS, in days. */
export const DEMO_DURATION_DAYS = 7;

/** The seeded demo project: key (used in /tasks/<key> routes) and title. */
export const DEMO_PROJECT_KEY = 'DEMO';
export const DEMO_PROJECT_TITLE = 'Demo Project';

/** The inactive second project, seeded with the same structure. */
export const SAMPLE_PROJECT_TITLE = 'Sample Project';

/** Two board items in the "Other issues" row (Todo / Open), useful as "is the board populated". */
export const SEEDED_TASK_TITLES = ['Set up development environment', 'Review API documentation'] as const;

/** The Story that owns five subtasks, so it exercises the detail page's fullest layout. */
export const SEEDED_PARENT_KEY = 'DEMO-7';
export const SEEDED_PARENT_TITLE = 'Build user dashboard feature';

/** The seeded epic (Administrative status, so it is kept off the board). */
export const SEEDED_EPIC_TITLE = 'Tech Debt';

/** The two Created items that make up the backlog. */
export const SEEDED_BACKLOG_TITLES = ['Research caching strategies', 'Plan mobile app integration'] as const;

/** Done + Fixed: stays on the board. Done + Closed: moves to the resolved catalog. */
export const SEEDED_DONE_FIXED_TITLE = 'Set up CI/CD pipeline';
export const SEEDED_DONE_CLOSED_TITLE = 'Initial project scaffolding';

/** First seeded notification. */
export const SEEDED_NOTIFICATION_TITLE = 'Project Activated';
export const SEEDED_NOTIFICATION_MESSAGE = `The project '${DEMO_PROJECT_TITLE}' has been activated and is ready for use.`;

/** The fixed demo user's first name (auth.store.ts DEMO_USER). */
export const DEMO_USER_FIRST_NAME = 'Demo';

/**
 * Forces the demo trial to appear expired before the app boots, by stamping a start time older
 * than the trial window. Must be called before the first navigation.
 */
export async function expireTrial(page: Page): Promise<void> {
  const past = new Date(Date.now() - (DEMO_DURATION_DAYS + 1) * 24 * 60 * 60 * 1000).toISOString();
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [DEMO_STARTED_KEY, past] as const,
  );
}

/** Navigates to the home page and waits for the app shell to render. */
export async function gotoHome(page: Page): Promise<void> {
  await page.goto('/home');
  await expect(page.locator(Selectors.appShellTopbar)).toBeVisible({ timeout: 15000 });
}

/** Navigates to the seeded project's kanban board and waits for it to render. */
export async function gotoBoard(page: Page): Promise<void> {
  await page.goto(`/tasks/${DEMO_PROJECT_KEY}`);
  await expect(page.locator(Selectors.kanbanBoard)).toBeVisible({ timeout: 15000 });
}

/** Navigates to a task's detail page by issue key and waits for it to render. */
export async function gotoTask(page: Page, issueKey: string): Promise<void> {
  await page.goto(`/tasks/${DEMO_PROJECT_KEY}/${issueKey}`);
  await expect(page.locator(Selectors.taskDetailPage)).toBeVisible({ timeout: 15000 });
}
