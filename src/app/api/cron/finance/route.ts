import { NextRequest, NextResponse } from 'next/server';
import { fetchRates } from '@/lib/finance-rates';
import { recordSnapshot, recordIntraday } from '@/lib/finance-db';

export const dynamic = 'force-dynamic';

// Vercel cron (veya harici cron-job.org vb.) bu uç noktayı düzenli çağırır;
// kuru çekip günlük + saat-içi geçmişe yazar. Böylece saatlik/günlük grafikler
// panel kapalıyken bile dolar.
//
// Güvenlik: CRON_SECRET tanımlıysa "Authorization: Bearer <secret>" başlığı ya da
// "?secret=<secret>" gerekir. Tanımlı değilse açıktır (yalnızca zararsız veri toplama).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    const qs = req.nextUrl.searchParams.get('secret');
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
    }
  }

  const rates = await fetchRates(0); // cron'da önbelleksiz, en taze değer
  if (!rates) {
    return NextResponse.json({ ok: false, error: 'Kur alınamadı.' }, { status: 502 });
  }

  const prices = { usd: rates.usd.price, eur: rates.eur.price, gold: rates.gold.price };
  const today = new Date().toISOString().slice(0, 10);
  await Promise.all([
    recordSnapshot(today, prices),
    recordIntraday(prices),
  ]);

  return NextResponse.json({ ok: true, at: new Date().toISOString(), prices });
}
