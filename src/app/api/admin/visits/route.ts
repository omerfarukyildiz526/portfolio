import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getRecentVisits, getSummary } from '@/lib/visits-db';

export const dynamic = 'force-dynamic';

// Panel: son ziyaretler + son 24 saat özeti.
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  try {
    const [visits, summary] = await Promise.all([
      getRecentVisits(60),
      getSummary(Date.now() - 24 * 3600e3),
    ]);
    return NextResponse.json({ visits, summary });
  } catch (err) {
    console.error('GET /api/admin/visits', err);
    return NextResponse.json({ error: 'Getirilemedi.' }, { status: 500 });
  }
}
