'use client';

import { MovieCard } from '@/features/movies/components/MovieCard';
import { Movie } from '@/types';

interface SearchResult extends Movie {
  media_type?: 'movie' | 'tv';
  name?: string; // For TV shows (kept for reference)
  first_air_date?: string; // For TV shows (kept for reference)
}

interface SearchResultsListProps {
  results: SearchResult[];
}

export function SearchResultsList({ results }: SearchResultsListProps) {
  return (
    <ul className="contents">
      {results.map((item) => (
        <li key={`${item.media_type || 'movie'}-${item.id}`}>
          <MovieCard 
            movie={item} 
          />
        </li>
      ))}
    </ul>
  );
}
