import { NextRequest, NextResponse } from 'next/server';
import { createMessage } from '@/lib/messages-db';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  // Honeypot: botlar genelde gizli alanı doldurur. Doluysa sessizce "başarılı" de, kaydetme.
  if (typeof body.company === 'string' && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 120) return NextResponse.json({ error: 'İsim gerekli.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Geçerli bir e-posta gir.' }, { status: 400 });
  if (message.length < 2 || message.length > 5000) return NextResponse.json({ error: 'Mesaj gerekli.' }, { status: 400 });

  try {
    await createMessage({ name, email, message });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('POST /api/contact', err);
    return NextResponse.json({ error: 'Mesaj gönderilemedi, lütfen tekrar dene.' }, { status: 500 });
  }
}
