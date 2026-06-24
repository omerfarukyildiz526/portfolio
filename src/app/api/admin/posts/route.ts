import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { createPost, slugExists, getAllPostsAdmin } from '@/lib/posts-db';
import { parsePost } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// Panel için tüm yazılar (taslaklar dahil).
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const posts = await getAllPostsAdmin();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('GET /api/admin/posts', err);
    return NextResponse.json({ error: 'Yazılar getirilemedi.' }, { status: 500 });
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

  const parsed = parsePost(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (await slugExists(parsed.post.slug)) {
    return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 409 });
  }

  try {
    await createPost(parsed.post);
    return NextResponse.json({ ok: true, slug: parsed.post.slug }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/posts', err);
    return NextResponse.json({ error: 'Yazı kaydedilemedi.' }, { status: 500 });
  }
}
