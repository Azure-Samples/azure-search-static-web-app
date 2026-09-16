import { expect, test } from '@playwright/test';
import {
  bookCoverURL,
  bookDocument,
  expectBookCardCover,
  resultLinks,
  routeBookCovers,
  searchBox,
  searchPayload,
} from '../helpers/ui.js';

async function fulfillJson(route, payload, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });
}

test.describe('test-only controlled response diagnostics', () => {
  test.beforeEach(async ({ page }) => {
    await routeBookCovers(page);
  });

  test('maps each book card to its visible, rendered cover', async ({ page }) => {
    const expectedBooks = [
      { document: bookDocument('9734', 'Mad Dogs'), coverURL: bookCoverURL('9734') },
      { document: bookDocument('dog-on-it', 'Dog on It'), coverURL: bookCoverURL('dog-on-it') },
      { document: bookDocument('dogs-purpose', "A Dog's Purpose"), coverURL: bookCoverURL('dogs-purpose') },
    ];
    await page.route('**/api/search', route =>
      fulfillJson(route, searchPayload(expectedBooks.map(book => book.document))));

    await page.goto('/search?q=dog');
    await expect(page.getByText('Showing 1-3 of 3 results for')).toBeVisible();
    for (const book of expectedBooks) {
      await expectBookCardCover(page, book.document, book.coverURL);
    }
  });

  test('renders suggestions when a test intercept supplies HTTP 200', async ({ page }) => {
    await page.route('**/api/suggest', route =>
      fulfillJson(route, {
        suggestions: [{ text: 'Mad Dogs', document: bookDocument('9734', 'Mad Dogs') }],
      }));

    await page.goto('/');
    await searchBox(page).fill('dog');
    await expect(page.getByText('Mad Dogs', { exact: true })).toBeVisible();
  });

  test('renders details when a test intercept supplies HTTP 200', async ({ page }) => {
    await page.route('**/api/lookup*', route =>
      fulfillJson(route, { document: bookDocument('9734', 'Mad Dogs') }));

    await page.goto('/details/9734');
    await expect(page.getByText('Mad Dogs', { exact: true }).first()).toBeVisible();
    await page.getByRole('tab', { name: 'Raw Data' }).click();
    await expect(page.locator('[role="tabpanel"]:visible')).toContainText('"id": "9734"');
  });

  test('should issue one request per submitted query', async ({ page }) => {
    test.fail(true, 'Known native defect: query state changes can issue duplicate requests.');
    const requests = [];
    await page.route('**/api/search', async route => {
      const body = route.request().postDataJSON();
      requests.push(body);
      await fulfillJson(route, searchPayload([bookDocument(body.q, body.q)]));
    });

    await page.goto('/search?q=dog');
    await expect(resultLinks(page)).toHaveCount(1);
    await searchBox(page).fill('cats');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('a[href="/details/cats"]')).toBeVisible();
    expect(requests.filter(request => request.q === 'cats')).toHaveLength(1);
  });
});
