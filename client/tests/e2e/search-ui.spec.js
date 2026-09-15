import { expect, test } from '@playwright/test';
import process from 'node:process';

const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:7071';

function isApiResponse(response, operation, body = {}) {
  if (response.url() !== `${apiURL}/api/${operation}` || response.request().method() !== 'POST') {
    return false;
  }

  const requestBody = response.request().postDataJSON();
  return Object.entries(body).every(([key, value]) =>
    JSON.stringify(requestBody[key]) === JSON.stringify(value));
}

async function waitForSearch(page, body, action) {
  const [response] = await Promise.all([
    page.waitForResponse(response => isApiResponse(response, 'search', body)),
    action(),
  ]);
  expect(response.status()).toBe(200);
  return response.json();
}

async function submitHomeSearch(page, query, keyboard = true) {
  const searchBox = page.getByRole('combobox', { name: 'What are you looking for?' });
  await searchBox.fill(query);
  return waitForSearch(page, { q: query || '*', skip: 0 }, async () => {
    if (keyboard) {
      await searchBox.press('Enter');
    } else {
      await page.getByRole('button', { name: 'Search' }).click();
    }
  });
}

async function expandFacet(page, name) {
  const button = page.getByRole('button', { name });
  if (await button.getAttribute('aria-expanded') === 'false') {
    await button.click();
  }
}

