import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { createTopic, topicSlugExists, getAllTopics } from '@/lib/topics-db';
import { parseTopic } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const topics = await getAllTopics();
    return NextResponse.json({ topics });
  } catch (err) {
    console.error('GET /api/admin/topics', err);
    return NextResponse.json({ error: 'Konular getirilemedi.' }, { status: 500 });
  }
}

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

  const parsed = parseTopic(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (await topicSlugExists(parsed.topic.slug)) {
    return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 409 });
  }

  try {
    await createTopic(parsed.topic);
    return NextResponse.json({ ok: true, slug: parsed.topic.slug }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/topics', err);
    return NextResponse.json({ error: 'Konu kaydedilemedi.' }, { status: 500 });
  }
}
