'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types/movie';

interface HeroSectionProps {
  movies: (Movie & { vote_average?: number })[];
}

export function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = movies.slice(0, 5);
  const movie = items[currentIndex];

  // Auto-cycle every 5 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const goTo = (index: number) => setCurrentIndex(index);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);

  if (!movie) return null;

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <section className="relative w-full h-[500px] md:h-[580px] overflow-hidden">
      {/* Backdrop */}
      {movie.backdrop_path ? (
        <Image
          key={movie.id}
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          fill
          priority
          className="object-cover object-top transition-opacity duration-700"
          sizes="100vw"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-netflix-dark-secondary" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent" />

      {/* Content — centered vertically */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-3xl">
        <span className="text-netflix-red font-semibold text-sm mb-3 tracking-wide">
          #{currentIndex + 1} Spotlight
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {year && (
            <span className="text-white/70 text-sm">{year}</span>
          )}
          {movie.vote_average !== undefined && (
            <span className="bg-netflix-red text-white text-xs font-bold px-2 py-0.5 rounded">
              ★ {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        {/* Overview */}
        {movie.overview && (
          <p className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-3 mb-6 max-w-xl">
            {movie.overview}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 items-center">
          <Link
            href={`/movies/${movie.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-netflix-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </Link>
          <Link
            href={`/movies/${movie.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20 text-sm backdrop-blur-sm"
          >
            Detail
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Left / Right arrows */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
        aria-label="Previous"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
        aria-label="Next"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-6 h-2 bg-netflix-red'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}