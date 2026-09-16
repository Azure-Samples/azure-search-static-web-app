import { expect } from '@playwright/test';
import process from 'node:process';

export const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:7071';
export const searchBox = page =>
  page.getByPlaceholder('What are you looking for?');
export const resultLinks = page =>
  page.locator('a[href^="/details/"]');

const noPhotoCoverURL =
  'https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png';

export function bookDocument(id, title, overrides = {}) {
  return {
    id: String(id),
    title,
    original_title: title,
    authors: ['Test Author'],
    language_code: 'eng',
    image_url: noPhotoCoverURL,
    original_publication_year: 2026,
    isbn: `TEST-${id}`,
    average_rating: 4.2,
    ratings_count: 42,
    ...overrides,
  };
}

export const seededDogBooks = [
  bookDocument('8691', 'One Good Dog', {
    authors: ['Susan  Wilson'],
    language_code: 'en-US',
    image_url: noPhotoCoverURL,
    original_publication_year: 2010,
    isbn: '312571259',
    average_rating: 4.07,
    ratings_count: 10379,
  }),
  bookDocument('3830', 'Love That Dog (Jack, #1)', {
    original_title: 'Love That Dog',
    authors: ['Sharon Creech'],
    language_code: 'en-US',
    image_url: 'https://images.gr-assets.com/books/1415581593m/53498.jpg',
    original_publication_year: 2001,
    isbn: '64409597',
    average_rating: 4.01,
    ratings_count: 30254,
  }),
  bookDocument('1488', 'Go, Dog. Go!', {
    authors: ['P.D. Eastman'],
    image_url: 'https://images.gr-assets.com/books/1333578440m/460548.jpg',
    original_publication_year: 1961,
    isbn: '394800206',
    average_rating: 4.08,
    ratings_count: 66360,
  }),
  bookDocument('2516', 'The Dog Stars', {
    authors: ['Peter Heller'],
    language_code: null,
    image_url: 'https://images.gr-assets.com/books/1388122817m/13330761.jpg',
    original_publication_year: 2012,
    isbn: '307959945',
    average_rating: 3.9,
    ratings_count: 33465,
  }),
  bookDocument('7609', 'Dog on It (A Chet and Bernie Mystery #1)', {
    original_title: 'Dog on It',
    authors: ['Spencer Quinn'],
    language_code: 'en-US',
    image_url: 'https://images.gr-assets.com/books/1342376684m/5600151.jpg',
    original_publication_year: 2008,
    isbn: '1416585834',
    average_rating: 3.85,
    ratings_count: 13525,
  }),
  bookDocument('6809', 'The Power of the Dog', {
    authors: ['Don Winslow'],
    image_url: 'https://images.gr-assets.com/books/1467260965m/206236.jpg',
    original_publication_year: 2005,
    isbn: '1400096936',
    average_rating: 4.36,
    ratings_count: 10195,
  }),
  bookDocument('6084', 'The Pigeon Finds a Hot Dog!', {
    authors: ['Mo Willems'],
    language_code: 'en-US',
    image_url: noPhotoCoverURL,
    original_publication_year: 2004,
    isbn: '786818697',
    average_rating: 4.35,
    ratings_count: 20510,
  }),
  bookDocument('1194', 'Dog Days (Diary of a Wimpy Kid, #4)', {
    original_title: 'Dog Days',
    authors: ['Jeff Kinney'],
    language_code: 'en-US',
    image_url: noPhotoCoverURL,
    original_publication_year: 2009,
    isbn: '810983915',
    average_rating: 4.14,
    ratings_count: 78592,
  }),
];

export async function expectBookCardCover(page, document) {
  const card = page.locator(`a[href="/details/${document.id}"]`);
  await expect(card.getByText(document.original_title, { exact: true })).toBeVisible();

  const image = card.locator('img');
  await expect(image).toHaveAttribute('alt', document.original_title);
  await expect(image).toHaveAttribute('src', document.image_url);
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
