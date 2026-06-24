import { NextRequest, NextResponse } from 'next/server';
import { needsSetup, setupAdmin, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// İlk kurulum: yönetici şifresi henüz yoksa belirler ve oturumu açar.
export async function POST(req: NextRequest) {
  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ error: 'Şifre en az 4 karakter olmalı.' }, { status: 400 });
  }

  try {
    if (!(await needsSetup())) {
      return NextResponse.json({ error: 'Yönetici şifresi zaten tanımlı.' }, { status: 409 });
    }
    await setupAdmin(password);
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
    console.error('POST /api/admin/setup', err);
    return NextResponse.json({ error: 'Veritabanına bağlanılamadı (MONGODB_URI yanlış veya eksik).' }, { status: 500 });
  }
}
