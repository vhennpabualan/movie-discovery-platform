import { Suspense } from 'react';
import Link from 'next/link';
import { WatchlistContent } from '@/features/watchlist/components/WatchlistContent';
import { LoadingSkeleton } from '@/features/ui/components/LoadingSkeleton';

/**
 * ISR Configuration: Revalidate every hour (3600 seconds)
 * Watchlist data is cached and revalidated on-demand when movies are added/removed
 */
export const revalidate = 3600;

export const metadata = {
  title: 'My Watchlist | Movie Discovery Platform',
  description: 'View and manage your saved movies',
};

export default function WatchlistPage() {
  return (
    <main className="flex flex-col min-h-screen bg-netflix-dark">
      <section className="w-full py-6 md:py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">My Watchlist</h1>
            <p className="text-netflix-gray text-sm md:text-base">Movies you want to watch</p>
          </header>

          <Suspense fallback={<LoadingSkeleton itemCount={8} />}>
            <WatchlistContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
