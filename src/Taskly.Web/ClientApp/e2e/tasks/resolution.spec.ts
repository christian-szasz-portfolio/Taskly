import { test, expect } from '@playwright/test';
import { gotoBoard, DEMO_PROJECT_KEY } from '../helpers/demo';

/**
 * Closing an item is the one demo write path that used to be silently dropped: the board asks
 * "Close Item?", promises the item moves to the resolved list, and the client-side data layer then
 * overwrote the requested `Closed` resolution with `Fixed`. These tests drive the round-trip through
 * the UI so a regression cannot hide behind a green unit suite again.
 *
 * Both subjects come from the backend demo seed (DemoSeedManager.CreateResolvedItems):
 * one Done+Fixed item, which the board shows, and one Done+Closed item, which it must not.
 */
const FIXED_ITEM = 'Set up CI/CD pipeline';
const CLOSED_ITEM = 'Initial project scaffolding';

const resolvedPage = `/tasks/${DEMO_PROJECT_KEY}/resolved`;

test.describe('Item resolution', () => {
  test('a seeded Done+Closed item is listed as resolved and kept off the board', async ({ page }) => {
    await page.goto(resolvedPage);
    await expect(page.locator('app-task-catalog-page')).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text=${CLOSED_ITEM}`).first()).toBeVisible({ timeout: 15000 });

    await gotoBoard(page);
    await expect(page.locator(`text=${FIXED_ITEM}`).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text=${CLOSED_ITEM}`)).toHaveCount(0);
  });

  test('switching a Done item from Fixed to Closed moves it to the resolved list', async ({ page }) => {
    await gotoBoard(page);

    // Read the issue key off the card rather than hard-coding it: the seed generates keys.
    const card = page.locator('.kanban-card', { hasText: FIXED_ITEM }).first();
    await expect(card).toBeVisible({ timeout: 15000 });
    const issueKey = (await card.locator('.card__issue-key').first().innerText()).trim();
    expect(issueKey).not.toBe('');

    await page.goto(`/tasks/${DEMO_PROJECT_KEY}/${issueKey}/edit`);
    await expect(page.locator('app-task-editor-form')).toBeVisible({ timeout: 15000 });

    // The Resolution field only renders for a Done item, which is exactly this one.
    const resolutionSelect = page.locator('mat-form-field', { has: page.locator('mat-label', { hasText: 'Resolution' }) }).locator('mat-select');
    await expect(resolutionSelect).toBeVisible({ timeout: 10000 });
    await resolutionSelect.click();
    await page.locator('mat-option', { hasText: 'Closed' }).click();

    await page.locator('button', { hasText: 'Save changes' }).click();

    // Closed items leave the board...
    await gotoBoard(page);
    await expect(page.locator(`text=${FIXED_ITEM}`)).toHaveCount(0, { timeout: 15000 });

    // ...and turn up in the resolved catalog, which is what the confirm dialog promises.
    await page.goto(resolvedPage);
    await expect(page.locator(`text=${FIXED_ITEM}`).first()).toBeVisible({ timeout: 15000 });
  });
});
