import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { isAuthed, totpEnabled, beginTotpEnroll, confirmTotpEnroll, disableTotp } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Authenticator (QR/TOTP) durumu.
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  return NextResponse.json({ enabled: await totpEnabled() });
}

// Kurulumu başlat: gizli anahtar üret, QR (data URL) + manuel anahtarı döndür.
export async function POST() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  const res = await beginTotpEnroll();
  if (!res) return NextResponse.json({ error: 'Yönetici bulunamadı.' }, { status: 400 });
  const qr = await QRCode.toDataURL(res.otpauth, { margin: 1, width: 220 });
  return NextResponse.json({ qr, secret: res.secret });
}

// Kurulumu onayla: uygulamadan girilen kodla aktifleştir.
export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  let code = '';
  try { const b = await req.json(); code = typeof b?.code === 'string' ? b.code : ''; }
  catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }
  if (!(await confirmTotpEnroll(code))) {
    return NextResponse.json({ error: 'Kod doğrulanamadı. Uygulamadaki güncel kodu gir.' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// Authenticator'ı kaldır.
export async function DELETE() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  await disableTotp();
  return NextResponse.json({ ok: true });
}
