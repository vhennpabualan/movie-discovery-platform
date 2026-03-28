import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMoviesByCategory } from '@/lib/api/tmdb-client';
import { CategoryGrid } from '@/features/movies/components/CategoryGrid';

export const revalidate = 3600;

const CATEGORY_LABELS: Record<string, string> = {
  now_playing: 'Now Playing',
  popular:     'Most Popular',
  top_rated:   'Top Rated',
  top_tv:      'Top TV Airing',
  kdrama:      'K-Drama',
  anime:       'Anime',
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (!CATEGORY_LABELS[category]) notFound();

  const data = await getMoviesByCategory(
    category as 'now_playing' | 'popular' | 'top_rated' | 'upcoming' | 'top_tv' | 'kdrama' | 'anime'
  );

  const label = CATEGORY_LABELS[category];
  const isTv = ['top_tv', 'kdrama', 'anime'].includes(category);

  return (
    <main className="min-h-screen bg-netflix-dark px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-white/50 hover:text-netflix-red transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <span className="text-white/30">/</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{label}</h1>
        </div>

        {/* Grid with Load More */}
        <CategoryGrid
          initialMovies={data.results}
          category={category}
          isTv={isTv}
          totalPages={data.total_pages}
        />

      </div>
    </main>
  );
}