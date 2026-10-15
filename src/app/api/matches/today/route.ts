import { NextResponse } from 'next/server';
import { getTodayMatches } from '@/lib/matches';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    const data = await getTodayMatches(forceRefresh);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve today matches', message: err.message },
      { status: 500 }
    );
  }
}
