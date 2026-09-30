import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { DEMO_PROJECT_KEY, SEEDED_PARENT_KEY, SEEDED_PARENT_TITLE } from '../helpers/demo';

// Editing existing items IS allowed in the demo (AuthStore.canWrite === true while the trial is
// active) — only creation is disabled, and projects are locked separately via canEditProject.
const editRoute = `/tasks/${DEMO_PROJECT_KEY}/${SEEDED_PARENT_KEY}/edit`;
const viewRoute = `/tasks/${DEMO_PROJECT_KEY}/${SEEDED_PARENT_KEY}`;

test.describe('Task Edit', () => {
  test('edit mode shows the editor form', async ({ page }) => {
    await page.goto(editRoute);
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 15000 });
  });

  test('edit form is pre-filled with the existing title', async ({ page }) => {
    await page.goto(editRoute);
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 15000 });

    const titleInput = page.locator('app-task-editor-form input').first();
    await expect(titleInput).toHaveValue(SEEDED_PARENT_TITLE, { timeout: 5000 });
  });

  test('edit form has save and discard buttons', async ({ page }) => {
    await page.goto(editRoute);
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 15000 });

    await expect(page.locator('button', { hasText: 'Save changes' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Discard' })).toBeVisible();
  });

  test('discard returns to view mode', async ({ page }) => {
    await page.goto(editRoute);
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 15000 });

    await page.locator('button', { hasText: 'Discard' }).click();
    await expect(page.locator(Selectors.editTaskButton)).toBeVisible({ timeout: 10000 });
  });

  test('navigating from view to edit via the edit button', async ({ page }) => {
    await page.goto(viewRoute);
    await expect(page.locator(Selectors.editTaskButton)).toBeVisible({ timeout: 15000 });

    await page.locator(Selectors.editTaskButton).click();
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 10000 });
  });

  test('saving an edited title persists it to the detail view', async ({ page }) => {
    await page.goto(editRoute);
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 15000 });

    const edited = `${SEEDED_PARENT_TITLE} (edited)`;
    const titleInput = page.locator('app-task-editor-form input').first();
    await titleInput.clear();
    await titleInput.fill(edited);

    await page.locator('button', { hasText: 'Save changes' }).click();

    await expect(page.locator(Selectors.detailTitle)).toHaveText(edited, { timeout: 15000 });
  });
});
