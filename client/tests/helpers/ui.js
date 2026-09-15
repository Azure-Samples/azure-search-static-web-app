import { expect } from '@playwright/test';
import process from 'node:process';

export const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:7071';
export const searchBox = page =>
  page.getByRole('combobox', { name: 'What are you looking for?' });
export const resultLinks = page =>
  page.locator('a[href^="/details/"]');

export function bookDocument(id, title, overrides = {}) {
  return {
    id: String(id),
    title,
    original_title: title,
    authors: ['Test Author'],
    language_code: 'eng',
    image_url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
    original_publication_year: 2026,
    isbn: `TEST-${id}`,
    average_rating: 4.2,
    ratings_count: 42,
    ...overrides,
  };
}

export function searchPayload(documents, overrides = {}) {
  return {
    count: documents.length,
    facets: {
      authors: [{ value: 'Test Author', count: documents.length }],
      language_code: [{ value: 'eng', count: documents.length }],
    },
    results: documents.map(document => ({ document })),
    ...overrides,
  };
}

export function isApiResponse(response, operation, body = {}) {
  if (new URL(response.url()).pathname !== `/api/${operation}`) {
    return false;
  }

  if (operation === 'lookup') {
    return response.request().method() === 'GET';
  }

  if (response.request().method() !== 'POST') {
    return false;
  }

  const requestBody = response.request().postDataJSON();
  return Object.entries(body).every(([key, value]) =>
    JSON.stringify(requestBody[key]) === JSON.stringify(value));
}

export async function waitForSearch(page, body, action) {
  const [response] = await Promise.all([
    page.waitForResponse(candidate => isApiResponse(candidate, 'search', body)),
    action(),
  ]);
  expect(response.status()).toBe(200);
  await expect(page.getByText(/Showing \d[\d,]*-\d[\d,]* of [\d,]+ results for/)).toBeVisible();
  return response.json();
}

export async function submitSearch(page, query, keyboard = false) {
  const input = searchBox(page);
  await input.fill(query);
  return waitForSearch(page, { q: query || '*', skip: 0 }, () =>
    keyboard
      ? input.press('Enter')
      : page.getByRole('button', { name: 'Search' }).click());
}

export async function expandFacet(page, name) {
  const button = page.getByRole('button', { name });
  if (await button.count()) {
    if (await button.getAttribute('aria-expanded') === 'false') {
      await button.click();
    }
  } else {
    await page.getByText(name, { exact: true }).first().click();
  }
}

export async function assertNoDocumentOverflow(page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

export async function disableMotion(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
}
