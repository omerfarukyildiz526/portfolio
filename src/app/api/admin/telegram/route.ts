import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getTelegramStatus, discoverChatId, activateTelegram, disableTelegram } from '@/lib/telegram-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  return NextResponse.json(await getTelegramStatus());
}

// POST: bota gönderilen mesajdan chat id'yi keşfet. body = { token }
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  let token = '';
  try { token = String((await req.json())?.token || '').trim(); } catch { /* ignore */ }
  if (!token) return NextResponse.json({ error: 'Bot token gerekli.' }, { status: 400 });
  const r = await discoverChatId(token);
  if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ chatId: r.chatId });
}

// PUT: etkinleştir. body = { token, chatId }
export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  let token = '', chatId = '';
  try { const b = await req.json(); token = String(b?.token || '').trim(); chatId = String(b?.chatId || '').trim(); }
  catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }
  if (!token || !chatId) return NextResponse.json({ error: 'Token ve chat id gerekli.' }, { status: 400 });
  const origin = process.env.SITE_URL && process.env.SITE_URL.startsWith('http') ? process.env.SITE_URL : req.nextUrl.origin;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Webhook için canlı (HTTPS) site gerekir; localhost olmaz.' }, { status: 400 });
  }
  const r = await activateTelegram(token, chatId, origin);
  if (!r.ok) return NextResponse.json({ error: r.error || 'Etkinleştirilemedi.' }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  await disableTelegram();
  return NextResponse.json({ ok: true });
}
