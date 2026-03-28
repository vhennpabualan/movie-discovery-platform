import { NextRequest, NextResponse } from 'next/server';
import { getAiringAnime, getTopAnime, getPopularAnime, searchAnime } from '@/lib/api/jikan-client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'top';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const query = searchParams.get('q') || '';

  try {
    let data;
    switch (category) {
      case 'airing':   data = await getAiringAnime(page); break;
      case 'popular':  data = await getPopularAnime(page); break;
      case 'search':   data = await searchAnime(query, page); break;
      default:         data = await getTopAnime(page);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch anime' }, { status: 500 });
  }
}