import Link from 'next/link';
import { JikanGenre } from '@/lib/api/jikan-client';

// Curated list of popular genre IDs to show (not all 70+ genres)
const FEATURED_GENRE_IDS = [1, 2, 4, 8, 10, 22, 24, 36, 37, 41];

// Genre ID → emoji mapping for visual flair
const GENRE_EMOJI: Record<number, string> = {
  1:  '⚔️',  // Action
  2:  '🌀',  // Adventure
  4:  '😂',  // Comedy
  8:  '🤯',  // Drama
  10: '🏫',  // Fantasy
  22: '💕',  // Romance
  24: '🔬',  // Sci-Fi
  36: '🔥',  // Slice of Life
  37: '👻',  // Supernatural
  41: '🎌',  // Suspense
};

interface GenreBrowseSectionProps {
  genres: JikanGenre[];
}

export function GenreBrowseSection({ genres }: GenreBrowseSectionProps) {
  const featured = genres.filter((g) => FEATURED_GENRE_IDS.includes(g.mal_id));

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Browse by Genre</h2>
        <Link
          href="/anime/genres"
          className="text-netflix-red hover:text-red-400 text-sm transition-colors"
        >
          All genres →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {featured.map((genre) => (
          <Link
            key={genre.mal_id}
            href={`/anime/genre/${genre.mal_id}`}
            className="group flex items-center gap-3 px-4 py-3 bg-netflix-dark-secondary border border-white/10 rounded-lg hover:border-netflix-red/60 hover:bg-netflix-red/10 transition-all duration-200"
          >
            <span className="text-xl">{GENRE_EMOJI[genre.mal_id] ?? '🎬'}</span>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-medium group-hover:text-netflix-red transition-colors truncate">
                {genre.name}
              </span>
              <span className="text-white/40 text-xs">
                {genre.count.toLocaleString()} anime
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}