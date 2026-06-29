import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getSnapshots, getIntraday } from '@/lib/finance-db';

export const dynamic = 'force-dynamic';

export type Point = { d: string; v: number; t?: number };

type FinKey = 'usd' | 'eur' | 'gold';

// Intraday noktalarını saat etiketiyle (İstanbul) ve epoch ile diziye çevir.
const istHHMM = (at: Date) =>
  new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' }).format(at);

// USD/EUR → TRY günlük geçmişi (ECB verisi, anahtar gerektirmez, hafta içi).
async function frankfurter(base: 'USD' | 'EUR'): Promise<Point[]> {
  const end = new Date();
  const start = new Date(end.getTime() - 400 * 864e5); // ~13 ay: 1Y aralığı için yeterli
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url = `https://api.frankfurter.dev/v1/${fmt(start)}..${fmt(end)}?base=${base}&symbols=TRY`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const d = (await res.json()) as { rates?: Record<string, { TRY?: number }> };
    const rates = d.rates ?? {};
    return Object.keys(rates)
      .sort()
      .map(date => ({ d: date, v: Number(rates[date]?.TRY) || 0 }))
      .filter(p => p.v > 0);
  } catch {
    return [];
  }
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const since = Date.now() - 25 * 3600e3; // son ~25 saat (günlük + saatlik için)
    const [usd, eur, snaps, intra] = await Promise.all([
      frankfurter('USD'), frankfurter('EUR'), getSnapshots(), getIntraday(since),
    ]);
    // Gram altının ücretsiz geçmişi yok; günlük kaydettiğimiz anlık görüntülerden üret.
    const gold: Point[] = snaps.map(s => ({ d: s.date, v: s.gold })).filter(p => p.v > 0);
    // Saat-içi seriler (cron 7/24 toplar): saatlik/günlük grafik buradan.
    const series = (key: FinKey): Point[] =>
      intra.map(p => ({ d: istHHMM(new Date(p.at)), v: p[key], t: new Date(p.at).getTime() })).filter(x => x.v > 0);
    const intraday = { usd: series('usd'), eur: series('eur'), gold: series('gold') };
    return NextResponse.json({ usd, eur, gold, intraday });
  } catch (err) {
    console.error('GET /api/admin/finance/history', err);
    return NextResponse.json({ error: 'Geçmiş veriler getirilemedi.' }, { status: 500 });
  }
}
