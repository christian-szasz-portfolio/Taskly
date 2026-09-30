import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoHome } from '../helpers/demo';

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('shows the app header with brand title', async ({ page }) => {
    await expect(page.locator(Selectors.appShellTopbar)).toBeVisible();
    await expect(page.locator(Selectors.brandTitle)).toHaveText('Taskly');
  });

  test('shows primary navigation with all links', async ({ page }) => {
    await expect(page.locator(Selectors.primaryNav)).toBeVisible();

    const navLinks = ['Home', 'Kanban', 'Epics', 'Backlog', 'Resolved', 'Temporal'];
    for (const label of navLinks) {
      await expect(page.locator(`${Selectors.primaryNav} a`, { hasText: label })).toBeVisible();
    }
  });

  test('Kanban link navigates to the demo board', async ({ page }) => {
    await page.locator(`${Selectors.primaryNav} a`, { hasText: 'Kanban' }).click();
    await expect(page).toHaveURL(/\/tasks\/DEMO/);
  });

  test('Backlog link navigates to backlog page', async ({ page }) => {
    await page.locator(`${Selectors.primaryNav} a`, { hasText: 'Backlog' }).click();
    await expect(page).toHaveURL(/\/tasks\/DEMO\/backlog/);
  });

  test('Epics link navigates to epics page', async ({ page }) => {
    await page.locator(`${Selectors.primaryNav} a`, { hasText: 'Epics' }).click();
    await expect(page).toHaveURL(/\/tasks\/DEMO\/epics/);
  });

  test('Resolved link navigates to resolved page', async ({ page }) => {
    await page.locator(`${Selectors.primaryNav} a`, { hasText: 'Resolved' }).click();
    await expect(page).toHaveURL(/\/tasks\/DEMO\/resolved/);
  });

  test('Temporal link navigates to time tracking', async ({ page }) => {
    await page.locator(`${Selectors.primaryNav} a`, { hasText: 'Temporal' }).click();
    await expect(page).toHaveURL(/\/time-tracking/);
  });

  test('active link is highlighted with is-active class on /home', async ({ page }) => {
    const homeLink = page.locator(`${Selectors.primaryNav} a.is-active`, { hasText: 'Home' });
    await expect(homeLink).toBeVisible();
  });

  test('nav links have icons', async ({ page }) => {
    const links = page.locator(`${Selectors.primaryNav} a`);
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(6);

    for (let i = 0; i < count; i++) {
      await expect(links.nth(i).locator('fa-icon')).toBeVisible();
    }
  });

  test('logo image is visible', async ({ page }) => {
    await expect(page.locator('.brand-logo')).toBeVisible();
  });
});
