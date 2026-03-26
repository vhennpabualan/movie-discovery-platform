'use server';

import { Suspense } from 'react';
import { searchMovies } from '@/lib/api/tmdb-client';
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
        <p className="text-netflix-gray text-base md:text-lg">Enter a search query to find movies</p>
      </div>
    );
  }

  try {
    const results = await searchMovies(query, page);

    if (!results.results || results.results.length === 0) {
      return (
        <div className="flex items-center justify-center py-12 md:py-16">
          <p className="text-netflix-gray text-base md:text-lg text-center">
            No movies found for "{query}". Try a different search.
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
          <SearchResultsList results={results.results} />
        </section>

        {/* Pagination Info */}
        <div className="flex items-center justify-center gap-4 py-6 md:py-8">
          <p className="text-netflix-gray text-xs md:text-sm">
            Page {page} of {results.total_pages}
          </p>
        </div>

        {/* Pagination Controls */}
        {results.total_pages > 1 && (
          <nav aria-label="Search results pagination" className="flex items-center justify-center gap-4 flex-wrap">
            {page > 1 && (
              <a
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="px-4 py-2 bg-netflix-red hover:bg-red-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark text-sm md:text-base"
              >
                Previous
              </a>
            )}

            {page < results.total_pages && (
              <a
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="px-4 py-2 bg-netflix-red hover:bg-red-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark text-sm md:text-base"
              >
                Next
              </a>
            )}
          </nav>
        )}
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
