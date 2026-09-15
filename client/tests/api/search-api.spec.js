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

async function expectNativeJson(response) {
  expect(response.status()).toBe(302);
  expect(response.headers()['content-type']).toContain('application/json');
  return response.json();
}

test.describe('Azure AI Search API contract', () => {
  test('successful operations should return HTTP 200', async ({ request }) => {
    test.fail(true, 'Known native defect: successful API operations return HTTP 302.');

    const response = await post(request, '/api/search', {
      q: 'dog',
      top: 8,
      skip: 0,
      filters: [],
    });
    expect(response.status()).toBe(200);
  });

  test('validates the canonical dataset fingerprint', async ({ request }) => {
    const searchResponse = await post(request, '/api/search', {
      q: '*',
      top: 1,
      skip: 0,
      filters: [],
    });
    const search = await expectNativeJson(searchResponse);
    expect(search.count, 'Expected the seeded good-books index').toBe(10_000);

    const lookupResponse = await request.get('/api/lookup?id=9734');
    const lookup = await expectNativeJson(lookupResponse);
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
      const body = await expectNativeJson(response);

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

  test('returns search results and facets for dog', async ({ request }) => {
    const response = await post(request, '/api/search', {
      q: 'dog',
      top: 8,
      skip: 0,
      filters: [],
    });
    const body = await expectNativeJson(response);

    expect(body.count).toBe(27);
    expect(body.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ document: expect.objectContaining({ id: '7609' }) }),
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
        filters: [{ field: 'authors', value: 'Spencer Quinn' }],
        expectedCount: 1,
      },
      {
        filters: [{ field: 'language_code', value: 'en-US' }],
        expectedCount: 9,
      },
      {
        filters: [
          { field: 'authors', value: 'Spencer Quinn' },
          { field: 'language_code', value: 'en-US' },
        ],
        expectedCount: 1,
      },
    ];

    for (const fixture of cases) {
      const response = await post(request, '/api/search', {
        q: 'dog',
        top: 8,
        skip: 0,
        filters: fixture.filters,
      });
      const body = await expectNativeJson(response);
      expect(body.count).toBe(fixture.expectedCount);
      expect(body.results.map(result => result.document.id)).toContain('7609');

      const authorFacets = Object.fromEntries(
        body.facets.authors.map(facet => [facet.value, facet.count]),
      );
      const languageFacets = Object.fromEntries(
        body.facets.language_code.map(facet => [facet.value, facet.count]),
      );
      expect(authorFacets['Spencer Quinn']).toBe(1);
      expect(languageFacets['en-US']).toBeGreaterThanOrEqual(1);
    }
  });

  test('returns lookup data', async ({ request }) => {
    const response = await request.get('/api/lookup?id=9734');
    const body = await expectNativeJson(response);
    expect(body.document).toMatchObject(expectedLookup);
  });

  test('invalid lookup should return a client error', async ({ request }) => {
    test.fail(true, 'Known native defect: missing lookup IDs are not validated as HTTP 400.');
    const response = await request.get('/api/lookup');
    expect(response.status()).toBe(400);
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
    const first = await expectNativeJson(firstResponse);
    const second = await expectNativeJson(secondResponse);
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
    const empty = await expectNativeJson(emptyResponse);
    expect(empty.count).toBe(10_000);

    const noneResponse = await post(request, '/api/search', {
      q: 'qzxwvvjk607472',
      top: 8,
      skip: 0,
      filters: [],
    });
    const none = await expectNativeJson(noneResponse);
    expect(none.count).toBe(0);
    expect(none.results).toEqual([]);
  });

  test('malformed search should return a client error', async ({ request }) => {
    test.fail(true, 'Known native defect: malformed search input is not validated as HTTP 400.');
    const search = await post(request, '/api/search', {
      q: 'dog',
      top: 0,
      skip: -1,
      filters: [],
    });
    expect(search.status()).toBe(400);
  });
});
