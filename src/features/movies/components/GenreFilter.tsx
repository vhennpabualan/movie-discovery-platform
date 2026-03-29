'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Genre {
  id: number;
  name: string;
}

interface GenreFilterProps {
  genres: Genre[];
  selectedGenreId: number | null;
  onGenreSelect?: (genreId: number | null) => void;
  useClientNavigation?: boolean;
}

export function GenreFilter({ 
  genres, 
  selectedGenreId, 
  onGenreSelect,
  useClientNavigation = false 
}: GenreFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleGenreSelect = (genreId: number | null) => {
    if (onGenreSelect) {
      onGenreSelect(genreId);
    } else if (useClientNavigation) {
      if (genreId) {
        router.push(`/browse?genre=${genreId}`);
      } else {
        router.push('/browse');
      }
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-semibold text-white">Browse by Genre</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden px-4 py-2 bg-netflix-dark-secondary text-white rounded-lg hover:bg-netflix-gray/20 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="genre-list"
        >
          {isExpanded ? 'Hide' : 'Show'} Genres
        </button>
      </div>
      
      <div
        id="genre-list"
        className={`${
          isExpanded ? 'flex' : 'hidden'
        } md:flex flex-wrap gap-2 md:gap-3`}
      >
        <button
          onClick={() => handleGenreSelect(null)}
          className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-200 transform hover:scale-105 ${
            selectedGenreId === null
              ? 'bg-netflix-red text-white shadow-lg hover:bg-red-700'
              : 'bg-netflix-dark-secondary text-netflix-gray hover:bg-netflix-red/80 hover:text-white hover:shadow-md'
          }`}
          aria-pressed={selectedGenreId === null}
        >
          All Movies
        </button>
        
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreSelect(genre.id)}
            className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-200 transform hover:scale-105 ${
              selectedGenreId === genre.id
                ? 'bg-netflix-red text-white shadow-lg hover:bg-red-700'
                : 'bg-netflix-dark-secondary text-netflix-gray hover:bg-netflix-red/80 hover:text-white hover:shadow-md'
            }`}
            aria-pressed={selectedGenreId === genre.id}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}
