import 'server-only';

// Ücretsiz, anahtar gerektirmeyen Türk finans API'si (döviz + altın, TL bazlı).
const TRUNCGIL = 'https://finans.truncgil.com/v4/today.json';

export type Asset = { price: number; change: number };
export type Rates = { usd: Asset; eur: Asset; gold: Asset; updated: string };

// Truncgil yanıtından satış fiyatı + günlük değişimi çek.
export async function fetchRates(revalidate = 15): Promise<Rates | null> {
  try {
    const res = await fetch(TRUNCGIL, { next: { revalidate } });
    if (!res.ok) return null;
    const d = (await res.json()) as Record<string, unknown>;
    const pick = (o: unknown): Asset => {
      const r = (o ?? {}) as Record<string, unknown>;
      return { price: Number(r.Selling) || 0, change: Number(r.Change) || 0 };
    };
    return {
      usd: pick(d.USD),
      eur: pick(d.EUR),
      gold: pick(d.GRA), // GRA = gram altın
      updated: String(d.Update_Date ?? ''),
    };
  } catch {
    return null;
  }
}
