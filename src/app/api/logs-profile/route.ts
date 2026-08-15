import { NextResponse } from 'next/server';
import { getLogsProfile } from '@/lib/logs-profile-db';
import { SEED_LOGS_PROFILE } from '@/lib/logs-profile';

export const dynamic = 'force-dynamic';

// /logs grid'inin profil header'ı için herkese açık okuma.
export async function GET() {
  try {
    const profile = await getLogsProfile();
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('GET /api/logs-profile', err);
    return NextResponse.json({ profile: SEED_LOGS_PROFILE });
  }
}
