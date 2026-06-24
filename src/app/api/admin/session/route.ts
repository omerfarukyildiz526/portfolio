import { NextResponse } from 'next/server';
import { isAuthed, needsSetup } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [authed, setup] = await Promise.all([isAuthed(), needsSetup()]);
    return NextResponse.json({ ok: true, authed, needsSetup: setup });
  } catch (err) {
    console.error('GET /api/admin/session', err);
    return NextResponse.json({ ok: false, authed: false, needsSetup: false, dbError: true });
  }
}
