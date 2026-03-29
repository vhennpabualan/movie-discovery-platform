'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { SearchBar } from '@/features/search/components/SearchBar';
import { AnimeSearchBar } from '@/features/anime/components/AnimeSearchBar';

export function SearchBarSwitcher() {
  const pathname = usePathname();
  return (
    <Suspense fallback={<div className="h-10 bg-netflix-dark-secondary rounded-lg animate-pulse w-full" />}>
      {pathname?.startsWith('/anime') ? <AnimeSearchBar /> : <SearchBar />}
    </Suspense>
  );
}