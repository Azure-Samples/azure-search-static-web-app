import { expect, test } from '@playwright/test';
import { apiURL, searchBox } from '../helpers/ui.js';

test.describe('native application behavior', () => {
  test('renders the existing home search experience', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(searchBox(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('renders the existing direct search route', async ({ page }) => {
    await page.goto('/search?q=dogs');
    await expect(page).toHaveURL(/\/search\?q=dogs$/);
    await expect(searchBox(page)).toHaveValue('dogs');
  });

  test('native search results should render', async ({ page }) => {
    test.fail(true, 'Known native defect: the HTTP 302 API response is not usable by browser fetch.');

    await page.goto('/search?q=dogs');
    const response = await page.request.post(`${apiURL}/api/search`, {
      data: { q: 'dogs', top: 8, skip: 0, filters: [] },
    });
    expect(response.status()).toBe(200);
    await expect(page.locator('a[href="/details/9734"]')).toBeVisible();
  });

  test('native suggestions should render', async ({ page }) => {
    test.fail(true, 'Known native defect: the HTTP 302 API response is not usable by browser fetch.');

    await page.goto('/');
    await searchBox(page).fill('dogs');
    await expect(page.getByRole('option', { name: 'Mad Dogs', exact: true })).toBeVisible();
  });

  test('mobile navigation should open with its existing toggle', async ({ page }) => {
    test.fail(true, 'Known native defect: the Bootstrap mobile toggle has no active collapse behavior.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
  });
});
