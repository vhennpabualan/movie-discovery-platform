'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { useViewTransition } from '@/lib/hooks/useViewTransition';

interface MovieCardProps {
  movie: Movie & { vote_average?: number };
  onClick: (movieId: number) => void;
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
  const { navigateWithTransition } = useViewTransition();

  const handleClick = () => {
    onClick(movie.id);
    navigateWithTransition(`/movies/${movie.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onClick(movie.id);
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
      {/* Poster Image */}
      {movie.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
