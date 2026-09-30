import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { DEMO_PROJECT_KEY, SEEDED_EPIC_TITLE } from '../helpers/demo';

// The seed ships one Epic per project ("Tech Debt"), so this catalog is populated, not empty.
test.describe('Epics Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tasks/${DEMO_PROJECT_KEY}/epics`);
  });

  test('loads the epics catalog page', async ({ page }) => {
    await expect(page.locator(Selectors.catalogPage)).toBeVisible({ timeout: 15000 });
  });

  test('lists the seeded epic', async ({ page }) => {
    await expect(page.locator(`text=${SEEDED_EPIC_TITLE}`).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.catalog-empty')).toHaveCount(0);
  });
});
