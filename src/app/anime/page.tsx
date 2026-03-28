import Link from 'next/link';
import { getAiringAnime, getTopAnime, getPopularAnime } from '@/lib/api/jikan-client';
import { AnimeCard } from '@/features/anime/components/AnimeCard';

export const revalidate = 3600;

export default async function AnimePage() {
  const [airing, top, popular] = await Promise.all([
    getAiringAnime(),
    getTopAnime(),
    getPopularAnime(),
  ]);

  const featuredAnime = airing.data[0];

  return (
    <main className="min-h-screen bg-netflix-dark">

      {/* Hero - featured airing anime */}
      {featuredAnime && (
        <section
          className="relative w-full h-[400px] md:h-[500px] overflow-hidden"
          style={{
            backgroundImage: `url(${featuredAnime.images.jpg.large_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-netflix-dark via-transparent to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-2xl">
            <span className="text-netflix-red font-semibold text-sm mb-2">Now Airing</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
              {featuredAnime.title_english || featuredAnime.title}
            </h1>
            {featuredAnime.score && (
              <span className="bg-netflix-red text-white text-xs font-bold px-2 py-0.5 rounded w-fit mb-3">
                ★ {featuredAnime.score.toFixed(1)}
              </span>
            )}
            {featuredAnime.synopsis && (
              <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-6">
                {featuredAnime.synopsis}
              </p>
            )}
            <Link
              href={`/anime/${featuredAnime.mal_id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm w-fit"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              View Details
            </Link>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-14">

        {/* Currently Airing */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Currently Airing</h2>
            <Link href="/anime/browse/airing" className="text-netflix-red hover:text-red-400 text-sm transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {airing.data.slice(0, 10).map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} priority={index < 2} />
            ))}
          </div>
        </section>

        {/* Top Rated */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Top Rated</h2>
            <Link href="/anime/browse/top" className="text-netflix-red hover:text-red-400 text-sm transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {top.data.slice(0, 10).map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        </section>

        {/* Most Popular */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Most Popular</h2>
            <Link href="/anime/browse/popular" className="text-netflix-red hover:text-red-400 text-sm transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popular.data.slice(0, 10).map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}