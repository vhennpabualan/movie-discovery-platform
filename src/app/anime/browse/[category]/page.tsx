import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAiringAnime, getTopAnime, getPopularAnime } from '@/lib/api/jikan-client';
import { AnimeGrid } from '@/features/anime/components/AnimeGrid';

export const revalidate = 3600;

const CATEGORY_LABELS: Record<string, string> = {
  airing:  'Currently Airing',
  top:     'Top Rated',
  popular: 'Most Popular',
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function AnimeBrowsePage({ params }: PageProps) {
  const { category } = await params;
  if (!CATEGORY_LABELS[category]) notFound();

  let data;
  switch (category) {
    case 'airing':  data = await getAiringAnime(); break;
    case 'popular': data = await getPopularAnime(); break;
    default:        data = await getTopAnime();
  }

  return (
    <main className="min-h-screen bg-netflix-dark px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/anime" className="text-white/50 hover:text-netflix-red transition-colors text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anime
          </Link>
          <span className="text-white/30">/</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{CATEGORY_LABELS[category]}</h1>
        </div>
        <AnimeGrid initialData={data} category={category} />
      </div>
    </main>
  );
}