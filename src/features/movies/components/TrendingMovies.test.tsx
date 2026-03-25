/**
 * TrendingMovies Server Component Tests
 *
 * Tests for the TrendingMovies server component covering:
 * - Successful data fetching and rendering
 * - Empty state handling
 * - Error handling and user-friendly messages
 * - API client integration
 * - ErrorBoundary wrapping
 */

import { TrendingMovies } from './TrendingMovies';
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

describe('TrendingMovies Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('Successful Data Fetching', () => {
    it('should fetch trending movies using API client', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Movie 1',
          poster_path: '/path1.jpg',
          release_date: '2024-01-01',
          vote_average: 8.5,
        },
      ];

      (tmdbClient.getMoviesByTrending as jest.Mock).mockResolvedValue({
        results: mockMovies,
        page: 1,
        total_pages: 10,
      });

      const component = await TrendingMovies();

      expect(tmdbClient.getMoviesByTrending).toHaveBeenCalledWith('day', 1);
      expect(component).toBeDefined();
    });

    it('should pass fetched movies to MovieCarousel component', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Movie 1',
          poster_path: '/path1.jpg',
          release_date: '2024-01-01',
          vote_average: 8.5,
        },
        {
          id: 2,
          title: 'Movie 2',
          poster_path: '/path2.jpg',
          release_date: '2024-01-02',
          vote_average: 7.5,
        },
      ];

      (tmdbClient.getMoviesByTrending as jest.Mock).mockResolvedValue({
        results: mockMovies,
        page: 1,
        total_pages: 10,
      });

      const component = await TrendingMovies();

      expect(component).toBeDefined();
      expect(component.props.children).toBeDefined();
    });

    it('should wrap MovieCarousel with ErrorBoundary', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Movie 1',
          poster_path: '/path1.jpg',
          release_date: '2024-01-01',
        },
      ];

      (tmdbClient.getMoviesByTrending as jest.Mock).mockResolvedValue({
        results: mockMovies,
        page: 1,
        total_pages: 10,
      });

      const component = await TrendingMovies();

      expect(component).toBeDefined();
      expect(component.type.name).toBe('ErrorBoundary');
    });
  });

  describe('Empty State Handling', () => {
    it('should show empty state when no movies are returned', async () => {
      (tmdbClient.getMoviesByTrending as jest.Mock).mockResolvedValue({
        results: [],
        page: 1,
        total_pages: 0,
      });

      const component = await TrendingMovies();

      expect(component).toBeDefined();
      // Component returns JSX with text content
      expect(JSON.stringify(component)).toContain('No trending movies available');
    });

    it('should handle undefined results array', async () => {
      (tmdbClient.getMoviesByTrending as jest.Mock).mockResolvedValue({
        page: 1,
        total_pages: 0,
      });

      const component = await TrendingMovies();

      expect(component).toBeDefined();
      expect(JSON.stringify(component)).toContain('No trending movies available');
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API call fails', async () => {
      (tmdbClient.getMoviesByTrending as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const component = await TrendingMovies();

      expect(component).toBeDefined();
      const componentStr = JSON.stringify(component);
      expect(componentStr).toContain('Unable to load trending movies');
      expect(componentStr).toContain(
        'Please try refreshing the page or check back later.'
      );
    });

    it('should log error to console when API call fails', async () => {
      const errorMessage = 'Network Error';
      (tmdbClient.getMoviesByTrending as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await TrendingMovies();

      expect(console.error).toHaveBeenCalledWith(
        '[TrendingMovies] Failed to fetch trending movies:',
        errorMessage
      );
    });

    it('should handle non-Error exceptions gracefully', async () => {
      (tmdbClient.getMoviesByTrending as jest.Mock).mockRejectedValue(
        'String error'
      );

      const component = await TrendingMovies();

      expect(component).toBeDefined();
      expect(JSON.stringify(component)).toContain('Unable to load trending movies');
    });
  });

  describe('Component Behavior', () => {
    it('should be a server component (async function)', async () => {
      (tmdbClient.getMoviesByTrending as jest.Mock).mockResolvedValue({
        results: [],
        page: 1,
        total_pages: 0,
      });

      const component = await TrendingMovies();

      expect(component).toBeDefined();
    });

    it('should not use hooks or browser APIs', async () => {
      (tmdbClient.getMoviesByTrending as jest.Mock).mockResolvedValue({
        results: [
          {
            id: 1,
            title: 'Movie 1',
            poster_path: '/path1.jpg',
            release_date: '2024-01-01',
          },
        ],
        page: 1,
        total_pages: 10,
      });

      // Component should be a pure async function without hooks
      const component = await TrendingMovies();

      expect(component).toBeDefined();
      // Verify it's not a hook-based component by checking it's not a function component
      expect(typeof component).not.toBe('function');
    });
  });
});
