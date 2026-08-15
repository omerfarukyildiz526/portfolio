import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { createStory, getAllStoriesForAdmin } from '@/lib/log-stories-db';

export const dynamic = 'force-dynamic';

// Panel: süresi geçmişler dahil tüm hikâyeler.
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const stories = await getAllStoriesForAdmin();
    return NextResponse.json({ stories });
  } catch (err) {
    console.error('GET /api/admin/log-stories', err);
    return NextResponse.json({ error: 'Hikâyeler getirilemedi.' }, { status: 500 });
  }
}

// body = { mediaUrl, mediaType, caption?, expiresAt: "+24h" | "null" }
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const o = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const mediaUrl = typeof o.mediaUrl === 'string' ? o.mediaUrl.trim() : '';
  const mediaType = o.mediaType === 'video' ? 'video' : o.mediaType === 'image' ? 'image' : null;
  const caption = typeof o.caption === 'string' ? o.caption.trim() || undefined : undefined;
  const expiresAtRaw = o.expiresAt;

  if (!mediaUrl) return NextResponse.json({ error: 'Medya zorunlu.' }, { status: 400 });
  if (!mediaType) return NextResponse.json({ error: 'Geçersiz medya tipi.' }, { status: 400 });

  let expiresAt: Date | null;
  if (expiresAtRaw === '+24h') {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  } else if (expiresAtRaw === 'null' || expiresAtRaw === null || expiresAtRaw === undefined) {
    expiresAt = null;
  } else {
    return NextResponse.json({ error: 'Geçersiz süre değeri.' }, { status: 400 });
  }

  try {
    const story = await createStory({ mediaUrl, mediaType, caption, expiresAt });
    return NextResponse.json({ story });
  } catch (err) {
    console.error('POST /api/admin/log-stories', err);
    return NextResponse.json({ error: 'Hikâye kaydedilemedi.' }, { status: 500 });
  }
}
