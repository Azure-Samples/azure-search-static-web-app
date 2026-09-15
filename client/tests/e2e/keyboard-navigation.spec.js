import { expect, test } from '@playwright/test';
import { expandFacet, searchBox } from '../helpers/ui.js';

test.describe('keyboard and mobile navigation', () => {
  test('mobile menu toggles by keyboard and closes with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Toggle navigation' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Search', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('suggestions, facets, pagination, and tabs are keyboard operable', async ({ page }) => {
    await page.goto('/');
    const input = searchBox(page);
    await input.fill('dogs');
    await expect(page.getByRole('option', { name: 'Mad Dogs', exact: true })).toBeVisible();
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(page.getByText(/Showing 1-\d+ of \d+ results for/)).toBeVisible();

    await page.goto('/search?q=the');
    await expandFacet(page, 'Authors');
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();

    const nextPage = page.getByRole('button', { name: 'Go to next page' });
    await nextPage.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Page 2, current page')).toBeVisible();

    await page.goto('/details/9734');
    const resultTab = page.getByRole('tab', { name: 'Result' });
    await resultTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Raw Data' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tab', { name: 'Raw Data' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel', { name: 'Raw Data' })).toBeVisible();
  });
});
