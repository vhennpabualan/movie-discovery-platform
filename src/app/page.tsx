import { HeroSection } from '@/features/ui/components/HeroSection';
import { CategoryList } from '@/features/movies/components/CategoryList';
import { GenreBrowser } from '@/features/movies/components/GenreBrowser';
import {
  getMoviesByTrending,
  getNowPlaying,
  getPopularMovies,
  getTopRated,
  getTopAiringTV,
  getKDramas,
  getAnime,
  getGenres,
} from '@/lib/api/tmdb-client';

export const revalidate = 3600;

export default async function Home() {
  const [trending, nowPlaying, popular, topRated, topTV, kdramas, anime, genres] =
    await Promise.all([
      getMoviesByTrending('day'),
      getNowPlaying(),
      getPopularMovies(),
      getTopRated(),
      getTopAiringTV(),
      getKDramas(),
      getAnime(),
      getGenres(),
    ]);

  return (
    <main className="flex flex-col min-h-screen bg-netflix-dark">

      {/* ── Hero Spotlight (auto-cycles top 5 trending) ── */}
      <HeroSection movies={trending.results} />

      {/* ── Category Lists ── */}
      <section className="w-full py-10 px-4 md:px-8 bg-netflix-dark-secondary/20">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">

          {/* Row 1 — Movies */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <CategoryList title="Now Playing" movies={nowPlaying.results} viewMoreHref="/browse/now_playing" />
            <CategoryList title="Most Popular" movies={popular.results}   viewMoreHref="/browse/popular" />
            <CategoryList title="Top Rated"   movies={topRated.results}   viewMoreHref="/browse/top_rated" />
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Row 2 — TV / Anime / K-Drama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <CategoryList title="Top TV Airing" movies={topTV.results}   viewMoreHref="/browse/top_tv"  isTv={true} />
            <CategoryList title="K-Drama"       movies={kdramas.results} viewMoreHref="/browse/kdrama"  isTv={true} />
            <CategoryList title="Anime"         movies={anime.results}   viewMoreHref="/browse/anime"   isTv={true} />
          </div>

        </div>
      </section>

      {/* ── Genre Browser ── */}
      <section className="w-full py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <GenreBrowser genres={genres} />
        </div>
      </section>

    </main>
  );
}