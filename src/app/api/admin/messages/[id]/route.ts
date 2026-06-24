import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { setMessageRead, deleteMessage } from '@/lib/messages-db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/messages/[id]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { id } = await ctx.params;
  let read = true;
  try {
    const body = await req.json();
    read = body?.read !== false;
  } catch { /* varsayılan: okundu */ }

  try {
    const ok = await setMessageRead(id, read);
    if (!ok) return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/admin/messages/[id]', err);
    return NextResponse.json({ error: 'Güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/messages/[id]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const ok = await deleteMessage(id);
    if (!ok) return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/messages/[id]', err);
    return NextResponse.json({ error: 'Silinemedi.' }, { status: 500 });
  }
}
