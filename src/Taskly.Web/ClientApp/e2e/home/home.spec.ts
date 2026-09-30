import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { DEMO_PROJECT_TITLE, DEMO_USER_FIRST_NAME, gotoHome } from '../helpers/demo';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test('shows welcome greeting with the demo user name', async ({ page }) => {
    await expect(page.locator(Selectors.welcomeHeading)).toContainText(DEMO_USER_FIRST_NAME);
  });

  test('shows welcome message and description', async ({ page }) => {
    await expect(page.locator('.welcome-eyebrow')).toHaveText('Welcome back');
    await expect(page.locator('.welcome-body')).toContainText('Manage your projects');
  });

  test('shows "Your Projects" section heading', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Your Projects' })).toBeVisible();
  });

  test('shows the seeded demo project in the list', async ({ page }) => {
    await expect(page.locator(Selectors.projectList)).toBeVisible();
    await expect(page.locator(`text=${DEMO_PROJECT_TITLE}`).first()).toBeVisible();
  });

  test('shows create project FAB button', async ({ page }) => {
    await expect(page.locator(Selectors.createProjectButton)).toBeVisible();
  });

  test('shows notification button in header', async ({ page }) => {
    await expect(page.locator(Selectors.notificationsButton)).toBeVisible();
  });

  test('displays the app shell with header and navigation', async ({ page }) => {
    await expect(page.locator(Selectors.appShellTopbar)).toBeVisible();
    await expect(page.locator(Selectors.brandTitle)).toHaveText('Taskly');
    await expect(page.locator(Selectors.primaryNav)).toBeVisible();
  });
});
