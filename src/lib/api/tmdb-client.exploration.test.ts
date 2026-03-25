/**
 * searchMovies Bug Condition Exploration Test - API Requests
 * 
 * **Validates: Requirements 1.3, 1.4, 1.5**
 * 
 * Property 3: Bug Condition - Excessive API Requests
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * GOAL: Surface counterexamples that demonstrate the API bug exists
 * 
 * Bug Condition (from design.md):
 * - User performs a search query on the search page
 * - searchMovies API is called immediately without debouncing
 * - There is no caching mechanism
 * - There is no deduplication of in-flight requests
 * - This causes:
 *   - Multiple API calls for the same query if user types quickly
 *   - Duplicate requests if same query is searched multiple times
 *   - No deduplication of in-flight requests
 * 
 * Expected Behavior:
 * - Only one API call is made for duplicate queries
 * - In-flight requests are deduplicated
 * - Results are cached and reused
 * 
 * EXPECTED OUTCOME on UNFIXED code: Test FAILS (this is correct - it proves the bug exists)
 * 
 * Counterexamples that will be found:
 * - "searchMovies called 2 times for duplicate query 'inception'"
 * - "searchMovies called 2 times for in-flight requests with same query"
 * - "searchMovies called 9 times for typing 'inception' character by character"
 */

import { searchMovies, clearSearchCache } from './tmdb-client';

// Mock fetch to track API calls
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock environment variable
process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';

