'use client';

import { MovieCard } from '@/features/movies/components/MovieCard';
import { Movie } from '@/types';
import { useViewTransition } from '@/lib/hooks/useViewTransition';

interface SearchResultsListProps {
  results: Movie[];
}

export function SearchResultsList({ results }: SearchResultsListProps) {
  const { navigateWithTransition } = useViewTransition();

  const handleMovieClick = (movieId: number) => {
    navigateWithTransition(`/movies/${movieId}`);
  };

  return (
    <ul className="contents">
      {results.map((movie) => (
        <li key={movie.id}>
          <MovieCard
            movie={movie}
            onClick={handleMovieClick}
          />
        </li>
      ))}
    </ul>
  );
}
