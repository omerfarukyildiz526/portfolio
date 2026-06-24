import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { updatePost, deletePost } from '@/lib/posts-db';
import { parsePost } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/admin/posts/[slug]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { slug } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const parsed = parsePost(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Güncellemede slug değiştirmeyi engelle (URL sabit kalsın).
  parsed.post.slug = slug;

  try {
    const ok = await updatePost(slug, parsed.post);
    if (!ok) return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/posts/[slug]', err);
    return NextResponse.json({ error: 'Yazı güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/posts/[slug]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { slug } = await ctx.params;

  try {
    const ok = await deletePost(slug);
    if (!ok) return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/posts/[slug]', err);
    return NextResponse.json({ error: 'Yazı silinemedi.' }, { status: 500 });
  }
}
