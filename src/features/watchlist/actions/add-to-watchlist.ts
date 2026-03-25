'use server';

import { revalidateWatchlist } from '@/lib/revalidation';

/**
 * Server action to add a movie to the user's watchlist
 * @param movieId - The TMDb movie ID to add
 * @param movieTitle - The title of the movie being added
 * @returns Success or error response
 */
export async function addToWatchlist(movieId: number, movieTitle: string) {
  try {
    // Check if user is authenticated
    // In a real app, you would check session/auth here
    // For now, we'll simulate authentication check
    const isAuthenticated = true; // Replace with actual auth check

    if (!isAuthenticated) {
      return {
        success: false,
        error: 'Please log in to add movies to your watchlist',
      };
    }

    // Validate input
    if (!movieId || movieId <= 0) {
      return {
        success: false,
        error: 'Invalid movie ID',
      };
    }

    // TODO: In a real app, save to database
    // For now, this is a placeholder that simulates the operation
    console.log(`Added movie ${movieId} (${movieTitle}) to watchlist`);

    // Revalidate watchlist cache
    revalidateWatchlist();

    return {
      success: true,
      message: `${movieTitle} added to watchlist`,
    };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return {
      success: false,
      error: 'Failed to add movie to watchlist. Please try again.',
    };
  }
}
