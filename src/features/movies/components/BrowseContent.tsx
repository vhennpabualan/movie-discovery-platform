// @/features/movies/components/BrowseContent.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMoviesByGenre } from '@/lib/api/tmdb-client'; // ✅ getGenres removed
import { GenreFilter } from '@/features/movies/components/GenreFilter';
import { MovieCard } from '@/features/movies/components/MovieCard';
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';
import { Movie } from '@/types/movie';

interface Genre {
  id: number;
  name: string;
}

interface BrowseContentProps {
  genres: Genre[]; // ✅ received from server, not fetched client-side
}

export function BrowseContent({ genres }: BrowseContentProps) {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const genreId = searchParams.get('genre') ? parseInt(searchParams.get('genre')!, 10) : null;
  const selectedGenre = genres.find(g => g.id === genreId);

  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // ✅ No more useEffect for genres — received as prop from server

  // Fetch movies when genre changes
  useEffect(() => {
    if (!genreId) {
      setMovies([]);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    async function fetchMovies() {
      if (!genreId) return;
      setIsLoading(true);
      setError(null);
      setMovies([]);
      setCurrentPage(1);
      setHasMore(true);

      try {
        const response = await getMoviesByGenre(genreId, 1);
        const moviesWithPosters = (response.results || []).filter(m => m.poster_path);
        setMovies(moviesWithPosters);
        setHasMore(response.page < response.total_pages);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [genreId]);

  const loadMore = useCallback(async () => {
    if (!genreId || !hasMore || loadingRef.current || isLoadingMore) return;

    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const response = await getMoviesByGenre(genreId, nextPage);
      const moviesWithPosters = (response.results || []).filter(m => m.poster_path);
      setMovies(prev => [...prev, ...moviesWithPosters]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < response.total_pages);
    } catch (err) {
      console.error('Failed to load more movies:', err);
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [genreId, currentPage, hasMore, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) loadMore();
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <main className="min-h-screen bg-netflix-dark">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Browse Movies</h1>
          {selectedGenre && (
            <p className="text-netflix-gray text-sm md:text-base mb-6">
              Showing: <span className="text-netflix-red font-semibold">{selectedGenre.name}</span>
            </p>
          )}
        </header>

        <div className="mb-8">
          <GenreFilter genres={genres} selectedGenreId={genreId} useClientNavigation={true} />
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-full aspect-2/3 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && genreId && movies.length > 0 && (
          <ErrorBoundary>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            {hasMore && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-netflix-gray">
                    <div className="w-6 h-6 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            )}
            {!hasMore && movies.length > 0 && (
              <div className="py-8 text-center text-netflix-gray">
                <p>You've reached the end</p>
              </div>
            )}
          </ErrorBoundary>
        )}

        {!isLoading && !error && genreId && movies.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-netflix-gray">No movies found for this genre</p>
          </div>
        )}

        {!genreId && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-netflix-gray">Select a genre to browse movies</p>
          </div>
        )}
      </div>
    </main>
  );
}