'use client';

import { useState } from 'react';
import { JikanAnime, JikanPaginatedResponse } from '@/lib/api/jikan-client';
import { AnimeCard } from './AnimeCard';

interface AnimeGridProps {
  initialData: JikanPaginatedResponse<JikanAnime>;
  category: string;
}

export function AnimeGrid({ initialData, category }: AnimeGridProps) {
  const [animes, setAnimes] = useState(initialData.data);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = initialData.pagination.has_next_page && currentPage < 10;

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const res = await fetch(`/api/anime?category=${category}&page=${nextPage}`);
      const data: JikanPaginatedResponse<JikanAnime> = await res.json();
      setAnimes((prev) => [...prev, ...data.data]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Failed to load more anime:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {animes.map((anime, index) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-8 py-3 bg-netflix-red hover:bg-red-700 disabled:bg-netflix-red/50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : 'Load More'}
          </button>
        </div>
      )}

      {!hasMore && animes.length > 25 && (
        <p className="text-center text-white/30 text-sm">You've reached the end</p>
      )}
    </div>
  );
}