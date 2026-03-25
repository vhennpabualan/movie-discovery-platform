'use client';

import { useSearchParams as useNextSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for managing URL search parameters
 *
 * Provides functionality to:
 * - Read query parameter from URL (?q=query)
 * - Update URL when user performs search
 * - Populate input field with query value on page load
 * - Remove query parameter when search is cleared
 * - Enable bookmarking and sharing of search results
 * - Handle URL encoding/decoding properly
 * - Support browser back/forward navigation
 */
export function useSearchParams() {
  const router = useRouter();
  const searchParams = useNextSearchParams();
  const [query, setQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize query from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when query changes
  const updateSearchParams = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (newQuery.trim()) {
        // Encode query and update URL
        const encodedQuery = encodeURIComponent(newQuery);
        router.push(`?q=${encodedQuery}`, { scroll: false });
      } else {
        // Clear query parameter
        router.push('?', { scroll: false });
      }
    },
    [router]
  );

  // Get current query from URL
  const getQuery = useCallback(() => {
    return searchParams.get('q') || '';
  }, [searchParams]);

  // Clear search parameters
  const clearSearch = useCallback(() => {
    setQuery('');
    router.push('?', { scroll: false });
  }, [router]);

  return {
    query,
    setQuery: updateSearchParams,
    getQuery,
    clearSearch,
    isInitialized,
  };
}
