import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { bookDocument, routeBookCovers, searchPayload } from '../helpers/ui.js';

async function expectNoAxeViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.describe('test-only accessibility and responsive diagnostics', () => {
  test.beforeEach(async ({ page }) => {
    await routeBookCovers(page);
    await page.route('**/api/search', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(searchPayload([
        bookDocument('9734', 'Mad Dogs'),
      ])),
    }));
  });

  test('home has no automated WCAG A/AA violations', async ({ page }) => {
    test.fail(true, 'Known native defect: navigation colors miss WCAG AA contrast by 0.01.');
    await page.goto('/');
    await expect(page.getByPlaceholder('What are you looking for?')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`search results fit a ${width}px viewport`, async ({ page }) => {
      test.fail(
        width === 320,
        'Known native defect: search results overflow a 320px viewport.',
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/search?q=dog');
      await expect(page.locator('a[href="/details/9734"]')).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    });
  }
});
