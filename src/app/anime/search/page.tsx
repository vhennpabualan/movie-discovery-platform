import Link from 'next/link';
import { Suspense } from 'react';
import { searchAnime } from '@/lib/api/jikan-client';
import { AnimeCard } from '@/features/anime/components/AnimeCard';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="text-center py-20">
        <svg className="w-16 h-16 text-netflix-red/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-white/50 text-lg mb-2">Search for Anime</p>
        <p className="text-white/30 text-sm">Use the search bar in the header to find your favorite anime</p>
      </div>
    );
  }

  const results = await searchAnime(query);

  if (results.data.length === 0) {
    return (
      <div className="text-center py-20">
        <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-white/50 text-lg mb-2">No anime found</p>
        <p className="text-white/30 text-sm">Try searching with different keywords</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Search Results
        </h1>
        <p className="text-white/50 text-sm">
          Found {results.pagination.items.total} anime for "{query}"
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.data.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </>
  );
}

export default async function AnimeSearchPage({ searchParams }: PageProps) {
  const { q = '' } = await searchParams;

  return (
    <main className="min-h-screen bg-netflix-dark">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/anime" className="text-white/50 hover:text-netflix-red transition-colors text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Anime
          </Link>
        </div>

        {/* Results with Suspense */}
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={q} />
        </Suspense>
      </div>
    </main>
  );
}