import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAnimeDetails, getAnimeEpisodes } from '@/lib/api/jikan-client';
import { getAniListIdFromMAL } from '@/lib/api/anilist-client';
import { AnimeStreamingPlayer } from '@/features/anime-streaming/components';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ episode?: string }>;
}

export default async function AnimeDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { episode: episodeParam } = await searchParams;
  const malId = parseInt(id, 10);
  const initialEpisode = episodeParam ? parseInt(episodeParam, 10) : 1;

  if (isNaN(malId)) notFound();

  try {
    // Fetch anime details and episodes (required)
    const [detailRes, episodesRes] = await Promise.all([
      getAnimeDetails(malId),
      getAnimeEpisodes(malId),
    ]);

    const anime = detailRes.data;
    const episodes = episodesRes.data;
    const title = anime.title_english || anime.title;
    const year = anime.aired.from ? new Date(anime.aired.from).getFullYear() : null;

    // Fetch AniList ID separately (optional, don't fail page if this fails)
    let anilistId: number | null = null;
    try {
      anilistId = await getAniListIdFromMAL(malId);
      console.log(`[Anime Detail] MAL ID: ${malId}, AniList ID: ${anilistId || 'NOT FOUND'}`);
    } catch (error) {
      console.error('[Anime Detail] Failed to fetch AniList ID:', error);
      // Continue rendering page even if AniList lookup fails
    }

    return (
      <main className="min-h-screen bg-gradient-to-b from-netflix-dark-secondary to-netflix-dark">
        <article className="max-w-6xl mx-auto px-4 py-6 md:py-8">

          <Link href="/anime" className="inline-flex items-center gap-1 text-white/50 hover:text-netflix-red transition-colors text-sm mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Anime
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <aside className="md:col-span-1">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </aside>

            <section className="md:col-span-2 flex flex-col justify-start">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{title}</h1>
              {anime.title !== title && (
                <p className="text-white/50 text-sm mb-3">{anime.title}</p>
              )}
              <p className="text-netflix-gray text-base mb-4">
                {year}
                {anime.airing && ' - Present'}
                {!anime.airing && anime.aired.to && ` - ${new Date(anime.aired.to).getFullYear()}`}
              </p>

              {anime.score && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < Math.round((anime.score! / 10) * 5) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">{anime.score.toFixed(1)}/10</span>
                  {anime.scored_by && (
                    <span className="text-xs text-gray-500">({anime.scored_by.toLocaleString()} votes)</span>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-6 pb-6 border-b border-netflix-gray/20">
                <div>
                  <h3 className="text-netflix-gray text-xs font-semibold mb-1">Episodes</h3>
                  <p className="text-white text-base">
                    {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'}
                    {anime.airing && (
                      <span className="ml-2 text-xs bg-netflix-red text-white px-2 py-0.5 rounded">AIRING</span>
                    )}
                  </p>
                </div>

                {anime.genres.length > 0 && (
                  <div>
                    <h3 className="text-netflix-gray text-xs font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((g) => (
                        <span key={g.mal_id} className="px-3 py-1 bg-netflix-red/20 text-netflix-red rounded-full text-xs border border-netflix-red/50">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {anime.studios.length > 0 && (
                  <div>
                    <h3 className="text-netflix-gray text-xs font-semibold mb-1">Studios</h3>
                    <p className="text-white text-sm">{anime.studios.map((s) => s.name).join(', ')}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-netflix-gray text-xs font-semibold mb-1">Status</h3>
                  <p className="text-white text-base">{anime.status}</p>
                </div>
              </div>

              {anime.synopsis && (
                <section>
                  <h2 className="text-lg font-semibold text-white mb-3">Synopsis</h2>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">{anime.synopsis}</p>
                </section>
              )}
            </section>
          </div>

          {/* Anime Streaming Player */}
          <section className="mt-12 pt-6 border-t border-netflix-gray/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Watch Now</h2>
            {anilistId ? (
              <div>
                <div className="mb-3 text-sm text-gray-400">
                  <span>MAL ID: {malId}</span>
                  <span className="mx-2">•</span>
                  <span>AniList ID: {anilistId}</span>
                </div>
                <AnimeStreamingPlayer
                  anilistId={anilistId}
                  episode={initialEpisode}
                  totalEpisodes={anime.episodes || 99}
                  preferredLanguage="sub"
                  onEpisodeChange={(ep) => {
                    // Episode change is handled by the player component
                    console.log(`Episode changed to ${ep}`);
                  }}
                />
              </div>
            ) : (
              <div className="bg-netflix-dark-secondary rounded-lg p-8 text-center border border-netflix-gray/20">
                <p className="text-white/50 text-sm mb-2">
                  Stream not available for this anime.
                </p>
                <p className="text-white/30 text-xs mb-4">
                  MAL ID: {malId} • Unable to find AniList mapping
                </p>
                <details className="text-left mt-4">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    Why is this happening?
                  </summary>
                  <div className="mt-2 text-xs text-gray-500 space-y-2">
                    <p>This anime might not be available in the AniList database, or the MAL ID mapping is missing.</p>
                    <p>Try searching for this anime on <a href={`https://anilist.co/search/anime?search=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:underline">AniList</a> to verify.</p>
                  </div>
                </details>
              </div>
            )}
          </section>

          {/* Episodes list */}
          {episodes.length > 0 && (
            <section className="mt-12 pt-6 border-t border-netflix-gray/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Episodes ({episodesRes.pagination.items.total})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {episodes.map((ep) => (
                  <Link
                    key={ep.mal_id}
                    href={`/anime/${malId}?episode=${ep.mal_id}`}
                    className={`p-3 rounded-lg border transition-colors ${
                      ep.mal_id === initialEpisode
                        ? 'bg-netflix-red/20 border-netflix-red text-netflix-red'
                        : 'bg-gray-900/50 border-gray-800 hover:border-netflix-red text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">Ep {ep.mal_id}</span>
                      {ep.score && <span className="text-xs text-yellow-400">★ {ep.score}</span>}
                    </div>
                    {ep.title && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{ep.title}</p>
                    )}
                    {ep.filler && (
                      <span className="text-xs text-orange-400">Filler</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

        </article>
      </main>
    );
  } catch {
    notFound();
  }
}