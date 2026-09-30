import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoHome } from '../helpers/demo';

test.describe('Account Menu', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('account menu button is visible in the header', async ({ page }) => {
    await expect(page.locator(Selectors.accountMenuButton)).toBeVisible();
  });

  test('clicking the account menu opens the dropdown', async ({ page }) => {
    await page.locator(Selectors.accountMenuButton).click();
    await expect(page.locator('.account-menu')).toBeVisible();
  });

  for (const label of ['About', 'Preferences', 'Maintenance']) {
    test(`account menu contains the ${label} option`, async ({ page }) => {
      await page.locator(Selectors.accountMenuButton).click();
      await expect(page.locator('.account-menu__item', { hasText: label })).toBeVisible();
    });
  }

  test('account menu renders all three items', async ({ page }) => {
    await page.locator(Selectors.accountMenuButton).click();
    await expect(page.locator('.account-menu')).toBeVisible();

    // toHaveCount retries; a bare count() ran while the menu was still opening and saw zero.
    await expect(page.locator('.account-menu__item')).toHaveCount(3);
  });

  test('clicking About opens the about dialog', async ({ page }) => {
    await page.locator(Selectors.accountMenuButton).click();
    await page.locator('.account-menu__item', { hasText: 'About' }).click();
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 10000 });
  });

  test('clicking Maintenance navigates to the maintenance page', async ({ page }) => {
    await page.locator(Selectors.accountMenuButton).click();
    await page.locator('.account-menu__item', { hasText: 'Maintenance' }).click();
    await expect(page).toHaveURL(/\/maintenance/);
  });
});
