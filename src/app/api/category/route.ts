import { NextRequest, NextResponse } from 'next/server';
import {
  getNowPlaying,
  getPopularMovies,
  getTopRated,
  getUpcoming,
  getTopAiringTV,
  getKDramas,
  getAnime,
} from '@/lib/api/tmdb-client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    let data;
    switch (category) {
      case 'now_playing': data = await getNowPlaying(page); break;
      case 'popular':     data = await getPopularMovies(page); break;
      case 'top_rated':   data = await getTopRated(page); break;
      case 'upcoming':    data = await getUpcoming(page); break;
      case 'top_tv':      data = await getTopAiringTV(page); break;
      case 'kdrama':      data = await getKDramas(page); break;
      case 'anime':       data = await getAnime(page); break;
      default:            data = await getPopularMovies(page);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}