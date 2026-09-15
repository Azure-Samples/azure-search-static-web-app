import { expect, test } from '@playwright/test';
import {
  bookDocument,
  resultLinks,
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
  test('renders search results when a test intercept supplies HTTP 200', async ({ page }) => {
    await page.route('**/api/search', route =>
      fulfillJson(route, searchPayload([bookDocument('9734', 'Mad Dogs')])));

    await page.goto('/search?q=dog');
    await expect(page.getByText('Showing 1-1 of 1 results for')).toBeVisible();
    await expect(page.locator('a[href="/details/9734"]')).toBeVisible();
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
