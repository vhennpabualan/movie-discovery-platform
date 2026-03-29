'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { JikanAnime } from '@/lib/api/jikan-client';

interface AnimeHeroProps {
  animeList: JikanAnime[];
}

const INTERVAL_MS = 5000;

export function AnimeHero({ animeList }: AnimeHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % animeList.length);
  }, [activeIndex, animeList.length, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { goNext(); return 0; }
        return prev + 100 / (INTERVAL_MS / 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPaused, goNext]);

  const anime = animeList[activeIndex];
  if (!anime) return null;

  const title = anime.title_english || anime.title;

  return (
    <section
      className="relative w-full h-[450px] md:h-[600px] overflow-hidden bg-netflix-dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {animeList.map((a, i) => {
        const isActive = i === activeIndex;
        if (!isActive) return null;

        return (
          <div key={a.mal_id} className="absolute inset-0 animate-in fade-in duration-1000">
            {/* 1. Sharp Image Layer */}
            <div className="absolute inset-0">
              <Image
                src={a.images.jpg.large_image_url}
                alt={title}
                fill
                priority
                sizes="100vw"
                className="object-cover object-right md:object-[right_25%] transition-transform duration-[10000ms] scale-105"
              />
            </div>

            {/* 2. Seamless Blur Overlay */}
            <div 
              className="absolute inset-0 z-10 backdrop-blur-3xl"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, black 25%, rgba(0, 0, 0, 0.5) 45%, transparent 75%)',
                maskImage: 'linear-gradient(to right, black 25%, rgba(0, 0, 0, 0.5) 45%, transparent 75%)',
              }}
            />

            {/* 3. Gradient Overlay for text readability */}
            <div className="absolute inset-y-0 left-0 w-full md:w-[65%] z-20 bg-gradient-to-r from-netflix-dark via-netflix-dark/60 to-transparent" />

            {/* 4. Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-netflix-dark via-netflix-dark/20 to-transparent z-30" />
          </div>
        );
      })}

      {/* Content — Left Side */}
      <div className="relative z-40 h-full flex flex-col justify-center px-6 md:px-16 max-w-3xl">
        <span className="text-netflix-red font-bold text-sm mb-2 tracking-wider uppercase drop-shadow-md">Now Airing</span>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-[1.1] drop-shadow-2xl">
          {title}
        </h1>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {anime.score && (
            <span className="bg-netflix-red text-white text-xs font-bold px-2.5 py-1 rounded shadow-lg">
              ★ {anime.score.toFixed(1)}
            </span>
          )}
          {anime.genres?.slice(0, 3).map((g) => (
            <span key={g.mal_id} className="text-white/70 text-xs font-medium bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/10">
              {g.name}
            </span>
          ))}
        </div>
        {anime.synopsis && (
          <p className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-3 mb-8 max-w-xl drop-shadow">
            {anime.synopsis}
          </p>
        )}
        <Link
          href={`/anime/${anime.mal_id}`}
          className="group inline-flex items-center gap-3 px-8 py-3 bg-white text-black hover:bg-white/90 transition-all rounded-md font-bold text-base w-fit"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play Now
        </Link>
      </div>

      {/* --- Navigation Controls (FIXED ARROWS) --- */}
      
      {/* Prev Arrow */}
      <button
        onClick={() => goTo((activeIndex - 1 + animeList.length) % animeList.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/60 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
        aria-label="Previous"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Next Arrow */}
      <button
        onClick={() => goNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/60 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
        aria-label="Next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-10 right-10 z-50 flex flex-col items-end gap-4">
        <div className="flex items-center gap-3">
          {animeList.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                i === activeIndex ? 'w-8 bg-netflix-red' : 'w-3 bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-netflix-red transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}