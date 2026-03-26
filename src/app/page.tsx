import Link from 'next/link';
import { TrendingMoviesSuspense } from '@/features/movies/components/TrendingMoviesSuspense';
import { GenreBrowser } from '@/features/movies/components/GenreBrowser';
import { getGenres } from '@/lib/api/tmdb-client';

/**
 * ISR Configuration: Revalidate every hour (3600 seconds)
 * This allows the page to be statically generated and updated incrementally
 * without requiring a full rebuild
 */
export const revalidate = 3600;

export default async function Home() {
  // Fetch genres for the genre browser
  const genres = await getGenres();

  return (
    <main className="flex flex-col min-h-screen bg-netflix-dark">
      {/* Welcome Section */}
      <section className="w-full py-12 md:py-16 px-4 md:px-8 bg-linear-to-b from-netflix-dark-secondary to-netflix-dark">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to MovieFlix
          </h1>
          <p className="text-lg md:text-xl text-netflix-gray mb-8 max-w-2xl">
            Discover trending movies, search for your favorites, and build your personal watchlist. 
            Explore thousands of films from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark"
            >
              Search Movies
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-6 py-3 bg-netflix-dark-secondary hover:bg-netflix-gray/20 text-white font-semibold rounded-lg border border-netflix-gray/30 transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark"
            >
              Browse by Genre
            </Link>
            <Link
              href="/watchlist"
              className="inline-flex items-center justify-center px-6 py-3 bg-netflix-dark-secondary hover:bg-netflix-gray/20 text-white font-semibold rounded-lg border border-netflix-gray/30 transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark"
            >
              View Watchlist
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Movies Section */}
      <section className="w-full py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Trending Now
          </h2>
          <TrendingMoviesSuspense />
        </div>
      </section>

      {/* Genre Browser Section */}
      <section className="w-full py-12 md:py-16 px-4 md:px-8 bg-netflix-dark-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Browse by Genre
          </h2>
          <GenreBrowser genres={genres} />
        </div>
      </section>
    </main>
  );
}
