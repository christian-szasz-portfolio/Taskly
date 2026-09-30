import { test, expect } from '@playwright/test';
import { DEMO_PROJECT_KEY, SEEDED_BACKLOG_TITLES } from '../helpers/demo';

// The seed ships two Created items per project, so the backlog is populated, not empty.
test.describe('Backlog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tasks/${DEMO_PROJECT_KEY}/backlog`);
  });

  test('loads the backlog page heading', async ({ page }) => {
    await expect(page.locator("text=Prioritize what's next")).toBeVisible({ timeout: 15000 });
  });

  test('shows the backlog eyebrow text', async ({ page }) => {
    await expect(page.locator('text=Backlog registry')).toBeVisible({ timeout: 15000 });
  });

  test('lists the seeded backlog items', async ({ page }) => {
    for (const title of SEEDED_BACKLOG_TITLES) {
      await expect(page.locator(`text=${title}`).first()).toBeVisible({ timeout: 15000 });
    }
    await expect(page.locator('.catalog-empty')).toHaveCount(0);
  });

  test('offers a move-to-open action on each backlog item', async ({ page }) => {
    await expect(page.locator(`text=${SEEDED_BACKLOG_TITLES[0]}`).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[aria-label="Move to Open"]').first()).toBeVisible({ timeout: 10000 });
  });
});
