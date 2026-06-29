import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getViewsMap } from '@/lib/analytics-db';

export const dynamic = 'force-dynamic';

// Panel: slug → görüntülenme haritası + toplam.
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  try {
    const views = await getViewsMap();
    const total = Object.values(views).reduce((a, b) => a + b, 0);
    return NextResponse.json({ views, total });
  } catch (err) {
    console.error('GET /api/admin/analytics', err);
    return NextResponse.json({ error: 'Veriler getirilemedi.' }, { status: 500 });
  }
}
