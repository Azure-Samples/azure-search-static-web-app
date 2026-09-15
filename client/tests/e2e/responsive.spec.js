import { expect, test } from '@playwright/test';
import {
  assertNoDocumentOverflow,
  expandFacet,
  resultLinks,
} from '../helpers/ui.js';

const viewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`principal states fit a ${viewport.width}px viewport`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await assertNoDocumentOverflow(page);

    if (viewport.width < 992) {
      const menu = page.getByRole('button', { name: 'Toggle navigation' });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
      await assertNoDocumentOverflow(page);
      await menu.click();
    }

    await page.goto('/search?q=the');
    await expect(resultLinks(page).first()).toBeVisible();
    await expandFacet(page, 'Authors');
    await expect(page.getByRole('checkbox').first()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Search results pagination' })).toBeVisible();
    await assertNoDocumentOverflow(page);

    await page.getByRole('button', { name: 'Go to next page' }).click();
    await expect(page.getByText(/Showing 9-16 of .* results for/)).toBeVisible();
    await assertNoDocumentOverflow(page);

    await page.goto('/details/9734');
    await expect(page.getByRole('tabpanel', { name: 'Result' })).toBeVisible();
    await assertNoDocumentOverflow(page);
    await page.getByRole('tab', { name: 'Raw Data' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Raw Data' })).toBeVisible();
    await assertNoDocumentOverflow(page);
  });
}
