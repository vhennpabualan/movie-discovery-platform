'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { JikanAnime } from '@/lib/api/jikan-client';

interface AnimeCardProps {
  anime: JikanAnime;
  index?: number;
  priority?: boolean;
}

export function AnimeCard({ anime, index, priority = false }: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const title = anime.title_english || anime.title;
  const imageUrl = anime.images.webp.large_image_url || anime.images.jpg.large_image_url;
  const year = anime.aired.from ? new Date(anime.aired.from).getFullYear() : null;

  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      className="group relative flex flex-col gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-netflix-dark-secondary transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-netflix-red/30">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-all duration-300 group-hover:brightness-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-netflix-gray text-xs">No Image</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

        {/* Score badge */}
        {anime.score && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
            <span className="text-netflix-red text-xs font-bold">
              ★ {anime.score.toFixed(1)}
            </span>
          </div>
        )}

        {/* Airing badge */}
        {anime.airing && (
          <div className="absolute top-2 right-2 bg-netflix-red rounded px-1.5 py-0.5">
            <span className="text-white text-xs font-bold">AIRING</span>
          </div>
        )}

        {/* Number badge */}
        {index !== undefined && (
          <div className="absolute bottom-0 left-0 z-10">
            <span
              className="font-black leading-none select-none"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                color: 'transparent',
                WebkitTextStroke: '2px rgba(255,255,255,0.25)',
                lineHeight: 1,
                display: 'block',
                padding: '0 6px 2px',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Hover info */}
        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black via-black/50 to-transparent">
            <p className="text-white font-bold text-xs line-clamp-2 mb-1">{title}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {anime.episodes && (
                <span className="text-white/60 text-xs">{anime.episodes} eps</span>
              )}
              {year && (
                <span className="text-white/60 text-xs">{year}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Title below card */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <span className="text-white text-sm font-medium line-clamp-2 group-hover:text-netflix-red transition-colors leading-snug">
          {title}
        </span>
        {anime.episodes && (
          <span className="text-white/40 text-xs">{anime.episodes} episodes</span>
        )}
      </div>
    </Link>
  );
}