import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { deleteStory } from '@/lib/log-stories-db';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/admin/log-stories/[id]'>) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const ok = await deleteStory(id);
    if (!ok) return NextResponse.json({ error: 'Hikâye bulunamadı.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/log-stories/[id]', err);
    return NextResponse.json({ error: 'Silinemedi.' }, { status: 500 });
  }
}
