// app/browse/page.tsx — new server wrapper
import { Suspense } from 'react';
import { getGenres } from '@/lib/api/tmdb-client';
import { BrowseContent } from '@/features/movies/components/BrowseContent';

export const revalidate = 604800; // genres: 1 week

export default async function BrowsePage() {
  const genres = await getGenres();

  return (
    <Suspense fallback={
      <main className="min-h-screen bg-netflix-dark">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </main>
    }>
      <BrowseContent genres={genres} />
    </Suspense>
  );
}