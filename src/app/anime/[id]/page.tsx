import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAnimeDetails, getAnimeEpisodes, getAnimeRelations } from '@/lib/api/jikan-client';
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
    const [detailRes, episodesRes] = await Promise.all([
      getAnimeDetails(malId),
      getAnimeEpisodes(malId),
    ]);

    const anime = detailRes.data;
    const episodes = episodesRes.data;
    const title = anime.title_english || anime.title;
    const year = anime.aired.from ? new Date(anime.aired.from).getFullYear() : null;

    // Fetch related anime (sequels/prequels) for season detection
    let relatedSeasons: Array<{ mal_id: number; name: string; relation: string; type: 'Sequel' | 'Prequel' | 'Other' }> = [];
    try {
      const relationsRes = await getAnimeRelations(malId);
      
      // Get sequels and prequels
      const sequels = relationsRes.data
        .filter(rel => rel.relation === 'Sequel')
        .flatMap(rel => rel.entry.filter(e => e.type === 'anime'))
        .map(e => ({ mal_id: e.mal_id, name: e.name, relation: 'Sequel', type: 'Sequel' as const }));
      
      const prequels = relationsRes.data
        .filter(rel => rel.relation === 'Prequel')
        .flatMap(rel => rel.entry.filter(e => e.type === 'anime'))
        .map(e => ({ mal_id: e.mal_id, name: e.name, relation: 'Prequel', type: 'Prequel' as const }));
      
      relatedSeasons = [...prequels, ...sequels];
    } catch (error) {
      console.error('[Anime Detail] Failed to fetch relations:', error);
    }

    let anilistId: number | null = null;
    try {
      anilistId = await getAniListIdFromMAL(malId);
    } catch (error) {
      console.error('[Anime Detail] Failed to fetch AniList ID:', error);
    }

    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <article className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <Link href="/anime" className="inline-flex items-center gap-1 text-white/50 hover:text-red-500 transition-colors text-sm mb-6">
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

            <section className="md:col-span-2">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{title}</h1>
              {anime.title !== title && (
                <p className="text-white/50 text-sm mb-3">{anime.title}</p>
              )}
              <p className="text-gray-400 text-base mb-4">
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

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
                <div>
                  <h3 className="text-gray-400 text-xs font-semibold mb-1">Episodes</h3>
                  <p className="text-white text-base">
                    {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'}
                    {anime.airing && (
                      <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded">AIRING</span>
                    )}
                  </p>
                </div>

                {anime.genres.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 text-xs font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((g) => (
                        <span key={g.mal_id} className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs border border-red-600/50">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {anime.studios.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 text-xs font-semibold mb-1">Studios</h3>
                    <p className="text-white text-sm">{anime.studios.map((s) => s.name).join(', ')}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-gray-400 text-xs font-semibold mb-1">Status</h3>
                  <p className="text-white text-base">{anime.status}</p>
                </div>
              </div>

              {anime.synopsis && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Synopsis</h2>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">{anime.synopsis}</p>
                </div>
              )}
            </section>
          </div>

          <section className="mt-12 pt-6 border-t border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Watch Now</h2>
            {relatedSeasons.length > 0 && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <p className="text-sm text-blue-300">
                  📺 This anime has multiple seasons. Check "Related Seasons" below to watch other seasons.
                </p>
              </div>
            )}
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
                  season={1}
                  totalSeasons={1}
                  preferredLanguage="sub"
                />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <p className="text-white/50 text-sm mb-2">
                  Stream not available for this anime.
                </p>
                <p className="text-white/30 text-xs">
                  MAL ID: {malId} • Unable to find AniList mapping
                </p>
              </div>
            )}
          </section>

          {relatedSeasons.length > 0 && (
            <section className="mt-12 pt-6 border-t border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Related Seasons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Show prequels first */}
                {relatedSeasons.filter(s => s.type === 'Prequel').map((season) => (
                  <Link
                    key={season.mal_id}
                    href={`/anime/${season.mal_id}`}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-red-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-600/20 text-blue-400 rounded border border-blue-600/50">
                        ← Previous Season
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{season.name}</h3>
                  </Link>
                ))}
                
                {/* Current season indicator */}
                <div className="p-4 bg-red-900/20 rounded-lg border-2 border-red-600">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-red-600 text-white rounded">
                      ● Current Season
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">{title}</h3>
                </div>
                
                {/* Show sequels after */}
                {relatedSeasons.filter(s => s.type === 'Sequel').map((season) => (
                  <Link
                    key={season.mal_id}
                    href={`/anime/${season.mal_id}`}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-red-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-green-600/20 text-green-400 rounded border border-green-600/50">
                        Next Season →
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{season.name}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {episodes.length > 0 && (
            <section className="mt-12 pt-6 border-t border-gray-700">
              <h2 className="text-2xl font-bold mb-6">
                Episodes ({episodes.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {episodes.map((ep) => (
                  <Link
                    key={ep.mal_id}
                    href={`/anime/${malId}?episode=${ep.mal_id}`}
                    className={`p-3 rounded-lg border transition-colors ${
                      ep.mal_id === initialEpisode
                        ? 'bg-red-600/20 border-red-600 text-red-400'
                        : 'bg-gray-800 border-gray-700 hover:border-red-600 text-white'
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
  } catch (error) {
    console.error('[Anime Detail] Error:', error);
    notFound();
  }
}
