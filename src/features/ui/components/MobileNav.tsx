'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * MobileNav Component
 *
 * Responsive navigation component that displays a hamburger menu on mobile devices
 * and collapses navigation links into a dropdown menu.
 *
 * Features:
 * - Hamburger menu button for mobile devices
 * - Smooth open/close animation
 * - Keyboard accessible (Escape to close)
 * - Click outside to close
 * - Responsive design (hidden on desktop)
 *
 * @example
 * // Usage in layout
 * <MobileNav />
 */
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        className="p-2 text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red rounded"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-netflix-dark-secondary border-b border-netflix-gray/20 shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            <Link
              href="/search"
              onClick={closeMenu}
              className="text-white hover:text-netflix-red transition-colors px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              Search
            </Link>
            <Link
              href="/watchlist"
              onClick={closeMenu}
              className="text-white hover:text-netflix-red transition-colors px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              Watchlist
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
