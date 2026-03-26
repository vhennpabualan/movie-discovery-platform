'use client';

import { useState } from 'react';
import { GenreFilter } from './GenreFilter';

interface Genre {
  id: number;
  name: string;
}

interface GenreBrowserProps {
  genres: Genre[];
}

export function GenreBrowser({ genres }: GenreBrowserProps) {
  return (
    <div className="w-full">
      <GenreFilter
        genres={genres}
        selectedGenreId={null}
        useClientNavigation={true}
      />
      
      <div className="mt-8 text-center">
        <p className="text-netflix-gray text-lg">
          Select a genre above to browse movies
        </p>
      </div>
    </div>
  );
}
