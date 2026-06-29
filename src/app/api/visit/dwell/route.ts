import { NextRequest, NextResponse } from 'next/server';
import { setDwell } from '@/lib/visits-db';

export const dynamic = 'force-dynamic';

// Kalış süresi (saniye) — sayfa kapanırken navigator.sendBeacon ile gelir.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    await setDwell(String(b?.id || ''), Number(b?.dur) || 0);
  } catch { /* ignore */ }
  return NextResponse.json({ ok: true });
}
