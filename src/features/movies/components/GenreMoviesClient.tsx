'use client';

import { useEffect, useState } from 'react';
import { getMoviesByGenre } from '@/lib/api/tmdb-client';
import { MovieCarousel } from './MovieCarousel';
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';
import { ErrorBoundary } from '@/features/ui/components/ErrorBoundary';
import { Movie } from '@/types/movie';

interface GenreMoviesClientProps {
  genreId: number;
  genreName: string;
}

export function GenreMoviesClient({ genreId, genreName }: GenreMoviesClientProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMovies() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMoviesByGenre(genreId, 1);
        if (isMounted) {
          // Filter out movies without poster images for better UX
          const moviesWithPosters = (response.results || []).filter(movie => movie.poster_path);
          setMovies(moviesWithPosters);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          console.error(`[GenreMoviesClient] Failed to fetch movies for genre ${genreId}:`, errorMessage);
          setError('Failed to load movies. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [genreId]);

  if (isLoading) {
    return <LoadingSkeleton itemCount={5} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-netflix-gray text-lg">No movies found for {genreName}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MovieCarousel movies={movies} />
    </ErrorBoundary>
  );
}
