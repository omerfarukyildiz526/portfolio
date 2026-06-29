import 'server-only';
import { getFinanceCollection, getFinanceHistoryCollection, getFinanceIntradayCollection, type FinSnapshotDoc, type FinIntradayDoc } from './mongodb';

// Kişisel cüzdan: ne kadar dolar/euro/gram altın tuttuğun.
export type Holdings = { usd: number; eur: number; gold: number };

const EMPTY: Holdings = { usd: 0, eur: 0, gold: 0 };

export async function getHoldings(): Promise<Holdings> {
  const col = await getFinanceCollection();
  const doc = await col.findOne({ _id: 'wallet' });
  if (!doc) return { ...EMPTY };
  return { usd: doc.usd ?? 0, eur: doc.eur ?? 0, gold: doc.gold ?? 0 };
}

export async function saveHoldings(h: Holdings): Promise<void> {
  const col = await getFinanceCollection();
  await col.replaceOne({ _id: 'wallet' }, { usd: h.usd, eur: h.eur, gold: h.gold }, { upsert: true });
}

// Bugünün fiyatlarını günlük geçmişe yaz (günde bir kayıt, _id = tarih).
// Özellikle gram altın için ücretsiz geçmiş veri olmadığından zamanla burada birikir.
export async function recordSnapshot(date: string, prices: { usd: number; eur: number; gold: number }): Promise<void> {
  if (!prices.usd && !prices.eur && !prices.gold) return; // boş veriyi kaydetme
  const col = await getFinanceHistoryCollection();
  await col.replaceOne({ _id: date }, { date, ...prices }, { upsert: true });
}

// Son ~400 günün anlık görüntüleri (tarihe göre artan) — 1Y aralığını kapsar.
export async function getSnapshots(): Promise<FinSnapshotDoc[]> {
  const col = await getFinanceHistoryCollection();
  return col.find({}).sort({ _id: 1 }).limit(400).toArray();
}

// ── Saat-içi (intraday) — cron 7/24 toplar; saatlik/günlük grafik buradan ──
let ttlEnsured = false;
async function ensureIntradayTtl(col: Awaited<ReturnType<typeof getFinanceIntradayCollection>>) {
  if (ttlEnsured) return;
  ttlEnsured = true;
  try { await col.createIndex({ at: 1 }, { expireAfterSeconds: 35 * 24 * 60 * 60 }); } catch {}
}

// Bir intraday noktası yaz (dakika başına bir kayıt — sık çağrılsa da dakikada bir nokta).
export async function recordIntraday(prices: { usd: number; eur: number; gold: number }): Promise<void> {
  if (!prices.usd && !prices.eur && !prices.gold) return;
  const col = await getFinanceIntradayCollection();
  await ensureIntradayTtl(col);
  const now = new Date();
  const id = now.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM' → dakika bucket
  await col.replaceOne({ _id: id }, { at: now, ...prices }, { upsert: true });
}

// Belirli bir zamandan (ms) bu yana intraday noktalar (artan).
export async function getIntraday(sinceMs: number): Promise<FinIntradayDoc[]> {
  const col = await getFinanceIntradayCollection();
  return col.find({ at: { $gte: new Date(sinceMs) } }).sort({ at: 1 }).limit(2000).toArray();
}
