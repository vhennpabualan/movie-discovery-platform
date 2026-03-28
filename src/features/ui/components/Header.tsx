'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { SearchBar } from '@/features/search/components/SearchBar';
import { AnimeSearchBar } from '@/features/anime/components/AnimeSearchBar';
import { MobileNav } from './MobileNav';

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  
  // Check if we're on an anime page
  const isAnimePage = pathname?.startsWith('/anime');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show header at top of page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`bg-[#141414] border-b border-white/10 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo/Home Link */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-netflix-red hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-2 py-1 shrink-0"
          >
            MovieFlix
          </Link>

          {/* Search Bar - Desktop only, switches between movie/anime search */}
          <div className="hidden md:flex flex-1 max-w-md">
            <Suspense
              fallback={
                <div className="h-10 bg-netflix-dark-secondary rounded-lg animate-pulse w-full" />
              }
            >
              {isAnimePage ? <AnimeSearchBar /> : <SearchBar />}
            </Suspense>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 shrink-0">
            <Link
              href="/browse"
              className="text-sm md:text-base text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-3 py-2"
            >
              Browse
            </Link>
            <Link href="/anime" className="text-sm md:text-base text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-3 py-2">
              Anime
            </Link>
            <Link
              href="/watchlist"
              className="text-sm md:text-base text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-3 py-2"
            >
              Watchlist
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
