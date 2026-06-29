import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getHoldings, saveHoldings, recordSnapshot, type Holdings } from '@/lib/finance-db';
import { fetchRates } from '@/lib/finance-rates';

export const dynamic = 'force-dynamic';

// Canlı kurlar + kayıtlı cüzdan.
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const [rates, holdings] = await Promise.all([fetchRates(), getHoldings()]);
    // Bugünün fiyatlarını geçmişe yaz (gram altın grafiği zamanla burada birikir).
    if (rates) {
      const today = new Date().toISOString().slice(0, 10);
      recordSnapshot(today, { usd: rates.usd.price, eur: rates.eur.price, gold: rates.gold.price })
        .catch(err => console.error('recordSnapshot', err));
    }
    return NextResponse.json({ rates, holdings });
  } catch (err) {
    console.error('GET /api/admin/finance', err);
    return NextResponse.json({ error: 'Veriler getirilemedi.' }, { status: 500 });
  }
}

// Cüzdanı kaydet: body = { usd, eur, gold }
export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const holdings: Holdings = { usd: num(b.usd), eur: num(b.eur), gold: num(b.gold) };

  try {
    await saveHoldings(holdings);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/finance', err);
    return NextResponse.json({ error: 'Kaydedilemedi.' }, { status: 500 });
  }
}