test.describe('search UI', () => {
  test('home is accessible at desktop and mobile viewports', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'What are you looking for?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeVisible();
    const searchBox = page.getByRole('combobox', { name: 'What are you looking for?' });
    await expect(searchBox).toBeVisible();
    expect((await searchBox.boundingBox()).width).toBeGreaterThan(180);
  });

  test('shows correlated d, do, dog, and dogs suggestions', async ({ page }) => {
    await page.goto('/');
    const searchBox = page.getByRole('combobox', { name: 'What are you looking for?' });
    const fixtures = [
      ['d', '"D" is for Deadbeat'],
      ['do', "I Do (But I Don't)"],
      ['dog', 'Dog on It'],
      ['dogs', 'Mad Dogs'],
    ];

    for (const [query, suggestion] of fixtures) {
      const responsePromise = page.waitForResponse(
        response => isApiResponse(response, 'suggest', { q: query, top: 5, suggester: 'sg' }),
      );
      await searchBox.fill(query);
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      await expect(page.getByRole('option', { name: suggestion, exact: true })).toBeVisible();
    }
  });

  test('submits home and search-page queries without stale pagination', async ({ page }) => {
    await page.goto('/');
    const dogs = await submitHomeSearch(page, 'dogs');
    await expect(page).toHaveURL(/\/search\?q=dogs$/);
    await expect(page.getByText('Showing 1-7 of 7 results for')).toBeVisible();

    const expectedOrder = dogs.results.map(result => result.document.id);
    const links = page.locator('.results a');
    await expect(links).toHaveCount(expectedOrder.length);
    expect(await links.evaluateAll(elements =>
      elements.map(element => element.getAttribute('href').split('/').pop()),
    )).toEqual(expectedOrder);
    await expect(page.getByRole('link', {
      name: 'View details for Inside of a Dog: What Dogs See, Smell, and Know',
    })).toBeVisible();

    const queryBox = page.getByRole('combobox', { name: 'What are you looking for?' });
    const cats = await waitForSearch(page, { q: 'cats', skip: 0 }, async () => {
      await queryBox.fill('cats');
      await page.getByRole('button', { name: 'Search' }).click();
    });
    await expect(page).toHaveURL(/\/search\?q=cats$/);
    await expect(page.locator('.results a')).toHaveCount(cats.results.length);
  });

  test('applies and clears author and language facets', async ({ page }) => {
    await page.goto('/search?q=dogs');
    await expect(page.getByText('Showing 1-7 of 7 results for')).toBeVisible();
    await expandFacet(page, 'Authors');

    await waitForSearch(
      page,
      { filters: [{ field: 'authors', value: 'Robert Muchamore' }] },
      () => page.getByRole('checkbox', { name: 'Robert Muchamore (1)' }).check(),
    );
    await expect(page.getByRole('button', {
      name: 'Remove Authors: Robert Muchamore filter',
    })).toBeVisible();
    await expect(page.locator('.results a')).toHaveCount(1);

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
    await expect(page.getByRole('button', {
      name: 'Remove Language code: eng filter',
    })).toBeVisible();
    await expect(page.locator('.results a')).toHaveCount(1);

    await waitForSearch(
      page,
      { filters: [{ field: 'language_code', value: 'eng' }] },
      () => page.getByRole('button', {
        name: 'Remove Authors: Robert Muchamore filter',
      }).click(),
    );
    await expect(page.locator('.results a')).toHaveCount(4);

    await waitForSearch(
      page,
      { filters: [] },
      () => page.getByRole('checkbox', { name: 'eng (4)' }).uncheck(),
    );
    await expect(page.getByRole('button', {
      name: 'Remove Language code: eng filter',
    })).toHaveCount(0);
    await expect(page.locator('.results a')).toHaveCount(7);
  });

  test('paginates, resets to page one, and ignores stale results', async ({ page }) => {
    await page.goto('/search?q=the');
    await expect(page.getByText(/Showing 1-8 of .* results for/)).toBeVisible();
    const firstPage = await page.locator('.results a').evaluateAll(elements =>
      elements.map(element => element.getAttribute('href')),
    );

    const second = await waitForSearch(
      page,
      { q: 'the', top: 8, skip: 8 },
      () => page.getByRole('button', { name: 'Go to next page' }).click(),
    );
    await expect(page.getByText(/Showing 9-16 of .* results for/)).toBeVisible();
    expect(second.results.map(result => `/details/${result.document.id}`))
      .not.toEqual(firstPage);

    const queryBox = page.getByRole('combobox', { name: 'What are you looking for?' });
    const cats = await waitForSearch(page, { q: 'cats', skip: 0 }, async () => {
      await queryBox.fill('cats');
      await queryBox.press('Enter');
    });
    await expect(page.getByText(`Showing 1-${cats.count} of ${cats.count} results for`)).toBeVisible();
    await expect(page.getByLabel('Page 1, current page')).toBeVisible();
    await expect(page.locator('.results a')).toHaveCount(cats.results.length);
  });

  test('keeps details Result and Raw Data in parity through reload and Back', async ({ page }) => {
    await page.goto('/search?q=dogs');
    await expect(page.getByRole('link', { name: 'View details for Mad Dogs' })).toBeVisible();
    const [lookupResponse] = await Promise.all([
      page.waitForResponse(response =>
        response.url() === `${apiURL}/api/lookup?id=9734` &&
        response.request().method() === 'GET'),
      page.getByRole('link', { name: 'View details for Mad Dogs' }).click(),
    ]);
    const lookup = await lookupResponse.json();

    await expect(page).toHaveURL(/\/details\/9734$/);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: lookup.document.original_title })).toBeVisible();
    await expect(page.getByRole('tabpanel', { name: 'Result' })).toBeVisible();
    await expect(page.locator('.card-text')).toHaveText([
      `${lookup.document.authors.join('; ')} - ${lookup.document.original_publication_year}`,
      `ISBN ${lookup.document.isbn}`,
      `${lookup.document.ratings_count} Ratings`,
    ]);
    await page.getByRole('tab', { name: 'Raw Data' }).click();
    const rawData = page.getByRole('tabpanel', { name: 'Raw Data' }).locator('code');
    expect(JSON.parse(await rawData.textContent())).toEqual(lookup.document);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Mad Dogs' })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/search\?q=dogs$/);
    await expect(page.getByText('Showing 1-7 of 7 results for')).toBeVisible();
    await expect(page.getByText('Loading...')).toHaveCount(0);
  });

  test('handles direct URLs, reload, empty queries, and no results', async ({ page }) => {
    await page.goto('/search?q=dogs');
    await expect(page.getByText('Showing 1-7 of 7 results for')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Showing 1-7 of 7 results for')).toBeVisible();

    const queryBox = page.getByRole('combobox', { name: 'What are you looking for?' });
    await waitForSearch(page, { q: '*', skip: 0 }, async () => {
      await queryBox.fill('');
      await page.getByRole('button', { name: 'Search' }).click();
    });
    await expect(page).toHaveURL(/\/search\?q=\*$/);
    await expect(page.getByText(/Showing 1-8 of 10,000 results for/)).toBeVisible();

    await waitForSearch(page, { q: 'qzxwvvjk607472', skip: 0 }, async () => {
      await queryBox.fill('qzxwvvjk607472');
      await queryBox.press('Enter');
    });
    await expect(page.getByText('Showing 0-0 of 0 results for')).toBeVisible();
    await expect(page.locator('.results a')).toHaveCount(0);
  });
});
