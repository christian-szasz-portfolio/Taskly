import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { expireTrial, gotoHome } from '../helpers/demo';

test.describe('Demo trial', () => {
  test('fresh visitor lands on the home shell with a seeded workspace', async ({ page }) => {
    await gotoHome(page);

    await expect(page.locator(Selectors.brandTitle)).toHaveText('Taskly');
    await expect(page.locator(Selectors.primaryNav)).toBeVisible();
  });

  test('expired trial is redirected to the trial-expired splash', async ({ page }) => {
    await expireTrial(page);
    await page.goto('/tasks/DEMO');

    await expect(page).toHaveURL(/\/trial-expired/);
  });
});
