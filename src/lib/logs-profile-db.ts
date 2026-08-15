import 'server-only';
import { getLogsProfileCollection } from './mongodb';
import { SEED_LOGS_PROFILE, type LogsProfileContent } from './logs-profile';

const DOC_ID = 'singleton';

function strip(doc: LogsProfileContent): LogsProfileContent {
  return {
    avatarUrl: doc.avatarUrl,
    username: doc.username,
    displayName: doc.displayName ?? SEED_LOGS_PROFILE.displayName,
    instagramUrl: doc.instagramUrl,
    followerCount: doc.followerCount ?? 0,
    followingCount: doc.followingCount ?? 0,
    bio: doc.bio,
  };
}

// Logs profil bilgisini getirir; koleksiyon boşsa başlangıç içeriğini bir
// kereye mahsus oluşturur. Hata olursa seed'e düşer (header asla boş kalmaz).
export async function getLogsProfile(): Promise<LogsProfileContent> {
  const col = await getLogsProfileCollection();
  const existing = await col.findOne({ _id: DOC_ID });
  if (existing) return strip(existing);
  try {
    await col.insertOne({ _id: DOC_ID, ...SEED_LOGS_PROFILE });
  } catch {
    // Eşzamanlı isteklerde mükerrer ekleme olabilir; yok say.
  }
  return SEED_LOGS_PROFILE;
}

export async function updateLogsProfile(content: LogsProfileContent): Promise<void> {
  const col = await getLogsProfileCollection();
  await col.replaceOne({ _id: DOC_ID }, content, { upsert: true });
}
