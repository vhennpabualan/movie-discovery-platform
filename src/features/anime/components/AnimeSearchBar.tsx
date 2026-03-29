'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function AnimeSearchBar() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      startTransition(() => {
        router.push(`/anime/search?q=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime..."
          disabled={isPending}
          className="w-full bg-netflix-dark-secondary border border-netflix-gray/30 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-netflix-gray focus:outline-none focus:border-netflix-red transition-colors text-sm disabled:opacity-50 disabled:cursor-wait"
          aria-label="Search anime"
        />
        {isPending ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-netflix-red"></div>
          </div>
        ) : (
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-netflix-gray pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>
    </form>
  );
}
