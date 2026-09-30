import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoHome } from '../helpers/demo';

// The demo seeds two unread notifications (see notification-api.service.manager.ts).
test.describe('Notification Bell', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('notification button is visible in the header', async ({ page }) => {
    await expect(page.locator(Selectors.notificationsButton)).toBeVisible();
  });

  test('notification button shows an unread badge', async ({ page }) => {
    await expect(page.locator(Selectors.notificationsButton)).toHaveClass(/mat-badge/);
  });

  test('clicking the bell opens the dropdown menu', async ({ page }) => {
    await page.locator(Selectors.notificationsButton).click();
    await expect(page.locator('.notification-menu')).toBeVisible();
  });

  test('dropdown shows the "Notifications" header', async ({ page }) => {
    await page.locator(Selectors.notificationsButton).click();
    await expect(page.locator('.notification-header__title')).toHaveText('Notifications');
  });

  test('dropdown lists seeded notification items with title, message and time', async ({ page }) => {
    await page.locator(Selectors.notificationsButton).click();
    await expect(page.locator('.notification-item').first()).toBeVisible();
    await expect(page.locator('.notification-item__title').first()).toBeVisible();
    await expect(page.locator('.notification-item__message').first()).toBeVisible();
    await expect(page.locator('.notification-item__time').first()).toBeVisible();
  });

  test('unread notifications show the unread dot', async ({ page }) => {
    await page.locator(Selectors.notificationsButton).click();
    await expect(page.locator('.notification-item--unread .unread-dot').first()).toBeVisible();
  });

  test('mark-all-as-read clears the unread list to the empty state', async ({ page }) => {
    await page.locator(Selectors.notificationsButton).click();
    await expect(page.locator('.notification-item--unread').first()).toBeVisible();

    await page.locator('.mark-all-btn').click();

    await expect(page.locator('.notification-empty')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.notification-empty')).toHaveText(/No notifications/);
  });
});
