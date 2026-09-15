import { expect, test } from '@playwright/test';
import process from 'node:process';
import {
  bookDocument,
  disableMotion,
  expandFacet,
  isApiResponse,
  searchBox,
  searchPayload,
  waitForSearch,
} from '../helpers/ui.js';

const books = [
  bookDocument('9734', 'Mad Dogs', { authors: ['Robert Muchamore'] }),
  ...Array.from({ length: 6 }, (_, index) =>
    bookDocument(`book-${index}`, `Book result ${index + 1}`)),
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/suggest', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      suggestions: [{ text: 'Mad Dogs', document: books[0] }],
    }),
  }));
  await page.route('**/api/lookup*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ document: books[0] }),
  }));
  await page.route('**/api/search', async route => {
    const body = route.request().postDataJSON();
    const hasAuthor = body.filters?.some(filter => filter.field === 'authors');
    const noResults = body.q === 'qzxwvvjk607472';
    const documents = body.q === 'the'
      ? Array.from({ length: 8 }, (_, index) =>
        bookDocument(`page-${(body.skip || 0) + index}`, `Page result ${(body.skip || 0) + index + 1}`))
      : noResults
      ? []
      : hasAuthor
        ? [books[0]]
        : books;
    const count = noResults ? 0 : hasAuthor ? 1 : body.q === 'the' ? 24 : 7;
    const payload = searchPayload(documents, {
      count,
      facets: {
        authors: [{ value: 'Robert Muchamore', count: 1 }],
        language_code: [{ value: 'eng', count: hasAuthor ? 1 : 4 }],
      },
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });
});

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
    await expect(searchBox(page)).toBeVisible();
    await expectStateSnapshot(page, 'home-desktop.png');
  });

  test('home mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(searchBox(page)).toBeVisible();
    if (process.env.DESIGN_SYSTEM_MODE === 'design') {
      await page.getByRole('button', { name: /Toggle navigation|menu/i }).click();
      await expect(page.getByRole('menuitem', { name: 'Search', exact: true })).toBeVisible();
    }
    await expectStateSnapshot(page, 'home-mobile-menu.png');
  });

  test('suggestions', async ({ page }) => {
    await page.goto('/');
    const suggestion = page.waitForResponse(response =>
      isApiResponse(response, 'suggest', { q: 'dogs', top: 5, suggester: 'sg' }));
    await searchBox(page).fill('dogs');
    await suggestion;
    await expect(page.getByText('Mad Dogs', { exact: true })).toBeVisible();
    await expectStateSnapshot(page, 'suggestions-desktop.png');
  });

  test('results, combined facets, and pagination', async ({ page }) => {
    await page.goto('/search?q=dogs');
    await expect(page.getByText('Showing 1-7 of 7 results for')).toBeVisible();
    await expectStateSnapshot(page, 'results-desktop.png', {
      mask: [page.locator('main img')],
    });

    await expandFacet(page, 'Authors');
    const authorFacet = process.env.DESIGN_SYSTEM_MODE === 'design'
      ? page.locator('[id="Robert Muchamore"]')
      : page.locator('[id="Robert Muchamore"] input[type="checkbox"]');
    await waitForSearch(
      page,
      { filters: [{ field: 'authors', value: 'Robert Muchamore' }] },
      () => authorFacet.click(),
    );
    await expandFacet(page, 'Language code');
    const languageFacet = process.env.DESIGN_SYSTEM_MODE === 'design'
      ? page.locator('[id="eng"]')
      : page.locator('[id="eng"] input[type="checkbox"]');
    await waitForSearch(
      page,
      {
        filters: [
          { field: 'authors', value: 'Robert Muchamore' },
          { field: 'language_code', value: 'eng' },
        ],
      },
      () => languageFacet.click(),
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
    await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible();
    await expectStateSnapshot(page, 'details-result.png', {
      mask: [page.locator('main img')],
    });
    await page.getByRole('tab', { name: 'Raw Data' }).click();
    await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible();
    await expectStateSnapshot(page, 'details-raw-data.png');
  });

  test('no results', async ({ page }) => {
    await page.goto('/search?q=qzxwvvjk607472');
    await expect(page.getByText(/Showing 0-0 of 0 results for|No results found for/)).toBeVisible();
    await expectStateSnapshot(page, 'no-results.png');
  });
});
