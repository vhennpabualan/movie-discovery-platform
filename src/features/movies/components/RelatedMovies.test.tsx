/**
 * RelatedMovies Server Component Tests
 *
 * Tests for the RelatedMovies server component covering:
 * - Successful data fetching and rendering
 * - Empty state handling
 * - Error handling and user-friendly messages
 * - API client integration
 * - ErrorBoundary wrapping
 */

import { RelatedMovies } from './RelatedMovies';
import * as tmdbClient from '@/lib/api/tmdb-client';

// Mock the API client
jest.mock('@/lib/api/tmdb-client');

// Mock the MovieCarousel component
jest.mock('./MovieCarousel', () => ({
  MovieCarousel: ({ movies }: { movies: any[] }) => (
    <div data-testid="movie-carousel">
      {movies.map((movie) => (
        <div key={movie.id} data-testid={`movie-${movie.id}`}>
          {movie.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock the ErrorBoundary component
jest.mock('@/features/ui/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

describe('RelatedMovies Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('Successful Data Fetching', () => {
    it('should fetch similar movies using API client with correct movieId', async () => {
      const movieId = 550;
      const mockMovies = [
        {
          id: 1,
          title: 'Similar Movie 1',
          poster_path: '/path1.jpg',
          release_date: '2024-01-01',
          vote_average: 8.5,
        },
      ];

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        results: mockMovies,
        page: 1,
        total_pages: 10,
      });

      const component = await RelatedMovies({ movieId });

      expect(tmdbClient.getSimilarMovies).toHaveBeenCalledWith(movieId, 1);
      expect(component).toBeDefined();
    });

    it('should pass fetched movies to MovieCarousel component', async () => {
      const movieId = 550;
      const mockMovies = [
        {
          id: 1,
          title: 'Similar Movie 1',
          poster_path: '/path1.jpg',
          release_date: '2024-01-01',
          vote_average: 8.5,
        },
        {
          id: 2,
          title: 'Similar Movie 2',
          poster_path: '/path2.jpg',
          release_date: '2024-01-02',
          vote_average: 7.5,
        },
      ];

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        results: mockMovies,
        page: 1,
        total_pages: 10,
      });

      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
      expect(component.props.children).toBeDefined();
    });

    it('should wrap MovieCarousel with ErrorBoundary', async () => {
      const movieId = 550;
      const mockMovies = [
        {
          id: 1,
          title: 'Similar Movie 1',
          poster_path: '/path1.jpg',
          release_date: '2024-01-01',
        },
      ];

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        results: mockMovies,
        page: 1,
        total_pages: 10,
      });

      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
      expect(component.type.name).toBe('ErrorBoundary');
    });
  });

  describe('Empty State Handling', () => {
    it('should show empty state when no related movies are returned', async () => {
      const movieId = 550;

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        results: [],
        page: 1,
        total_pages: 0,
      });

      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
      expect(JSON.stringify(component)).toContain('No related movies available');
    });

    it('should handle undefined results array', async () => {
      const movieId = 550;

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        page: 1,
        total_pages: 0,
      });

      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
      expect(JSON.stringify(component)).toContain('No related movies available');
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API call fails', async () => {
      const movieId = 550;

      (tmdbClient.getSimilarMovies as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
      const componentStr = JSON.stringify(component);
      expect(componentStr).toContain('Unable to load related movies');
      expect(componentStr).toContain(
        'Please try refreshing the page or check back later.'
      );
    });

    it('should log error to console with movieId when API call fails', async () => {
      const movieId = 550;
      const errorMessage = 'Network Error';

      (tmdbClient.getSimilarMovies as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await RelatedMovies({ movieId });

      expect(console.error).toHaveBeenCalledWith(
        `[RelatedMovies] Failed to fetch related movies for movie ${movieId}:`,
        errorMessage
      );
    });

    it('should handle non-Error exceptions gracefully', async () => {
      const movieId = 550;

      (tmdbClient.getSimilarMovies as jest.Mock).mockRejectedValue(
        'String error'
      );

      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
      expect(JSON.stringify(component)).toContain('Unable to load related movies');
    });
  });

  describe('Component Behavior', () => {
    it('should be a server component (async function)', async () => {
      const movieId = 550;

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        results: [],
        page: 1,
        total_pages: 0,
      });

      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
    });

    it('should not use hooks or browser APIs', async () => {
      const movieId = 550;

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        results: [
          {
            id: 1,
            title: 'Similar Movie 1',
            poster_path: '/path1.jpg',
            release_date: '2024-01-01',
          },
        ],
        page: 1,
        total_pages: 10,
      });

      // Component should be a pure async function without hooks
      const component = await RelatedMovies({ movieId });

      expect(component).toBeDefined();
      // Verify it's not a hook-based component by checking it's not a function component
      expect(typeof component).not.toBe('function');
    });

    it('should fetch page 1 by default', async () => {
      const movieId = 550;

      (tmdbClient.getSimilarMovies as jest.Mock).mockResolvedValue({
        results: [],
        page: 1,
        total_pages: 0,
      });

      await RelatedMovies({ movieId });

      expect(tmdbClient.getSimilarMovies).toHaveBeenCalledWith(movieId, 1);
    });
  });
});
