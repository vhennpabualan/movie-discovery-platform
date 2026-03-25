import { getSimilarMovies } from '@/lib/api/tmdb-client';
import { MovieCarousel } from './MovieCarousel';
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';

interface RelatedMoviesProps {
  movieId: number;
}

/**
 * RelatedMovies Server Component
 *
 * Fetches similar/related movies from TMDb API and displays them in a carousel.
 * This is a React Server Component - it runs only on the server and cannot use hooks or browser APIs.
 *
 * Features:
 * - Fetches similar movies using the API client
 * - Passes data to MovieCarousel client component for rendering
 * - Includes error handling for failed requests
 * - Uses ISR with revalidation tags for cache management
 * - Handles cases where no related movies are available
 *
 * @example
 * // Usage in a movie details page
 * <RelatedMovies movieId={123} />
 */
export async function RelatedMovies({ movieId }: RelatedMoviesProps) {
  try {
    // Fetch similar movies from TMDb API
    const response = await getSimilarMovies(movieId, 1);

    // Extract movies from response
    const movies = response.results || [];

    // If no related movies found, show empty state
    if (movies.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400 text-lg">No related movies available</p>
        </div>
      );
    }

    // Render carousel with fetched related movies
    return (
      <ErrorBoundary>
        <MovieCarousel movies={movies} />
      </ErrorBoundary>
    );
  } catch (error) {
    // Log error for monitoring
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(
      `[RelatedMovies] Failed to fetch related movies for movie ${movieId}:`,
      errorMessage
    );

    // Display user-friendly error message
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">
            Unable to load related movies
          </p>
          <p className="text-gray-500 text-sm">
            Please try refreshing the page or check back later.
          </p>
        </div>
      </div>
    );
  }
}
