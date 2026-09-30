import { test, expect } from '@playwright/test';
import { SEEDED_NOTIFICATION_MESSAGE, SEEDED_NOTIFICATION_TITLE } from '../helpers/demo';

// Notifications come from the backend seed (DemoSeedManager.CreateDemoNotifications).
test.describe('Notifications Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maintenance/notifications');
  });

  test('loads the notifications page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible({ timeout: 15000 });
  });

  test('displays a seeded notification title', async ({ page }) => {
    await expect(page.getByText(SEEDED_NOTIFICATION_TITLE).first()).toBeVisible({ timeout: 15000 });
  });

  test('displays a seeded notification message', async ({ page }) => {
    await expect(page.getByText(SEEDED_NOTIFICATION_MESSAGE).first()).toBeVisible({ timeout: 15000 });
  });
});
