import { NextRequest, NextResponse } from 'next/server';
import { getTelegramInternal, telegramAnswer } from '@/lib/telegram-auth';
import { resolveRequestById } from '@/lib/login-requests';

export const dynamic = 'force-dynamic';

type TgUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    message?: { message_id: number; chat?: { id?: number | string } };
  };
};

// Telegram bu uç noktaya buton tıklamalarını (callback_query) gönderir.
export async function POST(req: NextRequest) {
  const cfg = await getTelegramInternal();
  if (!cfg?.botToken || !cfg?.webhookSecret) return NextResponse.json({ ok: true });

  // Telegram'ın gönderdiği gizli başlık doğrulaması.
  if (req.headers.get('x-telegram-bot-api-secret-token') !== cfg.webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TgUpdate;
  try { update = (await req.json()) as TgUpdate; } catch { return NextResponse.json({ ok: true }); }

  const cq = update.callback_query;
  if (!cq?.message?.chat) return NextResponse.json({ ok: true });

  // Yalnızca yapılandırılmış chat onay verebilir.
  if (cfg.chatId && String(cq.message.chat.id) !== String(cfg.chatId)) {
    return NextResponse.json({ ok: true });
  }

  const m = String(cq.data || '').match(/^([ad]):(.+)$/);
  if (m) {
    const approve = m[1] === 'a';
    await resolveRequestById(m[2], approve);
    await telegramAnswer(cfg.botToken, cq.id, cq.message.chat.id as string | number, cq.message.message_id, approve);
  }
  return NextResponse.json({ ok: true });
}
