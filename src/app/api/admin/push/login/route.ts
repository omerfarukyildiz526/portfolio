import { NextRequest, NextResponse } from 'next/server';
import { createLoginRequest, getLoginStatus, consumeApproved } from '@/lib/push-auth';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Giriş onay isteği başlat: kayıtlı telefonlara push gönderir.
// (Kimlik doğrulamasız çağrılır — onay, kayıtlı cihaza giden push ile verilir.)
export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent')?.slice(0, 180) || 'Bilinmeyen cihaz';
  try {
    const res = await createLoginRequest(ua);
    if (!res) return NextResponse.json({ error: 'Kayıtlı onay cihazı yok. Önce panelden telefonunu ekle.' }, { status: 404 });
    return NextResponse.json({ id: res.id });
  } catch (err) {
    console.error('POST /api/admin/push/login', err);
    return NextResponse.json({ error: 'Başlatılamadı.' }, { status: 500 });
  }
}

// Masaüstü bunu yoklar. Onaylandıysa oturumu açar (tek kullanımlık).
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id gerekli.' }, { status: 400 });
  const status = await getLoginStatus(id);
  if (status !== 'approved') return NextResponse.json({ status });
  // Onaylı → tek kullanımlık tüket ve oturum çerezi bas.
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
