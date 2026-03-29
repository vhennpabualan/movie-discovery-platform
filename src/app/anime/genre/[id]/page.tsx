import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAnimeByGenre, getAnimeGenres } from '@/lib/api/jikan-client';
import { AnimeCard } from '@/features/anime/components/AnimeCard';

export const revalidate = 3600;

interface GenrePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;

  const genreId = parseInt(id);
  const page = parseInt(pageParam ?? '1');

  if (isNaN(genreId)) notFound();

  const [genresRes, animeRes] = await Promise.all([
    getAnimeGenres(),
    getAnimeByGenre(genreId, page),
  ]);

  const genre = genresRes.data.find((g) => g.mal_id === genreId);
  if (!genre) notFound();

  const { data: animeList, pagination } = animeRes;

  return (
    <main className="min-h-screen bg-netflix-dark">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/anime"
            className="text-white/50 hover:text-white text-sm transition-colors mb-4 inline-block"
          >
            ← Back to Anime
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {genre.name}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {genre.count.toLocaleString()} anime in this genre
          </p>
        </div>

        {/* Anime Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
          {animeList.map((anime, index) => (
            <AnimeCard key={anime.mal_id} anime={anime} index={index} priority={index < 4} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/anime/genre/${genreId}?page=${page - 1}`}
              className="px-4 py-2 bg-netflix-dark-secondary border border-white/10 text-white text-sm rounded-lg hover:border-netflix-red/60 transition-colors"
            >
              ← Prev
            </Link>
          )}
          <span className="text-white/50 text-sm">
            Page {page} of {pagination.last_visible_page}
          </span>
          {pagination.has_next_page && (
            <Link
              href={`/anime/genre/${genreId}?page=${page + 1}`}
              className="px-4 py-2 bg-netflix-dark-secondary border border-white/10 text-white text-sm rounded-lg hover:border-netflix-red/60 transition-colors"
            >
              Next →
            </Link>
          )}
        </div>

      </div>
    </main>
  );
}