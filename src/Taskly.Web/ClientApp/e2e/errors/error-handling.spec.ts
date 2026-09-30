import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';

test.describe('Error Handling', () => {
  test('unknown routes redirect to home', async ({ page }) => {
    await page.goto('/some/unknown/route');
    await page.waitForURL(/\/home/, { timeout: 15000 });
    await expect(page.locator(Selectors.appShellTopbar)).toBeVisible();
  });

  test('a non-existent task key does not crash the app', async ({ page }) => {
    await page.goto('/tasks/DEMO/NOPE-999');

    // Either a not-found/error state, or the app shell still renders gracefully.
    await page.waitForTimeout(2000);
    const errorVisible = await page.getByText(/not found|error|does not exist/i).first().isVisible().catch(() => false);
    const shellVisible = await page.locator(Selectors.appShellTopbar).isVisible();
    expect(errorVisible || shellVisible).toBe(true);
  });

  test('deep-linking directly to the board renders it', async ({ page }) => {
    await page.goto('/tasks/DEMO');
    await expect(page.locator(Selectors.kanbanBoard)).toBeVisible({ timeout: 15000 });
  });
});
