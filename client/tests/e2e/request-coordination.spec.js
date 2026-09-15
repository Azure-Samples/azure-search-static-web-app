import { expect, test } from '@playwright/test';
import {
  apiURL,
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

test.describe('request coordination', () => {
  test('issues exactly one search request for each submitted query', async ({ page }) => {
    const requests = [];
    await page.route(`${apiURL}/api/search`, async route => {
      const body = route.request().postDataJSON();
      requests.push(body);
      await fulfillJson(route, searchPayload([
        bookDocument(body.q, `${body.q} result`),
      ]));
    });

    await page.goto('/search?q=dogs');
    await expect(page.getByRole('link', { name: 'View details for dogs result' })).toBeVisible();
    expect(requests.filter(request => request.q === 'dogs')).toHaveLength(1);

    await searchBox(page).fill('cats');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('link', { name: 'View details for cats result' })).toBeVisible();
    expect(requests.filter(request => request.q === 'cats')).toHaveLength(1);
    expect(requests).toHaveLength(2);
  });

  test('does not let an older delayed response replace the latest query', async ({ page }) => {
    const requests = [];
    await page.route(`${apiURL}/api/search`, async route => {
      const body = route.request().postDataJSON();
      requests.push(body);

      if (body.q === 'older') {
        await new Promise(resolve => setTimeout(resolve, 800));
        await fulfillJson(route, searchPayload([bookDocument('old', 'Older stale result')]));
        return;
      }

      await fulfillJson(route, searchPayload([bookDocument('new', 'Newest result')]));
    });

    await page.goto('/search?q=older');
    await searchBox(page).fill('newer');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('link', { name: 'View details for Newest result' })).toBeVisible();
    await expect(page).toHaveURL(/\/search\?q=newer$/);
    await page.waitForTimeout(1_000);
    await expect(resultLinks(page)).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'View details for Older stale result' })).toHaveCount(0);
    expect(requests.map(request => request.q)).toEqual(['older', 'newer']);
  });
});
