import { test, expect } from '@playwright/test';

// The demo has no server-side background jobs, so the system-tasks list is empty —
// only the page heading is asserted here.
test.describe('System Tasks Page', () => {
  test('loads the system tasks page', async ({ page }) => {
    await page.goto('/maintenance/system-tasks');

    await expect(page.getByRole('heading', { name: 'System Tasks' })).toBeVisible({ timeout: 15000 });
  });
});
