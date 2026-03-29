'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { searchMovies, searchTVShows } from '@/lib/api/tmdb-client';
import { Movie } from '@/types/movie';
import { useSearchParams } from '../hooks/useSearchParams';

interface SearchResult extends Movie {
  media_type?: 'movie' | 'tv';
  name?: string;
  first_air_date?: string;
  release_date?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { query: urlQuery, setQuery: setUrlQuery, clearSearch, isInitialized } = useSearchParams();

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [movieResponse, tvResponse] = await Promise.all([
        searchMovies(searchQuery),
        searchTVShows(searchQuery),
      ]);

      const allResults: SearchResult[] = [
        ...(movieResponse.results || []).map((item: any) => ({
          ...item,
          media_type: 'movie',
        })),
        ...(tvResponse.results || []).map((item: any) => ({
          ...item,
          media_type: 'tv',
        })),
      ];

      setResults(allResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      setError('Failed to search. Please try again.');
      setResults([]);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
    setIsOpen(false);
  }, [pathname]);

  // Initialize query from URL on mount
  useEffect(() => {
    if (isInitialized && urlQuery) {
      setQuery(urlQuery);
      // Perform search with URL query
      performSearch(urlQuery);
    }
  }, [isInitialized, urlQuery, performSearch]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
      // Update URL with search query
      setUrlQuery(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          navigateToItem(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Navigate to movie/TV details page
  const navigateToItem = (item: SearchResult) => {
    if (isNavigating) return; // Prevent double clicks
    setIsNavigating(true);
    const mediaType = item.media_type || 'movie';
    const path = mediaType === 'tv' ? `/tv/${item.id}` : `/movies/${item.id}`;
    router.push(path);
    // Note: The useEffect with pathname will handle resetting state
  };

  // Handle result click
  const handleResultClick = (e: React.MouseEvent, item: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToItem(item);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full md:max-w-md z-100">
      {/* Search Input Container */}
      <div className="relative z-100">
        <label htmlFor="search-input" className="sr-only">
          Search for movies
        </label>
        <input
          id="search-input"
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder="Search movies and TV shows..."
          aria-label="Search for movies and TV shows"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={isOpen}
          className="w-full px-4 py-2 bg-netflix-dark-secondary text-white rounded-lg border border-netflix-gray/30 focus:outline-none focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/50 transition-all duration-200 placeholder-netflix-gray"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-netflix-red border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Dropdown & Backdrop */}
      {isOpen && (
        <>
          {/* Backdrop: Darkens the page and captures clicks to close */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Results Dropdown: Anchored to the parent 'relative' div */}
          <div
            ref={dropdownRef}
            id="search-results"
            role="listbox"
            aria-label="Search results"
            className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/10 rounded-md shadow-2xl z-60 max-h-[70vh] overflow-y-auto"
          >
            {error ? (
              <div className="p-4 text-red-400 text-sm">{error}</div>
            ) : results.length > 0 ? (
              <ul className="flex flex-col">
                {results.map((item, index) => (
                  <li
                    key={`${item.media_type || 'movie'}-${item.id}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={(e) => handleResultClick(e, item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 p-3 border-b border-white/5 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    } ${isNavigating ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {/* Poster */}
                    <div className="relative w-12 h-16 shrink-0 bg-gray-800 rounded">
                      {item.poster_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover rounded"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {item.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-netflix-red/20 text-netflix-red rounded whitespace-nowrap">
                          {item.media_type === 'tv' ? 'TV' : 'Movie'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        {item.release_date?.split('-')[0] || 'N/A'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-gray-400 text-sm text-center">
                No results found for &quot;{query}&quot;
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
