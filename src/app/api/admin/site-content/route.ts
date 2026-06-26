import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getSiteContent, updatePageContent } from '@/lib/site-content-db';
import { parsePageContent } from '@/lib/validate';
import type { PageKey } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

const PAGES: PageKey[] = ['home', 'experience', 'contact', 'projects'];

// Panel için tüm sayfa içerikleri.
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (err) {
    console.error('GET /api/admin/site-content', err);
    return NextResponse.json({ error: 'İçerik getirilemedi.' }, { status: 500 });
  }
}

// Tek bir sayfayı günceller: body = { page, content: { tr, en } }
export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const page = b.page as PageKey;
  if (!PAGES.includes(page)) {
    return NextResponse.json({ error: 'Geçersiz sayfa.' }, { status: 400 });
  }

  const parsed = parsePageContent(page, b.content);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await updatePageContent(page, { tr: parsed.tr, en: parsed.en });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/site-content', err);
    return NextResponse.json({ error: 'İçerik kaydedilemedi.' }, { status: 500 });
  }
}
