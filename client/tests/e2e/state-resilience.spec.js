import { expect, test } from '@playwright/test';
import {
  apiURL,
  assertNoDocumentOverflow,
  bookDocument,
  searchPayload,
} from '../helpers/ui.js';

async function fulfillJson(route, payload, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });
}

test.describe('deterministic loading and content edge cases', () => {
  test('shows loading and settles after a delayed response', async ({ page }) => {
    await page.route(`${apiURL}/api/search`, async route => {
      await new Promise(resolve => setTimeout(resolve, 600));
      await fulfillJson(route, searchPayload([bookDocument('loaded', 'Loaded result')]));
    });

    await page.goto('/search?q=loading');
    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View details for Loaded result' })).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });

  test('does not leave a failed search in a loading state', async ({ page }) => {
    await page.route(`${apiURL}/api/search`, route =>
      fulfillJson(route, { error: 'Synthetic search failure' }, 500));

    await page.goto('/search?q=error');
    await expect(page.getByText('Showing 0-0 of 0 results for')).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });

  test('contains missing images and long result titles at 320px', async ({ page }) => {
    const longTitle = `A deterministic title ${'with extended content '.repeat(20)}`.trim();
    await page.setViewportSize({ width: 320, height: 720 });
    await page.route(`${apiURL}/api/search`, route =>
      fulfillJson(route, searchPayload([
        bookDocument('long', longTitle, { image_url: '/missing-cover.png' }),
      ])));
    await page.route('**/missing-cover.png', route => route.abort());

    await page.goto('/search?q=long');
    const resultLink = page.getByRole('link', { name: `View details for ${longTitle}` });
    await expect(resultLink).toBeVisible();
    await expect(resultLink.locator('img')).toBeVisible();
    const box = await resultLink.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    await assertNoDocumentOverflow(page);
  });

  test('contains long raw data within its scrollable panel at 320px', async ({ page }) => {
    const document = bookDocument('long-details', 'Long details', {
      description: 'Long unbroken content '.repeat(100),
      diagnostic_value: 'x'.repeat(1_000),
    });
    await page.setViewportSize({ width: 320, height: 720 });
    await page.route(`${apiURL}/api/lookup*`, route =>
      fulfillJson(route, { document }));

    await page.goto('/details/long-details');
    await page.getByRole('tab', { name: 'Raw Data' }).click();
    const rawData = page.getByRole('tabpanel', { name: 'Raw Data' }).locator('pre');
    await expect(rawData).toBeVisible();
    expect(await rawData.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
    await assertNoDocumentOverflow(page);
  });
});
