import { expect, test } from '@playwright/test';

const expectedLookup = {
  id: '9734',
  title: 'Mad Dogs (Cherub, #8)',
  original_title: 'Mad Dogs',
  language_code: 'eng',
};

async function post(request, path, data) {
  return request.post(path, { data });
}

async function expectSuccessfulJson(response) {
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  return response.json();
}

test.describe('Azure AI Search API contract', () => {
  test('validates the canonical dataset fingerprint', async ({ request }) => {
    const searchResponse = await post(request, '/api/search', {
      q: '*',
      top: 1,
      skip: 0,
      filters: [],
    });
    const search = await expectSuccessfulJson(searchResponse);
    expect(search.count, 'Expected the seeded good-books index').toBe(10_000);

    const lookupResponse = await request.get('/api/lookup?id=9734');
    const lookup = await expectSuccessfulJson(lookupResponse);
    expect(lookup.document).toMatchObject(expectedLookup);
    expect(lookup.document.authors).toContain('Robert Muchamore');
  });

  for (const [query, expectedText] of [
    ['d', '"D" is for Deadbeat'],
    ['do', "I Do (But I Don't)"],
    ['dog', 'Dog on It'],
    ['dogs', 'Mad Dogs'],
  ]) {
    test(`suggests known books for ${query}`, async ({ request }) => {
      const response = await post(request, '/api/suggest', {
        q: query,
        top: 5,
        suggester: 'sg',
      });
      const body = await expectSuccessfulJson(response);

      expect(body.suggestions.length).toBeLessThanOrEqual(5);
      expect(body.suggestions.map(suggestion => suggestion.text.trim())).toContain(expectedText);
      expect(body.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            document: expect.objectContaining({ id: expect.any(String) }),
          }),
        ]),
      );
    });
  }

  test('returns search results and facets for dogs', async ({ request }) => {
    const response = await post(request, '/api/search', {
      q: 'dogs',
      top: 8,
      skip: 0,
      filters: [],
    });
    const body = await expectSuccessfulJson(response);

    expect(body.count).toBe(7);
    expect(body.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ document: expect.objectContaining({ id: '9734' }) }),
        expect.objectContaining({ document: expect.objectContaining({ id: '9957' }) }),
      ]),
    );
    expect(body.facets).toMatchObject({
      authors: expect.any(Array),
      language_code: expect.any(Array),
    });
  });

  test('applies author and language facets independently and together', async ({ request }) => {
    const cases = [
      {
        filters: [{ field: 'authors', value: 'Robert Muchamore' }],
        expectedCount: 1,
      },
      {
        filters: [{ field: 'language_code', value: 'eng' }],
        expectedCount: 4,
      },
      {
        filters: [
          { field: 'authors', value: 'Robert Muchamore' },
          { field: 'language_code', value: 'eng' },
        ],
        expectedCount: 1,
      },
    ];

    for (const fixture of cases) {
      const response = await post(request, '/api/search', {
        q: 'dogs',
        top: 8,
        skip: 0,
        filters: fixture.filters,
      });
      const body = await expectSuccessfulJson(response);
      expect(body.count).toBe(fixture.expectedCount);
      expect(body.results.map(result => result.document.id)).toContain('9734');

      const authorFacets = Object.fromEntries(
        body.facets.authors.map(facet => [facet.value, facet.count]),
      );
      const languageFacets = Object.fromEntries(
        body.facets.language_code.map(facet => [facet.value, facet.count]),
      );
      expect(authorFacets['Robert Muchamore']).toBe(1);
      expect(languageFacets.eng).toBeGreaterThanOrEqual(1);
    }
  });

  test('returns lookup data and intentional lookup errors', async ({ request }) => {
    const response = await request.get('/api/lookup?id=9734');
    const body = await expectSuccessfulJson(response);
    expect(body.document).toMatchObject(expectedLookup);

    const missingId = await request.get('/api/lookup');
    expect(missingId.status()).toBe(400);
    await expect(missingId.json()).resolves.toMatchObject({
      error: 'The id query parameter is required.',
    });

    const unknownId = await request.get('/api/lookup?id=607472-not-a-book');
    expect(unknownId.status()).toBe(404);
  });

  test('returns distinct bounded pages without relying on broad-query totals', async ({ request }) => {
    const firstResponse = await post(request, '/api/search', {
      q: 'the',
      top: 8,
      skip: 0,
      filters: [],
    });
    const secondResponse = await post(request, '/api/search', {
      q: 'the',
      top: 8,
      skip: 8,
      filters: [],
    });
    const first = await expectSuccessfulJson(firstResponse);
    const second = await expectSuccessfulJson(secondResponse);
    const firstIds = first.results.map(result => result.document.id);
    const secondIds = second.results.map(result => result.document.id);

    expect(firstIds).toHaveLength(8);
    expect(secondIds).toHaveLength(8);
    expect(new Set([...firstIds, ...secondIds]).size).toBe(16);
  });

  test('normalizes an empty query and returns an explicit no-results state', async ({ request }) => {
    const emptyResponse = await post(request, '/api/search', {
      q: '',
      top: 8,
      skip: 0,
      filters: [],
    });
    const empty = await expectSuccessfulJson(emptyResponse);
    expect(empty.count).toBe(10_000);

    const noneResponse = await post(request, '/api/search', {
      q: 'qzxwvvjk607472',
      top: 8,
      skip: 0,
      filters: [],
    });
    const none = await expectSuccessfulJson(noneResponse);
    expect(none.count).toBe(0);
    expect(none.results).toEqual([]);
  });

  test('rejects malformed search and suggest requests', async ({ request }) => {
    const search = await post(request, '/api/search', {
      q: 'dogs',
      top: 0,
      skip: -1,
      filters: [],
    });
    expect(search.status()).toBe(400);

    const suggest = await post(request, '/api/suggest', {
      q: '',
      top: 5,
      suggester: 'sg',
    });
    expect(suggest.status()).toBe(400);
  });
});
