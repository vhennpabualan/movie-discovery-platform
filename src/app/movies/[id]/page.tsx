import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getMovieDetails } from '@/lib/api/tmdb-client';
import { MoviePoster } from '@/features/movies/components/MoviePoster';
import { RelatedMoviesSuspense } from '@/features/movies/components/RelatedMoviesSuspense';
import { AddToWatchlistButton } from '@/features/watchlist/components/AddToWatchlistButton';
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';
import { APIResponseError, NetworkError } from '@/lib/api/errors';

interface MovieDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}
export async function generateMetadata(
  { params }: MovieDetailsPageProps
): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) return { title: 'Movie Not Found' };

  try {
    const movie = await getMovieDetails(movieId);

    // ✅ Guard against empty or invalid release_date
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : null;

    return {
      title: year
        ? `${movie.title} (${year}) — MovieFlix`
        : `${movie.title} — MovieFlix`,
      description: movie.overview?.slice(0, 160) || 'Watch this movie on MovieFlix.',
      openGraph: {
        title: movie.title,
        description: movie.overview?.slice(0, 160) || '',
        images: movie.poster_path
          ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
          : [],
      },
    };
  } catch {
    return { title: 'Movie Not Found — MovieFlix' };
  }
}

/**
 * Renders the star rating based on vote average (0-10 scale)
 */
function StarRating({ voteAverage }: { voteAverage: number }) {
  const rating = Math.round((voteAverage / 10) * 5);
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" aria-label={`Rating: ${voteAverage.toFixed(1)} out of 10`}>
        {stars.map((filled, i) => (
          <span key={i} className={filled ? 'text-yellow-400' : 'text-gray-600'}>
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-400">
        {voteAverage.toFixed(1)}/10
      </span>
    </div>
  );
}

/**
 * Formats runtime in minutes to hours and minutes
 */
function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Movie details page content component
 */
async function MovieDetailsContent({ movieId }: { movieId: number }) {
  try {
    const movie = await getMovieDetails(movieId);

    return (
      <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark">
        <article className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* Movie Details Container - Stack on mobile, two-column on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Poster Section */}
            <aside className="md:col-span-1">
              <div className="relative aspect-2/3 rounded-lg overflow-hidden shadow-2xl">
                <MoviePoster
                  posterPath={movie.poster_path ?? null}
                  title={movie.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </aside>

            {/* Details Section */}
            <section className="md:col-span-2 flex flex-col justify-start">
              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>

              {/* Release Date */}
              {movie.release_date && (
                <p className="text-netflix-gray text-base md:text-lg mb-4">
                  {new Date(movie.release_date).getFullYear()}
                </p>
              )}

              {/* Rating */}
              <div className="mb-6">
                <StarRating voteAverage={movie.vote_average} />
              </div>

              {/* Metadata */}
              <div className="space-y-4 mb-6 pb-6 border-b border-netflix-gray/20">
                {/* Runtime */}
                {movie.runtime > 0 && (
                  <div>
                    <h3 className="text-netflix-gray text-xs md:text-sm font-semibold mb-1">
                      Runtime
                    </h3>
                    <p className="text-white text-base md:text-lg">
                      {formatRuntime(movie.runtime)}
                    </p>
                  </div>
                )}

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div>
                    <h3 className="text-netflix-gray text-xs md:text-sm font-semibold mb-2">
                      Genres
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <li
                          key={genre.id}
                          className="px-3 py-1 bg-netflix-red/20 text-netflix-red rounded-full text-xs md:text-sm border border-netflix-red/50"
                        >
                          {genre.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Overview */}
              {movie.overview && (
                <section>
                  <h2 className="text-lg md:text-xl font-semibold text-white mb-3">
                    Overview
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-lg">
                    {movie.overview}
                  </p>
                </section>
              )}

              {/* Add to Watchlist Button */}
              <div className="mt-6 md:mt-8">
                <AddToWatchlistButton
                  movieId={movieId}
                  movieTitle={movie.title}
                  isInWatchlist={false}
                />
              </div>
            </section>
          </div>

          {/* Related Movies Section */}
          <section className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-netflix-gray/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Related Movies</h2>
            <RelatedMoviesSuspense movieId={movieId} />
          </section>

          {/* Watch Now Section - Streaming Player */}
          <section className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-netflix-gray/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Watch Now</h2>
            <VidsrcStreamingPlayer
              tmdbId={movieId}
              contentType="movie"
              videoQuality="HD"
            />
          </section>
        </article>
      </main>
    );
  } catch (error) {
    // Handle invalid movie IDs and other errors
    if (error instanceof APIResponseError && error.statusCode === 404) {
      return (
        <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Movie Not Found
            </h1>
            <p className="text-netflix-gray text-base md:text-lg mb-8">
              The movie you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark"
            >
              Back to Home
            </a>
          </div>
        </main>
      );
    }

    // Handle network errors
    if (error instanceof NetworkError) {
      return (
        <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Connection Error
            </h1>
            <p className="text-netflix-gray text-base md:text-lg mb-8">
              Unable to load movie details. Please check your internet connection and try again.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark"
            >
              Back to Home
            </a>
          </div>
        </main>
      );
    }

    // Handle other errors
    return (
      <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Error Loading Movie
          </h1>
          <p className="text-netflix-gray text-base md:text-lg mb-8">
            An unexpected error occurred while loading the movie details.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark"
          >
            Back to Home
          </a>
        </div>
      </main>
    );
  }
}

/**
 * Movie Details Page
 * Server component that fetches and displays detailed information about a specific movie
 * Implements error handling for invalid movie IDs and network errors
 */
export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  // Validate that ID is a valid number
  if (isNaN(movieId)) {
    return (
      <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Invalid Movie ID
          </h1>
          <p className="text-netflix-gray text-base md:text-lg mb-8">
            The movie ID provided is not valid.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark"
          >
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
            </div>
            <p className="text-netflix-gray text-base md:text-lg mt-4">Loading movie details...</p>
          </div>
        </main>
      }
    >
      <MovieDetailsContent movieId={movieId} />
    </Suspense>
  );
}
