import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getLogsProfile, updateLogsProfile } from '@/lib/logs-profile-db';
import { parseLogsProfile } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// Panel için logs profil bilgisi.
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const profile = await getLogsProfile();
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('GET /api/admin/logs-profile', err);
    return NextResponse.json({ error: 'Profil getirilemedi.' }, { status: 500 });
  }
}

// body = { avatarUrl, username, instagramUrl, bio: { tr, en } }
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

  const parsed = parseLogsProfile(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await updateLogsProfile(parsed.profile);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/logs-profile', err);
    return NextResponse.json({ error: 'Profil kaydedilemedi.' }, { status: 500 });
  }
}
