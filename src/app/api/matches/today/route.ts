import { NextResponse } from 'next/server';
import { getTodayMatches } from '@/lib/matches';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    const data = await getTodayMatches(forceRefresh);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': forceRefresh
          ? 'no-store, max-age=0'
          : 'public, s-maxage=5, stale-while-revalidate=25',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve today matches', message: err.message },
      { status: 500 }
    );
  }
}
