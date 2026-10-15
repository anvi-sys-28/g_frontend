import { NextResponse } from 'next/server';
import { getMatchDetail } from '@/lib/matches';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const data = await getMatchDetail(id, forceRefresh);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve match detail', message: err.message },
      { status: 500 }
    );
  }
}
