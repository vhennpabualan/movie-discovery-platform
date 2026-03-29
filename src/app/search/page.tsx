'use server';

import { Suspense } from 'react';
import { searchMovies, searchTVShows } from '@/lib/api/tmdb-client';
import { SearchResultsList } from '@/features/search/components/SearchResultsList';
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function SearchResults({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  if (!query.trim()) {
    return (
      <div className="flex items-center justify-center py-12 md:py-16">
        <p className="text-netflix-gray text-base md:text-lg">Enter a search query to find movies and TV shows</p>
      </div>
    );
  }

  try {
    // Search both movies and TV shows in parallel
    const [movieResults, tvResults] = await Promise.all([
      searchMovies(query, page),
      searchTVShows(query, page),
    ]);

    // Combine results - TV shows are already normalized by searchTVShows
    const allResults = [
      ...(movieResults.results || []).map((item: any) => ({
        ...item,
        media_type: 'movie',
      })),
      ...(tvResults.results || []).map((item: any) => ({
        ...item,
        media_type: 'tv',
      })),
    ];

    if (allResults.length === 0) {
      return (
        <div className="flex items-center justify-center py-12 md:py-16">
          <p className="text-netflix-gray text-base md:text-lg text-center">
            No movies or TV shows found for "{query}". Try a different search.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Results Grid - 2 col mobile, 3 col tablet, 5 col desktop */}
        <section
          role="region"
          aria-label="Search results"
          aria-live="polite"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6"
        >
          <SearchResultsList results={allResults} />
        </section>

        {/* Results Info */}
        <div className="flex items-center justify-center gap-4 py-6 md:py-8">
          <p className="text-netflix-gray text-xs md:text-sm">
            Found {allResults.length} results
          </p>
        </div>
      </div>
    );
  } catch (error) {
    throw error;
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1', 10);

  return (
    <main className="min-h-screen bg-netflix-dark">
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-netflix-gray text-sm md:text-base">
              Results for: <span className="text-netflix-red font-semibold">"{query}"</span>
            </p>
          )}
        </header>

        {/* Search Results with Error Boundary */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton itemCount={8} />}>
            <SearchResults query={query} page={page} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  );
}
