import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoHome } from '../helpers/demo';

test.describe('Layout & Shell', () => {
  test('demo pages show the full app shell with header', async ({ page }) => {
    await gotoHome(page);

    await expect(page.locator(Selectors.appShellTopbar)).toBeVisible();
    await expect(page.locator(Selectors.primaryNav)).toBeVisible();
    await expect(page.locator(Selectors.notificationsButton)).toBeVisible();
    await expect(page.locator(Selectors.accountMenuButton)).toBeVisible();
  });

  test('header displays "Taskly" brand title', async ({ page }) => {
    await gotoHome(page);

    await expect(page.locator(Selectors.brandTitle)).toHaveText('Taskly');
  });

  test('header shows notifications and account menu on the right', async ({ page }) => {
    await gotoHome(page);

    await expect(page.locator('.topbar__actions')).toBeVisible();
    await expect(page.locator(Selectors.notificationsButton)).toBeVisible();
    await expect(page.locator(Selectors.accountMenuButton)).toBeVisible();
  });

  test('responsive: header is visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoHome(page);

    await expect(page.locator(Selectors.appShellTopbar)).toBeVisible();
  });

  test('trial-expired splash renders the demo expiry card', async ({ page }) => {
    await page.goto('/trial-expired');

    await expect(page.locator('.trial-expired .card')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Your demo session has expired' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start another trial' })).toBeVisible();
  });
});
