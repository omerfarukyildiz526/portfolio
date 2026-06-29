import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramLoginRequest } from '@/lib/telegram-auth';
import { getLoginStatus, consumeApproved } from '@/lib/login-requests';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Giriş onayı başlat: Telegram'a onay/ret butonlu mesaj gönderir.
export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent')?.slice(0, 180) || 'Bilinmeyen cihaz';
  try {
    const res = await sendTelegramLoginRequest(ua);
    if (res === 'unconfigured') return NextResponse.json({ error: 'Telegram kurulu değil. Önce panelden bağla.' }, { status: 404 });
    if (!res) return NextResponse.json({ error: 'Mesaj gönderilemedi.' }, { status: 502 });
    return NextResponse.json({ id: res.id });
  } catch (err) {
    console.error('POST /api/admin/telegram/login', err);
    return NextResponse.json({ error: 'Başlatılamadı.' }, { status: 500 });
  }
}

// Masaüstü yoklaması. Onaylandıysa oturumu açar (tek kullanımlık).
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id gerekli.' }, { status: 400 });
  const status = await getLoginStatus(id);
  if (status !== 'approved') return NextResponse.json({ status });
  if (!(await consumeApproved(id))) return NextResponse.json({ status: 'expired' });
  const token = await createSessionToken();
  const out = NextResponse.json({ status: 'approved', ok: true });
  out.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return out;
}
