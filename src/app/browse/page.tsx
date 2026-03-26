'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getGenres, getMoviesByGenre } from '@/lib/api/tmdb-client';
import { GenreFilter } from '@/features/movies/components/GenreFilter';
import { MovieCard } from '@/features/movies/components/MovieCard';
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';
import { Movie } from '@/types/movie';

interface Genre {
  id: number;
  name: string;
}

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const genreId = searchParams.get('genre') ? parseInt(searchParams.get('genre')!, 10) : null;
  const selectedGenre = genres.find(g => g.id === genreId);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Fetch genres on mount
  useEffect(() => {
    async function fetchGenres() {
      try {
        const genreList = await getGenres();
        setGenres(genreList);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    }
    fetchGenres();
  }, []);

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
        const moviesWithPosters = (response.results || []).filter(movie => movie.poster_path);
        setMovies(moviesWithPosters);
        setTotalPages(response.total_pages);
        setHasMore(response.page < response.total_pages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Failed to fetch movies:', errorMessage);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [genreId]);

  // Load more movies (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!genreId || !hasMore || loadingRef.current || isLoadingMore) {
      return;
    }

    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const response = await getMoviesByGenre(genreId, nextPage);
      const moviesWithPosters = (response.results || []).filter(movie => movie.poster_path);
      
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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <main className="min-h-screen bg-netflix-dark">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Browse Movies
          </h1>
          {selectedGenre && (
            <p className="text-netflix-gray text-sm md:text-base mb-6">
              Showing: <span className="text-netflix-red font-semibold">{selectedGenre.name}</span>
            </p>
          )}
        </header>

        <div className="mb-8">
          <GenreFilter
            genres={genres}
            selectedGenreId={genreId}
            useClientNavigation={true}
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-full aspect-2/3 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12 md:py-16">
            <p className="text-red-500 text-base md:text-lg">{error}</p>
          </div>
        )}

        {!isLoading && !error && genreId && movies.length > 0 && (
          <ErrorBoundary>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
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
          <div className="flex items-center justify-center py-12 md:py-16">
            <p className="text-netflix-gray text-base md:text-lg">
              No movies found for this genre
            </p>
          </div>
        )}

        {!genreId && !isLoading && (
          <div className="flex items-center justify-center py-12 md:py-16">
            <p className="text-netflix-gray text-base md:text-lg">
              Select a genre to browse movies
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-netflix-dark">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-netflix-red border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </main>
    }>
      <BrowseContent />
    </Suspense>
  );
}
