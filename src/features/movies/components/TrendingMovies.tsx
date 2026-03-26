import { getMoviesByTrending } from '@/lib/api/tmdb-client';
import { MovieCarousel } from './MovieCarousel';
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';

/**
 * TrendingMovies Server Component
 *
 * Fetches trending movies from TMDb API and displays them in a carousel.
 * This is a React Server Component - it runs only on the server and cannot use hooks or browser APIs.
 *
 * Features:
 * - Fetches trending movies using the API client
 * - Passes data to MovieCarousel client component for rendering
 * - Includes error handling for failed requests
 * - Uses ISR with revalidation tags for cache management
 *
 * @example
 * // Usage in a page or layout
 * <TrendingMovies />
 */
export async function TrendingMovies() {
  try {
    // Fetch trending movies from TMDb API
    const response = await getMoviesByTrending('day', 1);

    // Extract movies from response and filter out those without posters
    const movies = (response.results || []).filter(movie => movie.poster_path);

    // If no movies found, show empty state
    if (movies.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400 text-lg">No trending movies available</p>
        </div>
      );
    }

    // Render carousel with fetched movies
    return (
      <ErrorBoundary>
        <MovieCarousel movies={movies} />
      </ErrorBoundary>
    );
  } catch (error) {
    // Log error for monitoring
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[TrendingMovies] Failed to fetch trending movies:', errorMessage);

    // Display user-friendly error message
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">
            Unable to load trending movies
          </p>
          <p className="text-gray-500 text-sm">
            Please try refreshing the page or check back later.
          </p>
        </div>
      </div>
    );
  }
}
