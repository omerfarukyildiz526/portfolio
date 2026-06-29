import { NextRequest, NextResponse } from 'next/server';
import { getSummary } from '@/lib/visits-db';
import { sendTelegramMessage } from '@/lib/telegram-auth';

export const dynamic = 'force-dynamic';

// Günlük ziyaretçi özetini Telegram'a gönderir (Vercel cron veya harici cron çağırır).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    const qs = req.nextUrl.searchParams.get('secret');
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
    }
  }

  const s = await getSummary(Date.now() - 24 * 3600e3);
  const fmtDur = (sec: number) => (sec >= 60 ? `${Math.floor(sec / 60)}dk ${sec % 60}sn` : `${sec}sn`);
  const top = (m: Record<string, number>) =>
    Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `  • ${k}: ${v}`).join('\n') || '  —';

  const text = s.total === 0
    ? '📊 Son 24 saatte ziyaret yok.'
    : `📊 Son 24 saat — Ziyaretçi özeti\n\n👥 Toplam: ${s.total}\n⏱️ Ort. kalış: ${fmtDur(s.avgDur)}\n\n🔗 Kaynaklar:\n${top(s.bySource)}\n\n📍 Konumlar:\n${top(s.byCountry)}`;

  const sent = await sendTelegramMessage(text);
  return NextResponse.json({ ok: true, sent, total: s.total });
}
