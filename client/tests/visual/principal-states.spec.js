import { expect, test } from '@playwright/test';
import {
  disableMotion,
  expandFacet,
  isApiResponse,
  positiveSearchQuery,
  resultLinks,
  searchBox,
  searchPayload,
  seededDogBooks,
  seededDogPage2,
  seededDogSuggestions,
  waitForSearch,
} from '../helpers/ui.js';

const books = seededDogBooks;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/suggest', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      suggestions: seededDogSuggestions,
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
    const documents = noResults
      ? []
      : hasAuthor
        ? [books[1]]
        : body.skip === 8
          ? seededDogPage2
          : books;
    const count = noResults ? 0 : hasAuthor ? 1 : 24;
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
    await page.getByRole('button', { name: /Toggle navigation|menu/i }).click();
    await expect(page.getByRole('menuitem', { name: 'Search', exact: true })).toBeVisible();
    await expectStateSnapshot(page, 'home-mobile-menu.png');
  });

  test('shows all five seeded dog suggestions in cloud order', async ({ page }) => {
    await page.goto('/');
    const suggestion = page.waitForResponse(response =>
      isApiResponse(response, 'suggest', { q: positiveSearchQuery, top: 5, suggester: 'sg' }));
    await searchBox(page).fill(positiveSearchQuery);
    await suggestion;
    const options = page.getByRole('option');
    await expect(options).toHaveCount(seededDogSuggestions.length);
    await expect(options).toHaveText(seededDogSuggestions.map(suggestion => suggestion.text));
    for (const option of await options.all()) {
      await expect(option).toBeVisible();
    }
    await expectStateSnapshot(page, 'suggestions-desktop.png');
  });

  test('dog page 1 and page 2 preserve query, ranges, and distinct books', async ({ page }) => {
    await page.goto(`/search?q=${positiveSearchQuery}`);
    await expect(page).toHaveURL(new RegExp(`/search\\?q=${positiveSearchQuery}$`));
    await expect(searchBox(page)).toHaveValue(positiveSearchQuery);
    await expect(page.getByText('Showing 1-8 of 24 results for')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to page 3' })).toBeVisible();
    const firstPageIds = await resultLinks(page).evaluateAll(links =>
      links.map(link => link.getAttribute('href')));
    await expectStateSnapshot(page, 'results-desktop.png');

    await expandFacet(page, 'Authors');
    const authorFacet = page.locator('[id="Sharon Creech"] input[type="checkbox"]');
    await waitForSearch(
      page,
      { filters: [{ field: 'authors', value: 'Sharon Creech' }] },
      () => authorFacet.click(),
    );
    await expandFacet(page, 'Language code');
    const languageFacet = page.locator('[id="eng"] input[type="checkbox"]');
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

    await page.goto(`/search?q=${positiveSearchQuery}`);
    await waitForSearch(
      page,
      { q: positiveSearchQuery, skip: 8, top: 8 },
      () => page.getByRole('button', { name: 'Go to next page' }).click(),
    );
    await expect(page).toHaveURL(new RegExp(`/search\\?q=${positiveSearchQuery}$`));
    await expect(searchBox(page)).toHaveValue(positiveSearchQuery);
    await expect(page.getByText('Showing 9-16 of 24 results for')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to page 3' })).toBeVisible();
    const secondPageIds = await resultLinks(page).evaluateAll(links =>
      links.map(link => link.getAttribute('href')));
    expect(secondPageIds).not.toEqual(firstPageIds);
    expect(secondPageIds.filter(id => firstPageIds.includes(id))).toEqual([]);
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
