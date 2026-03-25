'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { searchMovies } from '@/lib/api/tmdb-client';
import { Movie } from '@/types/movie';
import { useSearchParams } from '../hooks/useSearchParams';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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
      const response = await searchMovies(searchQuery);
      setResults(response.results || []);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      setResults([]);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          navigateToMovie(results[selectedIndex].id);
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

  // Navigate to movie details page
  const navigateToMovie = (movieId: number) => {
    router.push(`/movies/${movieId}`);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    clearSearch();
  };

  // Handle result click
  const handleResultClick = (movieId: number) => {
    navigateToMovie(movieId);
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
    <form className="relative w-full md:max-w-md mobile:w-full" onSubmit={(e) => e.preventDefault()}>
      {/* Search Input */}
      <div className="relative">
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
          placeholder="Search movies..."
          aria-label="Search for movies"
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

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 bg-netflix-dark-secondary border border-netflix-gray/30 rounded-lg shadow-2xl shadow-black/50 z-50 max-h-96 overflow-y-auto"
        >
          {error ? (
            <div className="p-4 text-red-400 text-sm">{error}</div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-netflix-gray/20">
              {results.map((movie, index) => (
                <li
                  key={movie.id}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => handleResultClick(movie.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-150 ${
                    index === selectedIndex
                      ? 'bg-netflix-red/20 border-l-2 border-netflix-red'
                      : 'hover:bg-netflix-dark'
                  }`}
                >
                  {/* Movie Poster Thumbnail */}
                  {movie.poster_path ? (
                    <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden">
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-14 shrink-0 bg-netflix-gray/20 rounded flex items-center justify-center">
                      <span className="text-netflix-gray text-xs">No Image</span>
                    </div>
                  )}

                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">
                      {movie.title}
                    </h3>
                    <p className="text-netflix-gray text-xs">
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : 'N/A'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-netflix-gray text-sm text-center">
              No movies found
            </div>
          )}
        </div>
      )}
    </form>
  );
}
