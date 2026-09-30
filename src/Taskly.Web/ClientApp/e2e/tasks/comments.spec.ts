import { test, expect } from '@playwright/test';
import { Selectors } from '../helpers/selectors';
import { gotoTask, SEEDED_PARENT_KEY } from '../helpers/demo';

// The seed ships no comments, so the thread starts empty and this spec adds its own.
test.describe('Comments', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTask(page, SEEDED_PARENT_KEY);
  });

  test('comment section is visible on the detail page', async ({ page }) => {
    await expect(page.locator(Selectors.commentSection)).toBeVisible();
  });

  test('has an input area for new comments', async ({ page }) => {
    const expandBtn = page.locator('.comment-section__expand-btn');
    const contentEditable = page.locator(`${Selectors.commentSection} [contenteditable]`);
    await expect(expandBtn.or(contentEditable.first())).toBeVisible({ timeout: 10000 });
  });

  test('can add a comment which then renders in the thread', async ({ page }) => {
    await expect(page.locator(Selectors.commentSection)).toBeVisible({ timeout: 15000 });

    // The composer starts collapsed behind an expand button; reveal it if present.
    const expandBtn = page.locator('.comment-section__expand-btn');
    await expandBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    if (await expandBtn.count() > 0) {
      await expandBtn.first().click();
    }

    const editor = page.locator('.rte__content[contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    await editor.click();
    // pressSequentially dispatches real input events so the editor's content signal updates
    // (which enables the post button), unlike fill() on a contenteditable.
    await editor.pressSequentially('A demo comment from e2e');

    const postButton = page
      .locator(`${Selectors.commentSection} button[type="submit"]`)
      .or(page.locator(`${Selectors.commentSection} button`, { hasText: /Post|Send|Add|Comment|Submit/ }))
      .first();
    await expect(postButton).toBeEnabled({ timeout: 5000 });
    await postButton.click();

    await expect(page.locator('text=A demo comment from e2e')).toBeVisible({ timeout: 10000 });
  });
});
