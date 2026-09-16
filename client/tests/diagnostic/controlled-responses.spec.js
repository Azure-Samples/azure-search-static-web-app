import { expect, test } from '@playwright/test';
import {
  bookDocument,
  expectBookCardCover,
  positiveSearchQuery,
  resultLinks,
  searchBox,
  searchPayload,
  seededDogBooks,
} from '../helpers/ui.js';

async function fulfillJson(route, payload, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });
}

test.describe('test-only controlled response diagnostics', () => {
  test('maps real seeded books to visible, successfully loaded covers', async ({ page }) => {
    const expectedBooks = seededDogBooks.slice(1, 6);
    await page.route('**/api/search', route =>
      fulfillJson(route, searchPayload(expectedBooks)));

    const coverResponses = expectedBooks.map(book =>
      page.waitForResponse(response =>
        response.url() === book.image_url && response.status() === 200));
    await Promise.all([...coverResponses, page.goto(`/search?q=${positiveSearchQuery}`)]);
    await expect(page.getByText('Showing 1-5 of 5 results for')).toBeVisible();
    for (const book of expectedBooks) {
      await expectBookCardCover(page, book);
    }
    await expect(page.locator('a[href="/details/3830"] img'))
      .not.toHaveAttribute('src', expectedBooks[1].image_url);
  });

  test('renders suggestions when a test intercept supplies HTTP 200', async ({ page }) => {
    await page.route('**/api/suggest', route =>
      fulfillJson(route, {
        suggestions: [{ text: 'Mad Dogs', document: bookDocument('9734', 'Mad Dogs') }],
      }));

    await page.goto('/');
    await searchBox(page).fill(positiveSearchQuery);
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

    await page.goto(`/search?q=${positiveSearchQuery}`);
    await expect(resultLinks(page)).toHaveCount(1);
    await searchBox(page).fill('cats');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('a[href="/details/cats"]')).toBeVisible();
    expect(requests.filter(request => request.q === 'cats')).toHaveLength(1);
  });
});
