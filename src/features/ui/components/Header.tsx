'use client';

import { useState, useEffect, useRef } from 'react'; // ✅ added useRef
import Link from 'next/link';
import { SearchBarSwitcher } from './SearchBarSwitcher';
import { SectionAwareNav } from './SectionAwareNav';
import { MobileNav } from './MobileNav';

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0); // ✅ ref instead of state

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollYRef.current) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // ✅ empty deps — registers once only

  return (
    <header
      className={`bg-[#141414] border-b border-white/10 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-netflix-red hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-2 py-1 shrink-0"
          >
            MovieFlix
          </Link>

          {/* Search Bar — switches between movie/anime automatically */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBarSwitcher />
          </div>

          <SectionAwareNav />

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}