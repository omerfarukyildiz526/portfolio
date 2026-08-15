import { NextResponse } from 'next/server';
import { getActiveStories } from '@/lib/log-stories-db';

export const dynamic = 'force-dynamic';

// Tek public story endpoint'i — /logs grid'i bunu client'ta gösterir.
// Yalnızca aktif (expiresAt null veya şu andan ileri) hikâyeleri döner.
export async function GET() {
  try {
    const stories = await getActiveStories();
    return NextResponse.json({ stories });
  } catch (err) {
    console.error('GET /api/logs/stories', err);
    return NextResponse.json({ stories: [] });
  }
}
