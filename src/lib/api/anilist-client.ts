/**
 * AniList API Client
 * Used to get AniList IDs from MAL IDs for anime streaming
 */

const ANILIST_API_URL = 'https://graphql.anilist.co';

interface AniListResponse {
  data: {
    Media: {
      id: number;
      idMal: number;
      title: {
        romaji: string;
        english: string | null;
      };
    } | null;
  };
}

/**
 * Get AniList ID from MAL ID
 * @param malId MyAnimeList ID
 * @returns AniList ID or null if not found
 */
export async function getAniListIdFromMAL(malId: number): Promise<number | null> {
  const query = `
    query ($malId: Int) {
      Media(idMal: $malId, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { malId },
      }),
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      console.error(`AniList API error: ${response.status}`);
      return null;
    }

    const data: AniListResponse = await response.json();
    
    if (data.data?.Media?.id) {
      console.log(`[AniList] Found AniList ID ${data.data.Media.id} for MAL ID ${malId}`);
      return data.data.Media.id;
    }

    console.warn(`[AniList] No AniList ID found for MAL ID ${malId}`);
    return null;
  } catch (error) {
    console.error('[AniList] Error fetching AniList ID:', error);
    return null;
  }
}
