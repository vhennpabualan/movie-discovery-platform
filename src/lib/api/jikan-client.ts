/**
 * Jikan API Client (MyAnimeList wrapper)
 * Free, no API key required
 * Rate limit: 3 requests/second, 60/minute
 */

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Jikan anime types
export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: { image_url: string; large_image_url: string };
    webp: { image_url: string; large_image_url: string };
  };
  synopsis: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  status: string;
  episodes: number | null;
  duration: string | null;
  airing: boolean;
  aired: { from: string | null; to: string | null; string: string };
  genres: Array<{ mal_id: number; name: string }>;
  themes: Array<{ mal_id: number; name: string }>;
  studios: Array<{ mal_id: number; name: string }>;
  season: string | null;
  year: number | null;
  type: string | null;
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  aired: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
}

export interface JikanSeason {
  season: string;
  year: number;
  anime: JikanAnime[];
}

export interface JikanPaginatedResponse<T> {
  data: T[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: { count: number; total: number; per_page: number };
  };
}

async function jikanRequest<T>(endpoint: string): Promise<T> {
  const url = `${JIKAN_BASE_URL}${endpoint}`;
  // console.log(`[Jikan] Requesting: ${url}`);
  
  // Shorter cache for anime details and episodes (15 minutes for airing shows)
  const cacheTime = endpoint.includes('/episodes') || endpoint.includes('/full') ? 900 : 3600;
  
  const res = await fetch(url, {
    next: { revalidate: cacheTime },
  });

  // console.log(`[Jikan] Response status: ${res.status} for ${endpoint}`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[Jikan] Error response:`, errorText);
    throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/** Top airing anime right now */
export async function getAiringAnime(page = 1): Promise<JikanPaginatedResponse<JikanAnime>> {
  return jikanRequest(`/top/anime?filter=airing&page=${page}`);
}

/** Top anime all time */
export async function getTopAnime(page = 1): Promise<JikanPaginatedResponse<JikanAnime>> {
  return jikanRequest(`/top/anime?page=${page}`);
}

/** Most popular anime */
export async function getPopularAnime(page = 1): Promise<JikanPaginatedResponse<JikanAnime>> {
  return jikanRequest(`/top/anime?filter=bypopularity&page=${page}`);
}

/** Full anime details by MAL ID */
export async function getAnimeDetails(malId: number): Promise<{ data: JikanAnime }> {
  return jikanRequest(`/anime/${malId}/full`);
}

/** Episodes list for an anime */
export async function getAnimeEpisodes(malId: number, page = 1): Promise<JikanPaginatedResponse<JikanEpisode>> {
  return jikanRequest(`/anime/${malId}/episodes?page=${page}`);
}

/** Search anime by query */
export async function searchAnime(query: string, page = 1): Promise<JikanPaginatedResponse<JikanAnime>> {
  return jikanRequest(`/anime?q=${encodeURIComponent(query)}&page=${page}&sfw=true`);
}

/** Get anime by season e.g. winter 2025 */
export async function getSeasonalAnime(year: number, season: string, page = 1): Promise<JikanPaginatedResponse<JikanAnime>> {
  return jikanRequest(`/seasons/${year}/${season}?page=${page}`);
}

/** Get related anime (sequels, prequels, etc.) */
export async function getAnimeRelations(malId: number): Promise<{ data: Array<{ relation: string; entry: Array<{ mal_id: number; type: string; name: string; url: string }> }> }> {
  return jikanRequest(`/anime/${malId}/relations`);
}