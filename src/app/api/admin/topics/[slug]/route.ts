import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { updateTopic, deleteTopic } from '@/lib/topics-db';
import { parseTopic } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/admin/topics/[slug]'>) {
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

  const parsed = parseTopic(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Güncellemede slug değiştirmeyi engelle (gönderilerin bağlantısı kopmasın).
  parsed.topic.slug = slug;

  try {
    const ok = await updateTopic(slug, parsed.topic);
    if (!ok) return NextResponse.json({ error: 'Konu bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/topics/[slug]', err);
    return NextResponse.json({ error: 'Konu güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/topics/[slug]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { slug } = await ctx.params;

  try {
    const ok = await deleteTopic(slug);
    if (!ok) return NextResponse.json({ error: 'Konu bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/topics/[slug]', err);
    return NextResponse.json({ error: 'Konu silinemedi.' }, { status: 500 });
  }
}
