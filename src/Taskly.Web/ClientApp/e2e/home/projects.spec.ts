import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoHome } from '../helpers/demo';

// The backend seed creates "Demo Project" (Active, key DEMO) and "Sample Project" (Inactive).
// The title asserted here has to match DemoSeedManager, not the older "Demo Workspace" wording.
test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('project list shows the seeded demo project', async ({ page }) => {
    await expect(page.locator(Selectors.projectList)).toBeVisible();
    await expect(page.locator('text=Demo Project').first()).toBeVisible();
  });

  // Projects frame the demo, so they are locked and the card's edit button never enables.
  test('project card edit button is present but disabled', async ({ page }) => {
    await expect(page.locator(Selectors.projectList)).toBeVisible();

    const editButton = page.locator(Selectors.editProjectButton).first();
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeDisabled();
  });

  test('there is no project editor, even by typing its address', async ({ page }) => {
    await expect(page.locator(Selectors.projectList)).toBeVisible();

    await page.goto('/home/projects/11111111-2222-3333-4444-555555555555/edit');

    await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });
  });

  test('project card can expand and collapse details', async ({ page }) => {
    await expect(page.locator(Selectors.projectList)).toBeVisible();

    const expandButton = page.locator(Selectors.expandDetailsButton).first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await expect(page.locator(Selectors.collapseDetailsButton).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
