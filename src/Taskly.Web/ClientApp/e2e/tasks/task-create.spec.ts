import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoBoard } from '../helpers/demo';

// The demo never creates tasks, so the "Create task" button is rendered but disabled.
// This documents that restriction.
test.describe('Task Create (read-only demo)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoBoard(page);
  });

  test('create task button is visible', async ({ page }) => {
    await expect(page.locator(Selectors.createTaskButton)).toBeVisible();
  });

  test('create task button is disabled in the demo', async ({ page }) => {
    await expect(page.locator(Selectors.createTaskButton)).toBeDisabled();
  });
});
