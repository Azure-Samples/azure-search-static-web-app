import { expect, test } from '@playwright/test';
import process from 'node:process';
import {
  bookDocument,
  positiveSearchQuery,
  searchPayload,
  seededDogSuggestions,
} from '../helpers/ui.js';

test.describe('approved design-system theme surfaces', () => {
  test.skip(
    process.env.DESIGN_SYSTEM_MODE !== 'design',
    'Computed theme assertions run only against the combined design-system branch.',
  );

  test('uses theme typography and palette for principal interactive surfaces', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toHaveCSS(
      'font-family',
      /system-ui.*Avenir.*Helvetica.*Arial.*sans-serif/i,
    );
    await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgb(0, 120, 212)');

    const searchButton = page.getByRole('button', { name: 'Search' });
    await expect(searchButton).toHaveCSS('background-color', 'rgb(25, 118, 210)');
    await searchButton.hover();
    await expect(searchButton).toHaveCSS('background-color', 'rgb(21, 101, 192)');
    await searchButton.focus();
    await expect(searchButton).not.toHaveCSS('outline-style', 'none');
  });

  test('keeps type-ahead suggestions left-aligned', async ({ page }) => {
    await page.route('**/api/suggest', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ suggestions: seededDogSuggestions }),
    }));
    await page.goto('/');
    await page.getByPlaceholder('What are you looking for?').fill(positiveSearchQuery);
    const suggestions = page.getByRole('option');
    await expect(suggestions).toHaveCount(seededDogSuggestions.length);
    for (const suggestion of await suggestions.all()) {
      await expect(suggestion).toHaveCSS('text-align', 'left');
    }
  });

  test('uses the approved link color on result cards', async ({ page }) => {
    await page.route('**/api/search', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(searchPayload([bookDocument('9734', 'Mad Dogs')])),
    }));
    await page.goto(`/search?q=${positiveSearchQuery}`);
    const result = page.locator('a[href="/details/9734"]');
    await expect(result).toBeVisible();
    await expect(result).toHaveCSS('color', 'rgb(0, 120, 212)');
  });
});
