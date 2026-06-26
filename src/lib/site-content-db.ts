import 'server-only';
import { getContentCollection } from './mongodb';
import { SEED_CONTENT, type SiteContent, type PageKey } from './site-content';

const PAGES: PageKey[] = ['home', 'experience', 'contact', 'projects'];

// Tüm sayfa içeriklerini getirir; eksik sayfaları seed'ten oluşturur.
// Hata olursa seed içeriğe düşer (sayfalar asla boş kalmaz).
export async function getSiteContent(): Promise<SiteContent> {
  const col = await getContentCollection();
  const docs = await col.find({}).toArray();
  const found = new Map(docs.map(d => [d._id, d]));

  const out = {} as SiteContent;
  const toSeed: { _id: PageKey; tr: unknown; en: unknown }[] = [];

  for (const p of PAGES) {
    const doc = found.get(p);
    if (doc) {
      // Kayıtlı doküman eski şemadaysa eksik üst-düzey alanları seed'den tamamla.
      const seed = SEED_CONTENT[p] as unknown as Record<'tr' | 'en', Record<string, unknown>>;
      (out as Record<PageKey, unknown>)[p] = {
        tr: { ...seed.tr, ...(doc.tr as Record<string, unknown>) },
        en: { ...seed.en, ...(doc.en as Record<string, unknown>) },
      };
    } else {
      (out as Record<PageKey, unknown>)[p] = SEED_CONTENT[p];
      toSeed.push({ _id: p, tr: SEED_CONTENT[p].tr, en: SEED_CONTENT[p].en });
    }
  }

  if (toSeed.length) {
    try { await col.insertMany(toSeed, { ordered: false }); } catch {}
  }
  return out;
}

export async function updatePageContent(page: PageKey, langs: { tr: unknown; en: unknown }): Promise<void> {
  const col = await getContentCollection();
  await col.replaceOne({ _id: page }, { tr: langs.tr, en: langs.en }, { upsert: true });
}
