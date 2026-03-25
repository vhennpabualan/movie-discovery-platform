/**
 * TMDb API Client - Preservation Property Tests for Error Handling
 * 
 * **Validates: Requirements 3.6**
 * 
 * Property 4: Preservation - API Error Handling
 */

import { searchMovies, getMovieDetails, getSimilarMovies, getMoviesByTrending } from './tmdb-client';
import { APIResponseError, NetworkError } from './errors';

global.fetch = jest.fn();

describe('TMDb API Client - Preservation Property Tests for Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
  });

  describe('Property: API Errors Are Caught and Handled', () => {
    it('should catch and throw APIResponseError for 404 Not Found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          status_message: 'The resource you requested could not be found.',
        }),
      });

      await expect(searchMovies('nonexistent')).rejects.toThrow(APIResponseError);
    });

    it('should catch and throw APIResponseError for 401 Unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          status_message: 'Invalid API key.',
        }),
      });

      await expect(searchMovies('test')).rejects.toThrow(APIResponseError);
    });

    it('should catch and throw NetworkError for network failures', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      await expect(searchMovies('test')).rejects.toThrow(NetworkError);
    });
  });

  describe('Property: Error Messages Are Preserved', () => {
    it('should preserve error message from API response', async () => {
      const errorMessage = 'The resource you requested could not be found.';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          status_message: errorMessage,
        }),
      });

      try {
        await searchMovies('test');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(APIResponseError);
        expect((error as APIResponseError).message).toContain(errorMessage);
      }
    });

    it('should include status code in error for debugging', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          status_message: 'Not found',
        }),
      });

      try {
        await searchMovies('test');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(APIResponseError);
        expect((error as APIResponseError).statusCode).toBe(404);
      }
    });
  });

  describe('Property: Search Can Recover From Errors', () => {
    it('should recover from error and succeed on retry', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          status_message: 'Not found',
        }),
      });

      await expect(searchMovies('test')).rejects.toThrow(APIResponseError);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              id: 1,
              title: 'Test Movie',
              poster_path: '/test.jpg',
              release_date: '2020-01-01',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        }),
      });

      const result = await searchMovies('test');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Test Movie');
    });

    it('should recover from network error and succeed on retry', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      await expect(searchMovies('test')).rejects.toThrow(NetworkError);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              id: 1,
              title: 'Test Movie',
              poster_path: '/test.jpg',
              release_date: '2020-01-01',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        }),
      });

      const result = await searchMovies('test');
      expect(result.results).toHaveLength(1);
    });

    it('should allow multiple search attempts after error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          status_message: 'Not found',
        }),
      });

      await expect(searchMovies('inception')).rejects.toThrow(APIResponseError);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              id: 2,
              title: 'Interstellar',
              poster_path: '/interstellar.jpg',
              release_date: '2014-11-07',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        }),
      });

      const result = await searchMovies('interstellar');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Interstellar');
    });
  });

  describe('Property: Error Handling Does Not Break Application State', () => {
    it('should not leave partial results after error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          status_message: 'Not found',
        }),
      });

      try {
        await searchMovies('test');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(APIResponseError);
      }
    });

    it('should handle consecutive errors without state corruption', async () => {
      for (let i = 0; i < 3; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({
            status_message: 'Not found',
          }),
        });

        await expect(searchMovies('test')).rejects.toThrow(APIResponseError);
      }

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              id: 1,
              title: 'Test Movie',
              poster_path: '/test.jpg',
              release_date: '2020-01-01',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        }),
      });

      const result = await searchMovies('test');
      expect(result.results).toHaveLength(1);
    });
  });

  describe('Property: Error Handling Preserves API Behavior', () => {
    it('should successfully search for movies', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              id: 1,
              title: 'Inception',
              poster_path: '/inception.jpg',
              release_date: '2010-07-16',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        }),
      });

      const result = await searchMovies('inception');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Inception');
    });

    it('should successfully get movie details', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          id: 1,
          title: 'Inception',
          poster_path: '/inception.jpg',
          release_date: '2010-07-16',
          overview: 'A thief who steals corporate secrets',
          runtime: 148,
          genres: [{ id: 28, name: 'Action' }],
          vote_average: 8.8,
        }),
      });

      const result = await getMovieDetails(1);
      expect(result.title).toBe('Inception');
      expect(result.runtime).toBe(148);
    });

    it('should successfully get similar movies', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              id: 2,
              title: 'Interstellar',
              poster_path: '/interstellar.jpg',
              release_date: '2014-11-07',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        }),
      });

      const result = await getSimilarMovies(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Interstellar');
    });

    it('should successfully get trending movies', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              id: 1,
              title: 'Trending Movie',
              poster_path: '/trending.jpg',
              release_date: '2024-01-01',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        }),
      });

      const result = await getMoviesByTrending();
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Trending Movie');
    });
  });
});
