import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types/movie';

interface CategoryListProps {
  title: string;
  movies: (Movie & { vote_average?: number })[];
  viewMoreHref?: string;
  isTv?: boolean;
}

export function CategoryList({
  title,
  movies,
  viewMoreHref = '/browse',
  isTv = false,
}: CategoryListProps) {
  const items = movies.slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-netflix-red font-bold text-lg">{title}</h3>

      <ul className="flex flex-col gap-3">
        {items.map((movie) => {
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;
          const href = isTv ? `/tv/${movie.id}` : `/movies/${movie.id}`;

          return (
            <li key={movie.id}>
              <Link href={href} className="flex items-center gap-3 group">
                {/* Thumbnail */}
                <div className="relative w-12 h-16 shrink-0 rounded overflow-hidden bg-netflix-dark-secondary">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:brightness-110 transition-all"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-netflix-gray text-xs">?</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-white text-sm font-medium line-clamp-2 group-hover:text-netflix-red transition-colors leading-snug">
                    {movie.title}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {movie.vote_average !== undefined && (
                      <span className="text-netflix-red text-xs font-bold">
                        ★ {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                    {year && (
                      <span className="text-white/40 text-xs">{year}</span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href={viewMoreHref}
        className="text-white/50 hover:text-netflix-red text-sm transition-colors flex items-center gap-1 mt-1"
      >
        View more
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}