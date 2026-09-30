import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoBoard, gotoTask, SEEDED_PARENT_KEY, SEEDED_PARENT_TITLE } from '../helpers/demo';

// The seeded Story with five subtasks. Creation is disabled in the read-only demo
// (AuthStore.canCreate === false), so the create-subtask button is disabled.
test.describe('Subtasks (read-only demo)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTask(page, SEEDED_PARENT_KEY);
  });

  test('create subtask button is visible on the detail page', async ({ page }) => {
    await expect(page.locator(Selectors.createSubtaskButton)).toBeVisible();
  });

  test('create subtask button is disabled in the demo', async ({ page }) => {
    await expect(page.locator(Selectors.createSubtaskButton)).toBeDisabled();
  });

});

// Subtasks are not listed on the detail page: the board is where they surface, as the cards of
// their parent's own row.
test.describe('Subtasks on the board', () => {
  test('the parent row shows its seeded subtasks as cards', async ({ page }) => {
    await gotoBoard(page);

    const parentRow = page.locator(Selectors.kanbanParentRow, { hasText: SEEDED_PARENT_TITLE }).first();
    await expect(parentRow).toBeVisible({ timeout: 15000 });
    await expect(parentRow.locator('text=Design dashboard wireframes').first()).toBeVisible({ timeout: 10000 });
  });
});
