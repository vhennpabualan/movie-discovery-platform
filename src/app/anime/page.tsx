import Link from 'next/link';
import { getAiringAnime, getTopAnime, getPopularAnime, getAnimeGenres } from '@/lib/api/jikan-client';
import { AnimeCard } from '@/features/anime/components/AnimeCard';
import { AnimeHero } from '@/features/anime/components/AnimeHero';
import { GenreBrowseSection } from '@/features/anime/components/GenreBrowseSection';

export const revalidate = 3600;

export default async function AnimePage() {
  const [airing, top, popular, genresRes] = await Promise.all([
    getAiringAnime(),
    getTopAnime(),
    getPopularAnime(),
    getAnimeGenres(),
  ]);

  return (
    <main className="min-h-screen bg-netflix-dark">

      <AnimeHero animeList={airing.data.slice(0, 5)} />

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

        {/* Genre Browse */}
        <GenreBrowseSection genres={genresRes.data} />

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