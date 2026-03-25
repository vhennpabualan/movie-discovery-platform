'use client';

import { MovieCard } from '@/features/movies/components/MovieCard';
import { Movie } from '@/types';

interface SearchResultsListProps {
  results: Movie[];
}

export function SearchResultsList({ results }: SearchResultsListProps) {
  return (
    <ul className="contents">
      {results.map((movie) => (
        <li key={movie.id}>
          <MovieCard
            movie={movie}
            onClick={() => {}}
          />
        </li>
      ))}
    </ul>
  );
}
