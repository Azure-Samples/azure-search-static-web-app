import { expect } from '@playwright/test';
import process from 'node:process';

export const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:7071';
export const positiveSearchQuery = 'dog';
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

export const seededDogPage2 = [
  bookDocument('1344', 'What the Dog Saw and Other Adventures', {
    authors: ['Malcolm Gladwell'],
    image_url: 'https://images.gr-assets.com/books/1344263875m/6516450.jpg',
    original_publication_year: 2009,
    isbn: '316078573',
    average_rating: 3.82,
    ratings_count: 65277,
  }),
  bookDocument('4960', 'Love Is a Dog from Hell', {
    original_title: 'Love Is a Dog from Hell: Poems, 1974-1977',
    authors: ['Charles Bukowski'],
    image_url: 'https://images.gr-assets.com/books/1377260823m/23534.jpg',
    original_publication_year: 1977,
    isbn: '876853629',
    average_rating: 4.16,
    ratings_count: 19471,
  }),
  bookDocument('5454', "Merle's Door: Lessons from a Freethinking Dog", {
    authors: ['Ted Kerasote'],
    language_code: 'en-US',
    image_url: 'https://images.gr-assets.com/books/1310704047m/430968.jpg',
    original_publication_year: 2007,
    isbn: '151012709',
    average_rating: 4.18,
    ratings_count: 14953,
  }),
  bookDocument('4854', 'Started Early, Took My Dog (Jackson Brodie, #4)', {
    original_title: 'Started Early, Took My Dog',
    authors: ['Kate Atkinson'],
    image_url: 'https://images.gr-assets.com/books/1273446011m/7307795.jpg',
    original_publication_year: 2010,
    isbn: '385608020',
    average_rating: 3.89,
    ratings_count: 21662,
  }),
  bookDocument('6790', 'Flight of the Old Dog (Patrick McLanahan, #1)', {
    original_title: 'Flight Of The Old Dog',
    authors: ['Dale Brown'],
    image_url: noPhotoCoverURL,
    original_publication_year: 1987,
    isbn: '042519518X',
    average_rating: 4.08,
    ratings_count: 13607,
  }),
  bookDocument('5341', 'To Say Nothing of the Dog (Oxford Time Travel, #2)', {
    original_title: 'To Say Nothing of the Dog',
    authors: ['Connie Willis'],
    image_url: 'https://images.gr-assets.com/books/1469410460m/77773.jpg',
    original_publication_year: 1998,
    isbn: '553575384',
    average_rating: 4.13,
    ratings_count: 23197,
  }),
  bookDocument('6583', 'Shoe Dog: A Memoir by the Creator of NIKE', {
    original_title: 'Shoe Dog: A Memoir by the Creator of Nike',
    authors: ['Phil Knight'],
    image_url: 'https://images.gr-assets.com/books/1457284880m/27220736.jpg',
    original_publication_year: 2016,
    isbn: '1501135910',
    average_rating: 4.46,
    ratings_count: 22373,
  }),
  bookDocument('8528', 'Oogy: The Dog Only a Family Could Love', {
    authors: ['Larry Levin'],
    language_code: 'en-GB',
    image_url: 'https://images.gr-assets.com/books/1289446928m/8105569.jpg',
    original_publication_year: 2009,
    isbn: '446546313',
    average_rating: 4.04,
    ratings_count: 10273,
  }),
];

const seededDogDocuments = new Map(
  [...seededDogBooks, ...seededDogPage2].map(document => [document.id, document]),
);

export const seededDogSuggestions = [
  { text: 'Dog on It', document: seededDogDocuments.get('7609') },
  { text: 'The Pigeon Finds a Hot Dog!', document: seededDogDocuments.get('6084') },
  { text: 'One Good Dog', document: seededDogDocuments.get('8691') },
  {
    text: 'Love Is a Dog from Hell: Poems, 1974-1977',
    document: seededDogDocuments.get('4960'),
  },
  { text: 'Love That Dog', document: seededDogDocuments.get('3830') },
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
