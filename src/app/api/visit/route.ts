import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/visits-db';

export const dynamic = 'force-dynamic';

// Ziyaret kaydı (public). İstemci sayfa açılışında çağırır.
export async function POST(req: NextRequest) {
  let path = '/', ref = '';
  try { const b = await req.json(); path = String(b?.path || '/'); ref = String(b?.ref || ''); } catch { /* ignore */ }
  if (path.startsWith('/admin')) return NextResponse.json({ ok: true }); // admin ziyaret sayılmaz

  const ua = req.headers.get('user-agent') || '';
  const country = req.headers.get('x-vercel-ip-country') || undefined;          // Vercel CDN (ücretsiz)
  const cityRaw = req.headers.get('x-vercel-ip-city') || '';
  const city = cityRaw ? decodeURIComponent(cityRaw) : undefined;

  try {
    const id = await recordVisit({ path, ref, ua, country, city });
    return NextResponse.json({ id });
  } catch (err) {
    console.error('POST /api/visit', err);
    return NextResponse.json({ ok: false }, { status: 200 }); // sessiz
  }
}
