'use client';

import { useRef } from 'react';
import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';

interface MovieCarouselProps {
  movies: (Movie & { vote_average?: number })[];
  onMovieClick?: (movieId: number) => void;
  watchlistIds?: number[];
}

export function MovieCarousel({
  movies,
  onMovieClick = () => {},
  watchlistIds = [],
}: MovieCarouselProps) {
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400 text-lg">No movies available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Scroll Container */}
      <ul
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-4 md:px-6 lg:px-8 scrollbar-hide list-none"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Grid Layout: 1 col mobile, 2 col tablet, 4 col desktop */}
        {movies.map((movie) => (
          <li
            key={movie.id}
            className="shrink-0 w-full sm:w-1/2 md:w-1/2 lg:w-1/4"
          >
            <MovieCard
              movie={movie}
              onClick={onMovieClick}
              isInWatchlist={watchlistIds.includes(movie.id)}
            />
          </li>
        ))}
      </ul>

      {/* Left Scroll Button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors duration-200 hidden md:flex items-center justify-center w-10 h-10 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Scroll carousel left"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors duration-200 hidden md:flex items-center justify-center w-10 h-10 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Scroll carousel right"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
