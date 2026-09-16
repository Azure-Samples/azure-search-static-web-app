import { expect } from '@playwright/test';
import process from 'node:process';

export const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:7071';
export const searchBox = page =>
  page.getByPlaceholder('What are you looking for?');
export const resultLinks = page =>
  page.locator('a[href^="/details/"]');

export function bookCoverURL(id) {
  return `https://covers.test/books/${encodeURIComponent(String(id))}.svg`;
}

export function bookDocument(id, title, overrides = {}) {
  return {
    id: String(id),
    title,
    original_title: title,
    authors: ['Test Author'],
    language_code: 'eng',
    image_url: bookCoverURL(id),
    original_publication_year: 2026,
    isbn: `TEST-${id}`,
    average_rating: 4.2,
    ratings_count: 42,
    ...overrides,
  };
}

function coverFixture(id) {
  const hash = [...id].reduce((value, character) =>
    ((value * 31) + character.charCodeAt(0)) >>> 0, 0);
  const hue = (Math.imul(hash, 137) >>> 0) % 360;
  const escapedId = id.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character]);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="240" viewBox="0 0 180 240">
      <rect width="180" height="240" fill="hsl(${hue} 62% 36%)"/>
      <rect x="12" y="12" width="156" height="216" rx="5" fill="hsl(${hue} 70% 48%)" stroke="white" stroke-width="3"/>
      <path d="M30 55h120M30 185h120" stroke="white" stroke-width="3" opacity=".8"/>
      <text x="90" y="105" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="700" text-anchor="middle">TEST COVER</text>
      <text x="90" y="135" fill="white" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">${escapedId}</text>
    </svg>
  `;
}

export async function routeBookCovers(page) {
  await page.route('https://covers.test/books/**', route => {
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop().replace(/\.svg$/, ''));
    return route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: coverFixture(id),
    });
  });
}

export async function expectBookCardCover(page, document, expectedURL) {
  const card = page.locator(`a[href="/details/${document.id}"]`);
  await expect(card.getByText(document.title, { exact: true })).toBeVisible();

  const image = card.locator('img');
  await expect(image).toHaveAttribute('alt', document.original_title);
  await expect(image).toHaveAttribute('src', expectedURL);
  await expect(image).toBeVisible();

  const renderedImage = await image.evaluate(element => ({
    complete: element.complete,
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
  }));
  expect(renderedImage.complete).toBe(true);
  expect(renderedImage.naturalWidth).toBeGreaterThan(0);
  expect(renderedImage.naturalHeight).toBeGreaterThan(0);

  const box = await image.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
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
