import { NextResponse } from 'next/server';
import { isAuthed, needsSetup, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [authed, setup] = await Promise.all([isAuthed(), needsSetup()]);
    const res = NextResponse.json({ ok: true, authed, needsSetup: setup });
    // Aktif oturumda çerezi yeniden bas → süre kayar (sliding 10 dk).
    // Panel açık ve kullanılıyorken bu endpoint düzenli çağrılır; çağrı durunca
    // (sekme kapalı / hareketsiz) 10 dk içinde oturum kendiliğinden düşer.
    if (authed) {
      const token = await createSessionToken();
      res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });
    }
    return res;
  } catch (err) {
    console.error('GET /api/admin/session', err);
    return NextResponse.json({ ok: false, authed: false, needsSetup: false, dbError: true });
  }
}
