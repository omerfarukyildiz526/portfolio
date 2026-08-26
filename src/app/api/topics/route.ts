import { NextResponse } from 'next/server';
import { getAllTopics } from '@/lib/topics-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const topics = await getAllTopics();
    return NextResponse.json({ topics });
  } catch (err) {
    console.error('GET /api/topics', err);
    return NextResponse.json({ error: 'Konular getirilemedi.' }, { status: 500 });
  }
}
