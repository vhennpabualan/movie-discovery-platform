'use server';

import { revalidateWatchlist } from '@/lib/revalidation';

/**
 * Server action to remove a movie from the user's watchlist
 * @param movieId - The TMDb movie ID to remove
 * @param movieTitle - The title of the movie being removed
 * @returns Success or error response
 */
export async function removeFromWatchlist(movieId: number, movieTitle: string) {
  try {
    // Check if user is authenticated
    // In a real app, you would check session/auth here
    // For now, we'll simulate authentication check
    const isAuthenticated = true; // Replace with actual auth check

    if (!isAuthenticated) {
      return {
        success: false,
        error: 'Please log in to manage your watchlist',
      };
    }

    // Validate input
    if (!movieId || movieId <= 0) {
      return {
        success: false,
        error: 'Invalid movie ID',
      };
    }

    // TODO: In a real app, remove from database
    // For now, this is a placeholder that simulates the operation
    console.log(`Removed movie ${movieId} (${movieTitle}) from watchlist`);

    // Revalidate watchlist cache
    revalidateWatchlist();

    return {
      success: true,
      message: `${movieTitle} removed from watchlist`,
    };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return {
      success: false,
      error: 'Failed to remove movie from watchlist. Please try again.',
    };
  }
}
