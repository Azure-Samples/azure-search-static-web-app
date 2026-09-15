import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { expandFacet } from '../helpers/ui.js';

async function expectNoAxeViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.describe('automated accessibility', () => {
  test('home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('search results, facets, and pagination', async ({ page }) => {
    await page.goto('/search?q=the');
    await expect(page.getByText(/Showing 1-8 of .* results for/)).toBeVisible();
    await expandFacet(page, 'Authors');
    await expect(page.getByRole('checkbox').first()).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('details result and raw data tabs', async ({ page }) => {
    await page.goto('/details/9734');
    await expect(page.getByRole('tabpanel', { name: 'Result' })).toBeVisible();
    await expectNoAxeViolations(page);
    await page.getByRole('tab', { name: 'Raw Data' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Raw Data' })).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('open mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Toggle navigation' });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expectNoAxeViolations(page);
  });
});
