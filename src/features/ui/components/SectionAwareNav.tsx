'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SectionAwareNav() {
  const pathname = usePathname();
  const isAnimePage = pathname?.startsWith('/anime');

  const browseHref = isAnimePage ? '/anime/genres' : '/browse';

  return (
    <nav className="hidden md:flex items-center gap-4 shrink-0">
      <Link
        href={browseHref}
        className="text-sm md:text-base text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-3 py-2"
      >
        Browse
      </Link>
      <Link
        href="/anime"
        className="text-sm md:text-base text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-3 py-2"
      >
        Anime
      </Link>
      <Link
        href="/watchlist"
        className="text-sm md:text-base text-white hover:text-netflix-red transition-colors focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-netflix-dark rounded px-3 py-2"
      >
        Watchlist
      </Link>
    </nav>
  );
}