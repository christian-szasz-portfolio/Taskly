import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoTask, SEEDED_PARENT_KEY, SEEDED_PARENT_TITLE } from '../helpers/demo';

// The seeded Story that owns five subtasks — see DemoSeedManager.cs.
test.describe('Task Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTask(page, SEEDED_PARENT_KEY);
  });

  test('loads the task detail page by issue key', async ({ page }) => {
    await expect(page.locator(Selectors.taskDetailPage)).toBeVisible();
  });

  test('shows the issue key', async ({ page }) => {
    await expect(page.locator(Selectors.issueKey)).toHaveText(SEEDED_PARENT_KEY);
  });

  test('shows the task title', async ({ page }) => {
    await expect(page.locator(Selectors.detailTitle)).toHaveText(SEEDED_PARENT_TITLE);
  });

  test('shows the edit task button', async ({ page }) => {
    await expect(page.locator(Selectors.editTaskButton)).toBeVisible();
  });

  test('shows the create subtask button', async ({ page }) => {
    await expect(page.locator(Selectors.createSubtaskButton)).toBeVisible();
  });

  test('shows task summary cards', async ({ page }) => {
    await expect(page.locator('app-task-summary-cards')).toBeVisible();
  });

  test('shows task detail sections', async ({ page }) => {
    await expect(page.locator('app-task-detail-sections')).toBeVisible();
  });

  test('shows the comment section', async ({ page }) => {
    await expect(page.locator(Selectors.commentSection)).toBeVisible();
  });

  test('clicking edit switches to the editor form', async ({ page }) => {
    await page.locator(Selectors.editTaskButton).click();
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 10000 });
  });
});
