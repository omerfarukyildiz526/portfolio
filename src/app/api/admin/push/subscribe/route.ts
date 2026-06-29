import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getVapidPublicKey, saveSubscription, listDevices, clearSubscriptions, deviceLabel } from '@/lib/push-auth';
import type { PushSubscription } from 'web-push';

export const dynamic = 'force-dynamic';

// Panel: kayıtlı cihaz listesi + abonelik için gereken VAPID public key.
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  try {
    const [key, devices] = await Promise.all([getVapidPublicKey(), listDevices()]);
    return NextResponse.json({ key, devices, count: devices.length });
  } catch (err) {
    console.error('GET /api/admin/push/subscribe', err);
    return NextResponse.json({ error: 'Hazırlanamadı.' }, { status: 500 });
  }
}

// Bu cihazı onay cihazı olarak kaydet.
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  let sub: PushSubscription;
  try { sub = (await req.json())?.subscription; } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }
  if (!sub?.endpoint) return NextResponse.json({ error: 'Geçersiz abonelik.' }, { status: 400 });
  try {
    await saveSubscription(sub, deviceLabel(req.headers.get('user-agent') || ''));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/admin/push/subscribe', err);
    return NextResponse.json({ error: 'Kaydedilemedi.' }, { status: 500 });
  }
}

// Tüm onay cihazlarını kaldır.
export async function DELETE() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  await clearSubscriptions();
  return NextResponse.json({ ok: true });
}
