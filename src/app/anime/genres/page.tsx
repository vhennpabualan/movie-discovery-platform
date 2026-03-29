import Link from 'next/link';
import { getAnimeGenres } from '@/lib/api/jikan-client';

export const revalidate = 86400; // genres don't change often

export default async function AllGenresPage() {
  const { data: genres } = await getAnimeGenres();

  return (
    <main className="min-h-screen bg-netflix-dark">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <Link href="/anime" className="text-white/50 hover:text-white text-sm transition-colors mb-4 inline-block">
            ← Back to Anime
          </Link>
          <h1 className="text-3xl font-black text-white">All Genres</h1>
          <p className="text-white/50 text-sm mt-1">{genres.length} genres available</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {genres.map((genre) => (
            <Link
              key={genre.mal_id}
              href={`/anime/genre/${genre.mal_id}`}
              className="group flex items-center justify-between px-4 py-3 bg-netflix-dark-secondary border border-white/10 rounded-lg hover:border-netflix-red/60 hover:bg-netflix-red/10 transition-all duration-200"
            >
              <span className="text-white text-sm font-medium group-hover:text-netflix-red transition-colors">
                {genre.name}
              </span>
              <span className="text-white/30 text-xs shrink-0 ml-2">
                {genre.count.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}