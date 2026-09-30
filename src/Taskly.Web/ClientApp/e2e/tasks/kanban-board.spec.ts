import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoBoard, SEEDED_TASK_TITLES } from '../helpers/demo';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await gotoBoard(page);
  });

  test('loads the kanban board page', async ({ page }) => {
    await expect(page.locator(Selectors.kanbanBoard)).toBeVisible();
  });

  test('shows the hero section', async ({ page }) => {
    await expect(page.locator(Selectors.heroSection)).toBeVisible();
  });

  test('shows hero summary cards with stats', async ({ page }) => {
    await expect(page.locator('.hero-card')).toHaveCount(6);
  });

  test('shows create task button', async ({ page }) => {
    await expect(page.locator(Selectors.createTaskButton)).toBeVisible();
  });

  test('shows refresh board button', async ({ page }) => {
    await expect(page.locator(Selectors.refreshBoardButton)).toBeVisible();
  });

  test('hero section can be collapsed and expanded', async ({ page }) => {
    const collapseButton = page.locator('.hero__collapse-btn');
    await expect(collapseButton).toBeVisible();

    await collapseButton.click();
    await expect(page.locator('.hero-card')).toHaveCount(0, { timeout: 5000 });

    await collapseButton.click();
    await expect(page.locator('.hero-card')).toHaveCount(6, { timeout: 5000 });
  });

  test('displays task items as kanban rows', async ({ page }) => {
    const rows = page.locator(`${Selectors.kanbanParentRow}, ${Selectors.kanbanOtherRow}`);
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test('shows a seeded task title in a board row', async ({ page }) => {
    await expect(page.locator(`text=${SEEDED_TASK_TITLES[0]}`)).toBeVisible({ timeout: 10000 });
  });

  test('shows the status chart in the hero section', async ({ page }) => {
    await expect(page.locator('app-task-status-chart')).toBeVisible();
  });

  test('refresh button keeps the board rendered', async ({ page }) => {
    await page.locator(Selectors.refreshBoardButton).click();
    await expect(page.locator(Selectors.kanbanBoard)).toBeVisible();
    await expect(page.locator(`text=${SEEDED_TASK_TITLES[0]}`)).toBeVisible({ timeout: 10000 });
  });
});
