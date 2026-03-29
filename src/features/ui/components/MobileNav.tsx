'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimeSearchBar } from '@/features/anime/components/AnimeSearchBar';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAnimePage = pathname?.startsWith('/anime');

  // ✅ Browse destination depends on which section you're in
  const browseHref = isAnimePage ? '/anime/genres' : '/browse';

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeMenu();
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // ✅ Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        className="p-2 text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red rounded z-60 relative"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-55 top-[73px]"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="fixed top-[73px] left-0 right-0 bg-[#0f0f0f] border-b border-netflix-gray/20 shadow-2xl z-56 animate-slideDown">
            {isAnimePage && (
              <div className="px-6 pt-6 pb-4 border-b border-netflix-gray/20">
                <AnimeSearchBar />
              </div>
            )}
            <nav className="flex flex-col p-6 gap-1">
              {!isAnimePage && (
                <Link
                  href="/search"
                  onClick={closeMenu}
                  className="text-white hover:bg-netflix-red/10 hover:text-netflix-red transition-all px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red text-lg"
                >
                  Search Movies/TV
                </Link>
              )}
              {/* ✅ Browse now goes to correct section */}
              <Link
                href={browseHref}
                onClick={closeMenu}
                className="text-white hover:bg-netflix-red/10 hover:text-netflix-red transition-all px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red text-lg"
              >
                Browse
              </Link>
              <Link
                href="/anime"
                onClick={closeMenu}
                className="text-white hover:bg-netflix-red/10 hover:text-netflix-red transition-all px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red text-lg"
              >
                Anime
              </Link>
              <Link
                href="/watchlist"
                onClick={closeMenu}
                className="text-white hover:bg-netflix-red/10 hover:text-netflix-red transition-all px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red text-lg"
              >
                Watchlist
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}