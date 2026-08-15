import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { updateLibraryItem, deleteLibraryItem } from '@/lib/library-db';
import { parseLibraryItem } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/admin/library/[id]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const parsed = parseLibraryItem(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const ok = await updateLibraryItem(id, parsed.item);
    if (!ok) return NextResponse.json({ error: 'Kayıt bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/library/[id]', err);
    return NextResponse.json({ error: 'Kayıt güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/library/[id]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { id } = await ctx.params;

  try {
    const ok = await deleteLibraryItem(id);
    if (!ok) return NextResponse.json({ error: 'Kayıt bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/library/[id]', err);
    return NextResponse.json({ error: 'Kayıt silinemedi.' }, { status: 500 });
  }
}
