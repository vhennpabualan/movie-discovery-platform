import Link from 'next/link';
import { searchAnime } from '@/lib/api/jikan-client';
import { AnimeCard } from '@/features/anime/components/AnimeCard';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AnimeSearchPage({ searchParams }: PageProps) {
  const { q = '' } = await searchParams;
  const results = q ? await searchAnime(q) : null;

  return (
    <main className="min-h-screen bg-netflix-dark px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/anime" className="text-white/50 hover:text-netflix-red transition-colors text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anime
          </Link>
          <span className="text-white/30">/</span>
          <h1 className="text-2xl font-bold text-white">Search Anime</h1>
        </div>

        {/* Search form */}
        <form method="GET" className="mb-10">
          <div className="flex gap-3 max-w-xl">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search anime..."
              className="flex-1 bg-netflix-dark-secondary border border-netflix-gray/30 rounded-lg px-4 py-3 text-white placeholder-netflix-gray focus:outline-none focus:border-netflix-red transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {results && (
          <>
            <p className="text-white/50 text-sm mb-6">
              {results.pagination.items.total} results for "{q}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.data.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </>
        )}

        {results && results.data.length === 0 && (
          <p className="text-white/50 text-center py-20">No results found for "{q}"</p>
        )}

        {!results && (
          <p className="text-white/50 text-center py-20">Enter a search term to find anime</p>
        )}
      </div>
    </main>
  );
}