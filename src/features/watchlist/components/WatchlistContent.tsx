'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Movie } from '@/types/movie';
import { WatchlistItem } from './WatchlistItem';

/**
 * WatchlistContent Component
 * Server component that fetches and displays the user's watchlist
 * In a real app, this would fetch from a database
 * For now, it displays a sample watchlist or empty state
 */
export function WatchlistContent() {
  // In a real app, this would be fetched from a database/API
  // For now, we'll use a sample watchlist or empty state
  const [watchlistMovies, setWatchlistMovies] = useState<(Movie & { vote_average?: number })[]>([]);

  const handleMovieRemoved = (movieId: number) => {
    setWatchlistMovies((movies) => movies.filter((m) => m.id !== movieId));
  };

  // Empty state
  if (watchlistMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Your watchlist is empty</h2>
          <p className="text-netflix-gray text-sm md:text-base mb-8">
            Start adding movies to your watchlist to keep track of what you want to watch.
          </p>

          <nav className="space-y-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark text-sm md:text-base"
            >
              Explore Trending Movies
            </Link>

            <div className="text-netflix-gray text-xs md:text-sm">or</div>

            <Link
              href="/search"
              className="inline-block px-6 py-3 bg-netflix-dark-secondary hover:bg-netflix-gray/20 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-gray focus:ring-offset-2 focus:ring-offset-netflix-dark text-sm md:text-base border border-netflix-gray/30"
            >
              Search for Movies
            </Link>
          </nav>
        </div>
      </div>
    );
  }

  // Watchlist grid - 1 col mobile, 2 col tablet, 3-4 col desktop
  return (
    <section aria-label="Watchlist movies">
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 list-none">
        {watchlistMovies.map((movie) => (
          <li key={movie.id}>
            <WatchlistItem
              movie={movie}
              onRemove={handleMovieRemoved}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
