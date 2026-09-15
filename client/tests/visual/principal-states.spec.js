import { expect, test } from '@playwright/test';
import {
  disableMotion,
  expandFacet,
  isApiResponse,
  searchBox,
  waitForSearch,
} from '../helpers/ui.js';

async function prepareSnapshot(page) {
  await disableMotion(page);
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await Promise.all(
      [...document.images].map(image =>
        image.complete
          ? Promise.resolve()
          : new Promise(resolve => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            })),
    );
  });
}

async function expectStateSnapshot(page, name, options = {}) {
  await prepareSnapshot(page);
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    fullPage: true,
    ...options,
  });
}

test.describe('reviewed visual baselines', () => {
  test('home desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expectStateSnapshot(page, 'home-desktop.png');
  });

  test('home mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
    await expectStateSnapshot(page, 'home-mobile-menu.png');
  });

  test('suggestions', async ({ page }) => {
    await page.goto('/');
    const suggestion = page.waitForResponse(response =>
      isApiResponse(response, 'suggest', { q: 'dogs', top: 5, suggester: 'sg' }));
    await searchBox(page).fill('dogs');
    await suggestion;
    await expect(page.getByRole('option', { name: 'Mad Dogs', exact: true })).toBeVisible();
    await expectStateSnapshot(page, 'suggestions-desktop.png');
  });

  test('results, combined facets, and pagination', async ({ page }) => {
    await page.goto('/search?q=dogs');
    await expect(page.getByText('Showing 1-7 of 7 results for')).toBeVisible();
    await expectStateSnapshot(page, 'results-desktop.png', {
      mask: [page.locator('main img')],
    });

    await expandFacet(page, 'Authors');
    await waitForSearch(
      page,
      { filters: [{ field: 'authors', value: 'Robert Muchamore' }] },
      () => page.getByRole('checkbox', { name: 'Robert Muchamore (1)' }).check(),
    );
    await expandFacet(page, 'Language code');
    await waitForSearch(
      page,
      {
        filters: [
          { field: 'authors', value: 'Robert Muchamore' },
          { field: 'language_code', value: 'eng' },
        ],
      },
      () => page.getByRole('checkbox', { name: 'eng (1)' }).check(),
    );
    await expectStateSnapshot(page, 'results-combined-facets.png', {
      mask: [page.locator('main img')],
    });

    await page.goto('/search?q=the');
    await page.getByRole('button', { name: 'Go to next page' }).click();
    await expect(page.getByText(/Showing 9-16 of .* results for/)).toBeVisible();
    await expectStateSnapshot(page, 'results-page-2.png', {
      mask: [page.locator('main img')],
    });
  });

  test('details result and raw data', async ({ page }) => {
    await page.goto('/details/9734');
    await expect(page.getByRole('tabpanel', { name: 'Result' })).toBeVisible();
    await expectStateSnapshot(page, 'details-result.png', {
      mask: [page.locator('main img')],
    });
    await page.getByRole('tab', { name: 'Raw Data' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Raw Data' })).toBeVisible();
    await expectStateSnapshot(page, 'details-raw-data.png');
  });

  test('no results', async ({ page }) => {
    await page.goto('/search?q=qzxwvvjk607472');
    await expect(page.getByText('Showing 0-0 of 0 results for')).toBeVisible();
    await expectStateSnapshot(page, 'no-results.png');
  });
});
