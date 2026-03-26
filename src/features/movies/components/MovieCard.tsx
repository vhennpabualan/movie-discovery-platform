'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { useViewTransition } from '@/lib/hooks/useViewTransition';

interface MovieCardProps {
  movie: Movie & { vote_average?: number };
  onClick?: (movieId: number) => void;
  isInWatchlist?: boolean;
  priority?: boolean;
}

export function MovieCard({
  movie,
  onClick,
  isInWatchlist = false,
  priority = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { navigateWithTransition } = useViewTransition();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set loading state
    setIsNavigating(true);
    
    // Call onClick callback first (if provided)
    onClick?.(movie.id);
    
    // Navigate with transition (has built-in error handling)
    navigateWithTransition(`/movies/${movie.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      
      // Set loading state
      setIsNavigating(true);
      
      // Call onClick callback first (if provided)
      onClick?.(movie.id);
      navigateWithTransition(`/movies/${movie.id}`);
    }
  };

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Unknown';

  const ariaLabel = `${movie.title}, released ${releaseYear}${isInWatchlist ? ', in watchlist' : ''}`;

  return (
    <div
      role="article"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
      className="relative w-full aspect-2/3 cursor-pointer rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-netflix-red/50 focus:outline-none focus:ring-2 focus:ring-netflix-red"
      style={{ viewTransitionName: `poster-image-${movie.id}` } as any}
    >
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-3 border-netflix-red border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm">Loading...</span>
          </div>
        </div>
      )}

      {/* Poster Image */}
      {movie.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-all duration-300 group-hover:brightness-125"
          priority={priority}
        />
      ) : (
        <div className="w-full h-full bg-netflix-dark-secondary flex items-center justify-center">
          <span className="text-netflix-gray text-sm">No Image</span>
        </div>
      )}

      {/* Dark Overlay with Netflix Red Accent */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

      {/* Hover Content */}
      {isHovered && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-linear-to-t from-netflix-dark via-black/50 to-transparent">
          <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
            {movie.title}
          </h3>
          {movie.vote_average !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-netflix-red text-xs font-semibold">★</span>
              <span className="text-white text-xs">
                {movie.vote_average.toFixed(1)}/10
              </span>
            </div>
          )}
        </div>
      )}

      {/* Watchlist Badge */}
      {isInWatchlist && (
        <div className="absolute top-2 right-2 bg-netflix-red rounded-full p-1.5 z-10 shadow-lg">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}
    </div>
  );
}
