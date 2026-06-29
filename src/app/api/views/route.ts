import { NextRequest, NextResponse } from 'next/server';
import { incrementView } from '@/lib/analytics-db';

export const dynamic = 'force-dynamic';

// Yazı görüntülenmesini say (public). İstemci, tarayıcı başına günde bir çağırır.
export async function POST(req: NextRequest) {
  let slug = '';
  try { slug = String((await req.json())?.slug || '').trim(); } catch { /* ignore */ }
  if (!slug) return NextResponse.json({ error: 'slug gerekli.' }, { status: 400 });
  try {
    await incrementView(slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // sayım hatası sessiz
  }
}
