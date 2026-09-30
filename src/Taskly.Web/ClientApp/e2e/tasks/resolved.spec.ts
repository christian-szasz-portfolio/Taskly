import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';

/**
 * The backend seed ships one Done+Closed item per project (DemoSeedManager.CreateResolvedItems),
 * so this catalog is NOT empty. It used to assert an empty state, which only held while the demo
 * seed failed to load. See resolution.spec.ts for the write path that puts items here.
 */
const SEEDED_CLOSED_ITEM = 'Initial project scaffolding';

test.describe('Resolved Items Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks/DEMO/resolved');
  });

  test('loads the resolved catalog page', async ({ page }) => {
    await expect(page.locator(Selectors.catalogPage)).toBeVisible({ timeout: 15000 });
  });

  test('lists the seeded closed item', async ({ page }) => {
    await expect(page.locator(Selectors.catalogPage)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text=${SEEDED_CLOSED_ITEM}`).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.catalog-empty')).toHaveCount(0);
  });
});
