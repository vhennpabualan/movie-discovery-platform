import { Suspense } from 'react';
import { getTVShowDetails } from '@/lib/api/tmdb-client';
import { MoviePoster } from '@/features/movies/components/MoviePoster';
import { VidsrcStreamingPlayer } from '@/features/vidsrc-streaming/components';
import { APIResponseError, NetworkError } from '@/lib/api/errors';

interface TVShowDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    season?: string;
    episode?: string;
  }>;
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
 * TV show details page content component
 */
async function TVShowDetailsContent({ 
  tvId, 
  initialSeason, 
  initialEpisode 
}: { 
  tvId: number;
  initialSeason: number;
  initialEpisode: number;
}) {
  try {
    const tvShow = await getTVShowDetails(tvId);

    // Find the selected season to get episode count
    const selectedSeasonData = tvShow.seasons.find(
      (s) => s.season_number === initialSeason
    );
    const episodeCount = selectedSeasonData?.episode_count || 1;

    return (
      <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark">
        <article className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* TV Show Details Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Poster Section */}
            <aside className="md:col-span-1">
              <div className="relative aspect-2/3 rounded-lg overflow-hidden shadow-2xl">
                <MoviePoster
                  posterPath={tvShow.poster_path ?? null}
                  title={tvShow.name}
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
                {tvShow.name}
              </h1>

              {/* First Air Date */}
              {tvShow.first_air_date && (
                <p className="text-netflix-gray text-base md:text-lg mb-4">
                  {new Date(tvShow.first_air_date).getFullYear()}
                  {tvShow.status === 'Returning Series' && ' - Present'}
                  {tvShow.last_air_date && tvShow.status !== 'Returning Series' && 
                    ` - ${new Date(tvShow.last_air_date).getFullYear()}`}
                </p>
              )}

              {/* Rating */}
              <div className="mb-6">
                <StarRating voteAverage={tvShow.vote_average} />
              </div>

              {/* Metadata */}
              <div className="space-y-4 mb-6 pb-6 border-b border-netflix-gray/20">
                {/* Seasons & Episodes */}
                <div>
                  <h3 className="text-netflix-gray text-xs md:text-sm font-semibold mb-1">
                    Seasons & Episodes
                  </h3>
                  <p className="text-white text-base md:text-lg">
                    {tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''} • {tvShow.number_of_episodes} Episodes
                  </p>
                </div>

                {/* Genres */}
                {tvShow.genres && tvShow.genres.length > 0 && (
                  <div>
                    <h3 className="text-netflix-gray text-xs md:text-sm font-semibold mb-2">
                      Genres
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {tvShow.genres.map((genre) => (
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

                {/* Status */}
                <div>
                  <h3 className="text-netflix-gray text-xs md:text-sm font-semibold mb-1">
                    Status
                  </h3>
                  <p className="text-white text-base md:text-lg">
                    {tvShow.status}
                  </p>
                </div>
              </div>

              {/* Overview */}
              {tvShow.overview && (
                <section>
                  <h2 className="text-lg md:text-xl font-semibold text-white mb-3">
                    Overview
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-lg">
                    {tvShow.overview}
                  </p>
                </section>
              )}
            </section>
          </div>

          {/* Watch Now Section - Streaming Player */}
          <section className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-netflix-gray/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Watch Now</h2>
            <VidsrcStreamingPlayer
              tmdbId={tvId}
              contentType="tv"
              season={initialSeason}
              episode={initialEpisode}
              totalSeasons={tvShow.number_of_seasons}
              totalEpisodesInSeason={episodeCount}
              videoQuality="HD"
            />
          </section>

          {/* Seasons List */}
          <section className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-netflix-gray/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Seasons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tvShow.seasons
                .filter((season) => season.season_number > 0)
                .map((season) => (
                  <div
                    key={season.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-netflix-red transition-colors"
                  >
                    <h3 className="text-white font-semibold mb-1">{season.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {season.episode_count} Episode{season.episode_count !== 1 ? 's' : ''}
                    </p>
                    {season.air_date && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(season.air_date).getFullYear()}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        </article>
      </main>
    );
  } catch (error) {
    if (error instanceof APIResponseError && error.statusCode === 404) {
      return (
        <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              TV Show Not Found
            </h1>
            <p className="text-netflix-gray text-base md:text-lg mb-8">
              The TV show you're looking for doesn't exist or has been removed.
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

    if (error instanceof NetworkError) {
      return (
        <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Connection Error
            </h1>
            <p className="text-netflix-gray text-base md:text-lg mb-8">
              Unable to load TV show details. Please check your internet connection and try again.
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
      <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Error Loading TV Show
          </h1>
          <p className="text-netflix-gray text-base md:text-lg mb-8">
            An unexpected error occurred while loading the TV show details.
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
 * TV Show Details Page
 * Server component that fetches and displays detailed information about a specific TV show
 */
export default async function TVShowDetailsPage({
  params,
  searchParams,
}: TVShowDetailsPageProps) {
  const { id } = await params;
  const { season: seasonParam, episode: episodeParam } = await searchParams;
  
  const tvId = parseInt(id, 10);
  const initialSeason = seasonParam ? parseInt(seasonParam, 10) : 1;
  const initialEpisode = episodeParam ? parseInt(episodeParam, 10) : 1;

  if (isNaN(tvId)) {
    return (
      <main className="min-h-screen bg-linear-to-b from-netflix-dark-secondary to-netflix-dark flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Invalid TV Show ID
          </h1>
          <p className="text-netflix-gray text-base md:text-lg mb-8">
            The TV show ID provided is not valid.
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
            <p className="text-netflix-gray text-base md:text-lg mt-4">Loading TV show details...</p>
          </div>
        </main>
      }
    >
      <TVShowDetailsContent 
        tvId={tvId} 
        initialSeason={initialSeason}
        initialEpisode={initialEpisode}
      />
    </Suspense>
  );
}
