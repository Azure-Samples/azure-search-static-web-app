import { expect, test } from '@playwright/test';
import process from 'node:process';
import {
  disableMotion,
  expandFacet,
  isApiResponse,
  searchBox,
  searchPayload,
  seededDogBooks,
  waitForSearch,
} from '../helpers/ui.js';

const books = seededDogBooks;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/suggest', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      suggestions: [{ text: books[1].title, document: books[1] }],
    }),
  }));
  await page.route('**/api/lookup*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ document: books[1] }),
  }));
  await page.route('**/api/search', async route => {
    const body = route.request().postDataJSON();
    const hasAuthor = body.filters?.some(filter => filter.field === 'authors');
    const noResults = body.q === 'qzxwvvjk607472';
    const documents = body.q === 'the'
      ? books
      : noResults
      ? []
      : hasAuthor
        ? [books[1]]
        : books;
    const count = noResults ? 0 : hasAuthor ? 1 : body.q === 'the' ? 24 : 8;
    const payload = searchPayload(documents, {
      count,
      facets: {
        authors: [{ value: 'Sharon Creech', count: 1 }],
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
    await Promise.all([...document.images].map(image => image.decode()));
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
      isApiResponse(response, 'suggest', { q: 'dog', top: 5, suggester: 'sg' }));
    await searchBox(page).fill('dog');
    await suggestion;
    await expect(page.getByText(books[1].title, { exact: true })).toBeVisible();
    await expectStateSnapshot(page, 'suggestions-desktop.png');
  });

  test('results, combined facets, and pagination', async ({ page }) => {
    await page.goto('/search?q=dog');
    await expect(page.getByText('Showing 1-8 of 8 results for')).toBeVisible();
    await expectStateSnapshot(page, 'results-desktop.png');

    await expandFacet(page, 'Authors');
    const authorFacet = process.env.DESIGN_SYSTEM_MODE === 'design'
      ? page.locator('[id="Sharon Creech"]')
      : page.locator('[id="Sharon Creech"] input[type="checkbox"]');
    await waitForSearch(
      page,
      { filters: [{ field: 'authors', value: 'Sharon Creech' }] },
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
          { field: 'authors', value: 'Sharon Creech' },
          { field: 'language_code', value: 'eng' },
        ],
      },
      () => languageFacet.click(),
    );
    await expectStateSnapshot(page, 'results-combined-facets.png');

    await page.goto('/search?q=the');
    await page.getByRole('button', { name: 'Go to next page' }).click();
    await expect(page.getByText(/Showing 9-16 of .* results for/)).toBeVisible();
    await expectStateSnapshot(page, 'results-page-2.png');
  });

  test('details result and raw data', async ({ page }) => {
    await page.goto('/details/3830');
    await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible();
    await expectStateSnapshot(page, 'details-result.png');
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
