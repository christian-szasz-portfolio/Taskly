import { test, expect } from '@playwright/test';

// The demo seeds two time entries (WF-101, OPS-204) — see time-entry-api.service.manager.ts.
test.describe('Time Tracking Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/time-tracking');
    await expect(page.locator('.calendar-toolbar')).toBeVisible({ timeout: 15000 });
  });

  test('loads the time tracking page with a toolbar', async ({ page }) => {
    await expect(page.locator('.calendar-toolbar')).toBeVisible();
  });

  test('shows the calendar title', async ({ page }) => {
    await expect(page.locator('.calendar-title')).toBeVisible();
  });

  test('renders seeded time entries as calendar events', async ({ page }) => {
    await expect(page.locator('.fc-event').first()).toBeVisible({ timeout: 10000 });
  });

  test('has previous and next navigation buttons', async ({ page }) => {
    const prev = page.locator('button[mattooltip="Previous"]').or(page.locator('.nav-buttons button').first());
    const next = page.locator('button[mattooltip="Next"]').or(page.locator('.nav-buttons button').last());
    await expect(prev.first()).toBeVisible({ timeout: 5000 });
    await expect(next.first()).toBeVisible({ timeout: 5000 });
  });

  test('navigating keeps the calendar rendered', async ({ page }) => {
    const prev = page.locator('button[mattooltip="Previous"]').or(page.locator('.nav-buttons button').first());
    await prev.first().click();
    await expect(page.locator('.calendar-toolbar')).toBeVisible();
  });
});
