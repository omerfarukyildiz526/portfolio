import { NextResponse } from 'next/server';
import { createSessionToken, createLoginCode, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';
import { mailerConfigured, sendMail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

// Şifresiz giriş: e-postaya tek kullanımlık kod gönderir.
export async function POST() {
  try {
    // SMTP yapılandırılmışsa e-posta ile doğrulama kodu gönder.
    if (mailerConfigured()) {
      const code = await createLoginCode();
      if (!code) return NextResponse.json({ error: 'Doğrulama kodu üretilemedi.' }, { status: 500 });
      const to = process.env.ADMIN_2FA_EMAIL || 'omerfaruk_yildiz@outlook.com';
      const siteUrl = (process.env.SITE_URL || 'https://omerfarukyildiz.tech').replace(/\/+$/, '');
      try {
        await sendMail({
          to,
          subject: '🔐 Kapıda biri var, kodun geldi patron',
          text: `Selam patron 👋\n\nBirileri (umarım sensindir) panele girmeye çalışıyor. Sihirli kelime:\n\n${code}\n\n10 dakikan var, sonra kabak gibi kaybolur 🎃\nSen değilsen... e o zaman ilginç bir gün seni bekliyor 🕵️`,
          html: `
          <div style="margin:0;padding:32px 16px;background:#0b0b0f;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
            <div style="max-width:440px;margin:0 auto;background:#15151c;border:1px solid #2a2a35;border-radius:18px;overflow:hidden">
              <div style="padding:28px 28px 8px;text-align:center">
                <img src="${siteUrl}/logo.png" alt="ÖFY" width="56" height="56"
                  style="width:56px;height:56px;border-radius:50%;border:1px solid #2a2a35" />
              </div>
              <div style="padding:8px 30px 30px;color:#e6e6ee">
                <p style="font-size:17px;font-weight:600;margin:14px 0 6px">Selam patron 👋</p>
                <p style="font-size:14px;line-height:1.6;color:#a9a9b8;margin:0 0 18px">
                  Birileri (umarım sensindir) <b style="color:#e6e6ee">CONTROL.</b> paneline girmeye çalışıyor.
                  Kapıyı açacak sihirli kelime şu:
                </p>
                <div style="text-align:center;margin:22px 0">
                  <span style="display:inline-block;font-family:'JetBrains Mono',monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#0A84FF;background:#0a84ff14;border:1px solid #0a84ff33;border-radius:14px;padding:14px 22px">
                    ${code}
                  </span>
                </div>
                <p style="font-size:13px;line-height:1.6;color:#8a8a99;margin:18px 0 0">
                  ⏳ 10 dakikan var, sonra kabak gibi kaybolur.<br/>
                  🕵️ Sen değilsen... e o zaman birinin şifreni bildiğini öğrendik, hayırlı olsun.
                </p>
                <p style="font-size:12px;color:#5a5a66;margin:22px 0 0;border-top:1px solid #2a2a35;padding-top:14px">
                  Ömer Faruk Yıldız · otomatik gönderildi, cevap yazma (bot okuyamıyor, üzülür) 🤖
                </p>
              </div>
            </div>
          </div>`,
        });
      } catch (mailErr) {
        console.error('2FA mail gönderilemedi', mailErr);
        return NextResponse.json({ error: 'Doğrulama kodu gönderilemedi, lütfen tekrar dene.' }, { status: 500 });
      }
      return NextResponse.json({ codeRequired: true });
    }

    // SMTP yok → eski davranış: doğrudan giriş.
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
    // Genelde veritabanına bağlanılamıyordur (MONGODB_URI yanlış/eksik).
    console.error('POST /api/admin/login', err);
    return NextResponse.json(
      { error: 'Veritabanına bağlanılamadı (MONGODB_URI yanlış veya eksik).' },
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