describe('searchMovies - Bug Condition Exploration: Excessive API Requests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    clearSearchCache();
  });

  const mockApiResponse = (query: string) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      page: 1,
      results: [
        {
          id: 550,
          title: 'Fight Club',
          poster_path: '/path/to/poster.jpg',
          release_date: '1999-10-15',
        },
      ],
      total_pages: 1,
      total_results: 1,
    }),
  });

  describe('Property: Duplicate Query Deduplication', () => {
    /**
     * Property: For any duplicate search query (same query searched twice),
     * the searchMovies function SHALL make only one API call and return
     * cached results for the second call.
     * 
     * This test encodes the expected behavior from Requirements 2.4
     * When this test passes, it confirms the caching bug is fixed.
     * When this test fails on unfixed code, it confirms the bug exists.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test FAILS
     * Counterexample: "searchMovies called 2 times for duplicate query 'inception'"
     */
    it('should make only one API call for duplicate queries', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('inception'));

      // First search for "inception"
      const result1 = await searchMovies('inception');

      // Second search for "inception" (duplicate)
      const result2 = await searchMovies('inception');

      // EXPECTED: Only one API call should be made
      // On unfixed code, this will be 2 calls (no caching)
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // EXPECTED: Both results should be identical (cached)
      expect(result1).toEqual(result2);
    });

    it('should cache results and reuse them for same query', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('inception'));

      // First search
      await searchMovies('inception');
      const callCountAfterFirst = mockFetch.mock.calls.length;

      // Second search for same query
      await searchMovies('inception');
      const callCountAfterSecond = mockFetch.mock.calls.length;

      // EXPECTED: No additional API call for cached query
      // On unfixed code, callCountAfterSecond will be 2
      expect(callCountAfterSecond).toBe(callCountAfterFirst);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should make separate API calls for different queries', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Search for "inception"
      await searchMovies('inception');

      // Search for "dark knight" (different query)
      await searchMovies('dark knight');

      // EXPECTED: Two API calls for different queries
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple duplicate queries correctly', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('inception'));

      // Search for "inception" three times
      await searchMovies('inception');
      await searchMovies('inception');
      await searchMovies('inception');

      // EXPECTED: Only one API call for all three identical queries
      // On unfixed code, this will be 3 calls (no caching)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Property: In-Flight Request Deduplication', () => {
    /**
     * Property: For any in-flight requests (multiple requests for the same
     * query before the first completes), the searchMovies function SHALL
     * deduplicate them and return the same result for all.
     * 
     * This test encodes the expected behavior from Requirements 2.5
     * When this test passes, it confirms the in-flight deduplication bug is fixed.
     * When this test fails on unfixed code, it confirms the bug exists.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test FAILS
     * Counterexample: "searchMovies called 2 times for in-flight requests with same query"
     */
    it('should deduplicate in-flight requests for same query', async () => {
      // Create a promise that resolves after a delay
      let resolveResponse: any;
      const responsePromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });

      mockFetch.mockReturnValue(responsePromise);

      // Start first search
      const promise1 = searchMovies('inception');

      // Start second search for same query before first completes
      const promise2 = searchMovies('inception');

      // Resolve the fetch
      resolveResponse(mockApiResponse('inception'));

      // Wait for both to complete
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // EXPECTED: Only one API call should be made
      // On unfixed code, this will be 2 calls (no deduplication)
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // EXPECTED: Both results should be identical
      expect(result1).toEqual(result2);
    });

    it('should handle rapid sequential requests for same query', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('inception'));

      // Make rapid requests for same query
      const promises = [
        searchMovies('inception'),
        searchMovies('inception'),
        searchMovies('inception'),
      ];

      await Promise.all(promises);

      // EXPECTED: Only one API call for all rapid requests
      // On unfixed code, this will be 3 calls (no deduplication)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate in-flight requests while allowing different queries', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Make requests for different queries
      const promises = [
        searchMovies('inception'),
        searchMovies('inception'), // duplicate
        searchMovies('dark knight'),
        searchMovies('dark knight'), // duplicate
      ];

      await Promise.all(promises);

      // EXPECTED: Two API calls (one for each unique query)
      // On unfixed code, this will be 4 calls (no deduplication)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Property: Typing Simulation - Character by Character', () => {
    /**
     * Property: For any typing simulation (searching for progressively longer
     * strings like "i", "in", "inc", "ince", "incep", "incept", "incepti",
     * "inceptio", "inception"), the searchMovies function SHALL make only one
     * API call for the final complete query, not for each intermediate character.
     * 
     * This test encodes the expected behavior from Requirements 2.3
     * When this test passes, it confirms the debouncing/caching bug is fixed.
     * When this test fails on unfixed code, it confirms the bug exists.
     * 
     * EXPECTED OUTCOME on UNFIXED code: Test FAILS
     * Counterexample: "searchMovies called 9 times for typing 'inception'"
     */
    it('should not make API calls for each character typed', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Simulate typing "inception" character by character
      const query = 'inception';
      for (let i = 1; i <= query.length; i++) {
        const partialQuery = query.substring(0, i);
        await searchMovies(partialQuery);
      }

      // EXPECTED: Only one API call for the final complete query
      // On unfixed code, this will be 9 calls (one for each character)
      // This demonstrates the bug: multiple API calls for typing
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should cache intermediate queries and final query', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Simulate typing "inception"
      const query = 'inception';
      for (let i = 1; i <= query.length; i++) {
        const partialQuery = query.substring(0, i);
        await searchMovies(partialQuery);
      }

      // Then search for "inception" again
      await searchMovies('inception');

      // EXPECTED: Only one API call total
      // On unfixed code, this will be 10 calls (9 for typing + 1 for final)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle typing with backspace (character removal)', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Simulate typing "inception" then backspacing
      const queries = [
        'i',
        'in',
        'inc',
        'ince',
        'incep',
        'incept',
        'incepti',
        'inceptio',
        'inception',
        'inceptio', // backspace
        'incept', // backspace
        'incep', // backspace
      ];

      for (const q of queries) {
        await searchMovies(q);
      }

      // EXPECTED: Only unique queries should make API calls
      // On unfixed code, this will be 12 calls (one for each query)
      // With caching, should be 9 calls (one for each unique query)
      expect(mockFetch).toHaveBeenCalledTimes(9);
    });

    it('should demonstrate the bug: multiple calls for typing', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Simulate typing "test" character by character
      const queries = ['t', 'te', 'tes', 'test'];

      for (const q of queries) {
        await searchMovies(q);
      }

      // EXPECTED: Only one API call for the final query
      // On unfixed code, this will be 4 calls (one for each character)
      // This is the core of the bug - each keystroke makes an API call
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Property: Cache Behavior Across Different Scenarios', () => {
    /**
     * Property: For any combination of duplicate queries, in-flight requests,
     * and typing scenarios, the searchMovies function SHALL maintain a consistent
     * cache and deduplicate requests.
     * 
     * This test encodes the expected behavior from Requirements 2.3, 2.4, 2.5
     * When this test passes, it confirms all caching/deduplication bugs are fixed.
     * When this test fails on unfixed code, it confirms the bugs exist.
     */
    it('should handle mixed duplicate and in-flight requests', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Mix of duplicate and in-flight requests
      const promises = [
        searchMovies('inception'),
        searchMovies('inception'), // duplicate
        searchMovies('dark knight'),
        searchMovies('inception'), // duplicate again
        searchMovies('dark knight'), // duplicate
      ];

      await Promise.all(promises);

      // EXPECTED: Only two API calls (one for each unique query)
      // On unfixed code, this will be 5 calls (no caching/deduplication)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should maintain cache across sequential and parallel requests', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Sequential requests
      await searchMovies('inception');
      await searchMovies('inception');

      // Parallel requests
      await Promise.all([
        searchMovies('inception'),
        searchMovies('inception'),
      ]);

      // EXPECTED: Only one API call total
      // On unfixed code, this will be 4 calls (no caching)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should demonstrate the bug: excessive API calls without caching', async () => {
      mockFetch.mockResolvedValue(mockApiResponse('query'));

      // Simulate realistic user behavior: typing + duplicate searches
      // User types "inception" (9 calls without caching)
      for (let i = 1; i <= 'inception'.length; i++) {
        await searchMovies('inception'.substring(0, i));
      }

      // User clears and searches again (1 more call without caching)
      await searchMovies('inception');

      // User searches again (1 more call without caching)
      await searchMovies('inception');

      // EXPECTED: Only one API call for the final query
      // On unfixed code, this will be 11 calls (9 for typing + 2 for duplicates)
      // This demonstrates the bug: excessive API calls for realistic user behavior
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Property: Cache Correctness', () => {
    /**
     * Property: For any search query, the cached result SHALL be identical
     * to the original API response.
     * 
     * This test encodes the expected behavior from Requirements 2.4
     * When this test passes, it confirms cache correctness.
     */
    it('should return identical results from cache', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          page: 1,
          results: [
            {
              id: 550,
              title: 'Fight Club',
              poster_path: '/path/to/poster.jpg',
              release_date: '1999-10-15',
            },
            {
              id: 278,
              title: 'The Shawshank Redemption',
              poster_path: '/path/to/poster2.jpg',
              release_date: '1994-09-23',
            },
          ],
          total_pages: 1,
          total_results: 2,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      // First call
      const result1 = await searchMovies('inception');

      // Second call (from cache)
      const result2 = await searchMovies('inception');

      // EXPECTED: Results should be identical
      expect(result1).toEqual(result2);
      expect(result1.results).toHaveLength(2);
      expect(result2.results).toHaveLength(2);
    });
  });
});
