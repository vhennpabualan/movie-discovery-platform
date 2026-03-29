'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { getMoviesByCategory } from '@/lib/api/tmdb-client';

interface CategoryGridProps {
  initialMovies: Movie[];
  category: string;
  isTv: boolean;
  totalPages: number;
}

export function CategoryGrid({ initialMovies, category, isTv, totalPages }: CategoryGridProps) {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || currentPage >= totalPages) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const data = await getMoviesByCategory(
        category as 'now_playing' | 'popular' | 'top_rated' | 'upcoming' | 'top_tv' | 'kdrama' | 'anime',
        nextPage
      );
      setMovies((prev) => [...prev, ...data.results]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={(id) => {
              router.push(isTv ? `/tv/${id}` : `/movies/${id}`);
            }}
          />
        ))}
      </div>

      {/* Load More Button */}
      {currentPage < totalPages && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-netflix-red hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
