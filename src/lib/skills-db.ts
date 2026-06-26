import 'server-only';
import { getSkillsCollection } from './mongodb';
import { SEED_SKILLS, type SkillsContent } from './skills-content';

const DOC_ID = 'singleton';

// İçeriği temiz (tr/en) bir objeye indirger — Mongo'nun _id alanını sızdırmaz.
function strip(doc: { tr: SkillsContent['tr']; en: SkillsContent['en'] }): SkillsContent {
  return { tr: doc.tr, en: doc.en };
}

// Donanım içeriğini getirir; koleksiyon boşsa başlangıç içeriğini bir kereye
// mahsus oluşturur. Hata olursa seed içeriğe düşer (sayfa asla boş kalmaz).
export async function getSkillsContent(): Promise<SkillsContent> {
  const col = await getSkillsCollection();
  const existing = await col.findOne({ _id: DOC_ID });
  if (existing) return strip(existing);
  try {
    await col.insertOne({ _id: DOC_ID, ...SEED_SKILLS });
  } catch {
    // Eşzamanlı isteklerde mükerrer ekleme olabilir; yok say.
  }
  return SEED_SKILLS;
}

export async function updateSkillsContent(content: SkillsContent): Promise<void> {
  const col = await getSkillsCollection();
  await col.replaceOne({ _id: DOC_ID }, content, { upsert: true });
}
