import { expect, test } from '@playwright/test';
import process from 'node:process';
import { apiURL, positiveSearchQuery, searchBox } from '../helpers/ui.js';

test.describe('native application behavior', () => {
  test('renders the existing home search experience', async ({ page }) => {
    await page.goto('/');
    await expect(searchBox(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('renders the existing direct search route', async ({ page }) => {
    await page.goto(`/search?q=${positiveSearchQuery}`);
    await expect(page).toHaveURL(new RegExp(`/search\\?q=${positiveSearchQuery}$`));
    await expect(searchBox(page)).toHaveValue(positiveSearchQuery);
  });

  test('native search results should render', async ({ page }) => {
    test.fail(true, 'Known native defect: successful API operations return HTTP 302.');

    await page.goto(`/search?q=${positiveSearchQuery}`);
    const response = await page.request.post(`${apiURL}/api/search`, {
      data: { q: positiveSearchQuery, top: 8, skip: 0, filters: [] },
    });
    expect(response.status()).toBe(200);
    await expect(page.locator('a[href="/details/7609"]')).toBeVisible();
  });

  test('native suggestions should render', async ({ page }) => {
    test.fail(
      process.env.DESIGN_SYSTEM_MODE !== 'design',
      'Known native defect: the current Bootstrap suggestion list does not render.',
    );

    await page.goto('/');
    await searchBox(page).fill(positiveSearchQuery);
    await expect(page.getByText('Dog on It', { exact: true })).toBeVisible();
  });

  test('mobile navigation should open with its existing toggle', async ({ page }) => {
    test.fail(
      process.env.DESIGN_SYSTEM_MODE !== 'design',
      'Known native defect: the current Bootstrap mobile toggle has no active collapse behavior.',
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: /Toggle navigation|menu/i }).click();
    const searchItem = process.env.DESIGN_SYSTEM_MODE === 'design'
      ? page.getByRole('menuitem', { name: 'Search', exact: true })
      : page.getByRole('link', { name: 'Search', exact: true });
    await expect(searchItem).toBeVisible();
  });
});
