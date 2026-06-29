import { NextRequest, NextResponse } from 'next/server';
import { verifyLoginCode, verifyTotp, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 2. adım: e-posta ile gelen giriş kodunu doğrula ve oturumu başlat.
export async function POST(req: NextRequest) {
  let code = '';
  try {
    const body = await req.json();
    code = typeof body?.code === 'string' ? body.code.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  try {
    // Hem authenticator (TOTP) kodu hem e-posta kodu kabul edilir.
    const ok = !!code && ((await verifyTotp(code)) || (await verifyLoginCode(code)));
    if (!ok) {
      return NextResponse.json({ error: 'Kod hatalı veya süresi dolmuş.' }, { status: 400 });
    }
    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error('POST /api/admin/verify', err);
    return NextResponse.json({ error: 'Doğrulama başarısız.' }, { status: 500 });
  }
}
