import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  try {
    if (!password || !checkPassword(password)) {
      return NextResponse.json({ error: 'Şifre hatalı.' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    // checkPassword / createSessionToken, env değişkeni yoksa hata fırlatır.
    console.error('POST /api/admin/login', err);
    return NextResponse.json(
      { error: 'Sunucu yapılandırması eksik: ADMIN_PASSWORD / ADMIN_SECRET tanımlı değil.' },
      { status: 500 },
    );
  }
}

// Çıkış
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
