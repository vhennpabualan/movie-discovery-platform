/**
 * Revalidation Helper Functions
 * Provides utilities for managing Next.js ISR cache invalidation
 * Supports on-demand revalidation of specific tags and paths
 */

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Revalidates the trending movies cache
 * Called when trending movies data needs to be refreshed
 */
export function revalidateTrendingMovies(): void {
  revalidateTag('trending-movies', 'default');
}

/**
 * Revalidates search results cache for a specific query
 * @param query - The search query to revalidate
 */
export function revalidateSearchResults(query: string): void {
  revalidateTag(`search-results-${query}`, 'default');
}

/**
 * Revalidates movie details cache for a specific movie
 * @param movieId - The TMDb movie ID to revalidate
 */
export function revalidateMovieDetails(movieId: number): void {
  revalidateTag(`movie-details-${movieId}`, 'default');
}

/**
 * Revalidates the watchlist cache
 * Called when a user adds or removes a movie from their watchlist
 */
export function revalidateWatchlist(): void {
  revalidateTag('watchlist', 'default');
}

/**
 * Revalidates the homepage
 * Called when trending movies or other homepage content changes
 */
export function revalidateHomepage(): void {
  revalidatePath('/');
}

/**
 * Revalidates all movie-related caches
 * Useful for bulk cache invalidation after significant data changes
 */
export function revalidateAllMovieCaches(): void {
  revalidateTag('trending-movies', 'default');
  revalidateTag('watchlist', 'default');
  revalidatePath('/');
}
