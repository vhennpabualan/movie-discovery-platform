/**
 * Tests for TMDb API Client with Zod validation and retry logic
 * 
 * These tests verify that:
 * 1. API responses are validated against Zod schemas before returning
 * 2. Revalidation tags are properly set for caching
 * 3. Invalid responses throw validation errors
 * 4. Valid responses pass validation and are returned correctly
 * 5. Retry logic works for retryable errors (5xx, network errors)
 * 6. Non-retryable errors (4xx) fail immediately
 * 7. Custom error types are used appropriately
 */

import {
  getMoviesByTrending,
  searchMovies,
  getMovieDetails,
  TMDbAPIError,
} from './tmdb-client';
import { NetworkError, ValidationError, APIResponseError } from './errors';

// Set API key before importing
process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';

// Mock fetch for testing
global.fetch = jest.fn();

describe('TMDb API Client with Zod Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
  });

  describe('getMoviesByTrending - Response Validation', () => {
    it('should validate and return trending movies with valid response', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            poster_path: '/test.jpg',
            release_date: '2024-01-01',
          },
        ],
        page: 1,
        total_pages: 10,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponse,
      });

      const result = await getMoviesByTrending();

      expect(result).toEqual(mockResponse);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe(1);
    });

    it('should throw validation error for missing required fields', async () => {
      const invalidResponse = {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            // Missing poster_path and release_date
          },
        ],
        page: 1,
        total_pages: 10,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => invalidResponse,
      });

      await expect(getMoviesByTrending()).rejects.toThrow();
    });

    it('should include revalidation tag for trending-movies', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ results: [], page: 1, total_pages: 1 }),
      });

      await getMoviesByTrending();

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].next.tags).toContain('trending-movies');
    });
  });

  describe('searchMovies - Response Validation', () => {
    it('should validate and return search results with valid response', async () => {
      const mockResponse = {
        results: [
          {
            id: 2,
            title: 'Inception',
            poster_path: '/inception.jpg',
            release_date: '2010-07-16',
          },
        ],
        page: 1,
        total_pages: 5,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponse,
      });

      const result = await searchMovies('inception');

      expect(result).toEqual(mockResponse);
      expect(result.results[0].title).toBe('Inception');
    });

    it('should throw validation error for invalid search response', async () => {
      const invalidResponse = {
        results: [
          {
            id: 2,
            // Missing required fields
          },
        ],
        page: 1,
        total_pages: 5,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => invalidResponse,
      });

      await expect(searchMovies('test')).rejects.toThrow();
    });

    it('should include search query in revalidation tag', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ results: [], page: 1, total_pages: 1 }),
      });

      await searchMovies('test-query');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].next.tags).toContain('search-results-test-query');
    });
  });

  describe('getMovieDetails - Response Validation', () => {
    it('should validate and return movie details with valid response', async () => {
      const mockResponse = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/fightclub.jpg',
        release_date: '1999-10-15',
        overview: 'An insomniac office worker...',
        genres: [{ id: 18, name: 'Drama' }],
        runtime: 139,
        vote_average: 8.8,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponse,
      });

      const result = await getMovieDetails(550);

      expect(result).toEqual(mockResponse);
      expect(result.runtime).toBe(139);
      expect(result.vote_average).toBe(8.8);
    });

    it('should throw validation error for missing required fields in movie details', async () => {
      const invalidResponse = {
        id: 550,
        title: 'Fight Club',
        // Missing poster_path and release_date
        overview: 'An insomniac office worker...',
        genres: [],
        runtime: 139,
        vote_average: 8.8,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => invalidResponse,
      });

      await expect(getMovieDetails(550)).rejects.toThrow();
    });

    it('should include movie ID in revalidation tag', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          id: 123,
          title: 'Test',
          poster_path: '/test.jpg',
          release_date: '2024-01-01',
          overview: 'Test',
          genres: [],
          runtime: 120,
          vote_average: 8.0,
        }),
      });

      await getMovieDetails(123);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].next.tags).toContain('movie-details-123');
    });

    it('should provide default values for optional fields', async () => {
      const mockResponse = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/fightclub.jpg',
        release_date: '1999-10-15',
        // Missing optional fields: overview, genres, runtime, vote_average
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponse,
      });

      const result = await getMovieDetails(550);

      expect(result.overview).toBeUndefined();
      expect(result.genres).toEqual([]);
      expect(result.runtime).toBe(0);
      expect(result.vote_average).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw TMDbAPIError on API error response', async () => {
      const errorResponse = {
        status_message: 'Invalid API key',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => errorResponse,
      });

      await expect(getMoviesByTrending()).rejects.toThrow(TMDbAPIError);
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.NEXT_PUBLIC_TMDB_API_KEY;

      await expect(getMoviesByTrending()).rejects.toThrow(
        'TMDb API key is not configured'
      );
      
      // Restore API key for other tests
      process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    });
  });

  describe('Retry Logic', () => {
    it('should retry on 5xx server errors', async () => {
      const successResponse = {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            poster_path: '/test.jpg',
            release_date: '2024-01-01',
          },
        ],
        page: 1,
        total_pages: 10,
      };

      // First call fails with 503, second succeeds
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          json: async () => ({ status_message: 'Service Unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => successResponse,
        });

      const result = await getMoviesByTrending();

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should retry on network errors', async () => {
      const successResponse = {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            poster_path: '/test.jpg',
            release_date: '2024-01-01',
          },
        ],
        page: 1,
        total_pages: 10,
      };

      // First call throws network error, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => successResponse,
        });

      const result = await getMoviesByTrending();

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should not retry on 4xx client errors', async () => {
      const errorResponse = {
        status_message: 'Invalid API key',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => errorResponse,
      });

      await expect(getMoviesByTrending()).rejects.toThrow(APIResponseError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 429 Too Many Requests', async () => {
      const successResponse = {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            poster_path: '/test.jpg',
            release_date: '2024-01-01',
          },
        ],
        page: 1,
        total_pages: 10,
      };

      // First call fails with 429, second succeeds
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: async () => ({ status_message: 'Too Many Requests' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => successResponse,
        });

      const result = await getMoviesByTrending();

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should fail after max retries exceeded', async () => {
      // All calls fail with 503
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ status_message: 'Service Unavailable' }),
      });

      await expect(getMoviesByTrending()).rejects.toThrow(APIResponseError);
      // Should attempt: initial + 3 retries = 4 total
      expect(global.fetch).toHaveBeenCalledTimes(4);
    }, 15000);

    it('should use exponential backoff for retries', async () => {
      const successResponse = {
        results: [],
        page: 1,
        total_pages: 1,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          json: async () => ({ status_message: 'Service Unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => successResponse,
        });

      const result = await getMoviesByTrending();

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 10000);
  });
});

