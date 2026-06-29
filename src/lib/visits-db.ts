import 'server-only';
import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';

// Ziyaret kaydı. `t` üzerinde TTL ile ~60 gün sonra otomatik silinir.
export type VisitDoc = {
  t: Date;
  path: string;
  source: string;   // Doğrudan | Arama | Instagram | LinkedIn | ...
  device: string;   // 'Android · Chrome'
  country?: string;
  city?: string;
  ref?: string;
  dur?: number;     // kalış süresi (saniye)
};

const TTL_DAYS = 60;
let ttlEnsured = false;

async function col() {
  const c = (await getDb()).collection<VisitDoc>('visits');
  if (!ttlEnsured) {
    ttlEnsured = true;
    try { await c.createIndex({ t: 1 }, { expireAfterSeconds: TTL_DAYS * 86400 }); } catch {}
  }
  return c;
}

// Referrer'dan okunaklı kaynak etiketi (arama/sosyal/doğrudan/link).
export function sourceFromRef(ref: string): string {
  if (!ref) return 'Doğrudan';
  let host = '';
  try { host = new URL(ref).hostname.replace(/^www\./, ''); } catch { return 'Doğrudan'; }
  if (/(^|\.)(google|bing|yandex|duckduckgo|yahoo|ecosia)\./.test(host)) return 'Arama';
  if (host.includes('instagram')) return 'Instagram';
  if (host.includes('linkedin') || host === 'lnkd.in') return 'LinkedIn';
  if (host.includes('twitter') || host === 'x.com' || host === 't.co') return 'X / Twitter';
  if (host.includes('facebook') || host === 'fb.com' || host.includes('fb.me')) return 'Facebook';
  if (host.includes('youtube') || host === 'youtu.be') return 'YouTube';
  if (host.includes('t.me') || host.includes('telegram')) return 'Telegram';
  if (host.includes('github')) return 'GitHub';
  if (host.includes('reddit')) return 'Reddit';
  return `Link: ${host}`;
}

// User-Agent'tan cihaz etiketi.
export function deviceFromUa(ua: string): string {
  const u = ua || '';
  let os = 'Cihaz';
  if (/Android/i.test(u)) os = 'Android';
  else if (/iPhone/i.test(u)) os = 'iPhone';
  else if (/iPad/i.test(u)) os = 'iPad';
  else if (/Windows/i.test(u)) os = 'Windows';
  else if (/Macintosh|Mac OS/i.test(u)) os = 'Mac';
  else if (/Linux/i.test(u)) os = 'Linux';
  let br = '';
  if (/Edg\//i.test(u)) br = 'Edge';
  else if (/SamsungBrowser/i.test(u)) br = 'Samsung Internet';
  else if (/Firefox\//i.test(u)) br = 'Firefox';
  else if (/CriOS|Chrome\//i.test(u)) br = 'Chrome';
  else if (/Safari\//i.test(u)) br = 'Safari';
  return br ? `${os} · ${br}` : os;
}

export async function recordVisit(v: { path: string; ref: string; ua: string; country?: string; city?: string }): Promise<string> {
  const c = await col();
  const res = await c.insertOne({
    t: new Date(),
    path: (v.path || '/').slice(0, 120),
    source: sourceFromRef(v.ref || ''),
    device: deviceFromUa(v.ua || ''),
    country: v.country || undefined,
    city: v.city || undefined,
    ref: (v.ref || '').slice(0, 200) || undefined,
  });
  return String(res.insertedId);
}

export async function setDwell(id: string, dur: number): Promise<void> {
  if (!id || !(dur >= 0)) return;
  let _id: ObjectId;
  try { _id = new ObjectId(id); } catch { return; }
  await (await col()).updateOne({ _id }, { $set: { dur: Math.min(Math.round(dur), 3600) } });
}

export type VisitRow = VisitDoc & { id: string };

export async function getRecentVisits(limit = 60): Promise<VisitRow[]> {
  const docs = await (await col()).find({}).sort({ t: -1 }).limit(limit).toArray();
  return docs.map(d => ({ ...d, id: String((d as { _id: ObjectId })._id) }));
}

export type VisitSummary = {
  total: number;
  bySource: Record<string, number>;
  byCountry: Record<string, number>;
  avgDur: number;
};

export async function getSummary(sinceMs: number): Promise<VisitSummary> {
  const visits = await (await col()).find({ t: { $gte: new Date(sinceMs) } }).toArray();
  const bySource: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  let durSum = 0, durCount = 0;
  for (const v of visits) {
    bySource[v.source] = (bySource[v.source] || 0) + 1;
    const c = v.country || '—';
    byCountry[c] = (byCountry[c] || 0) + 1;
    if (typeof v.dur === 'number') { durSum += v.dur; durCount++; }
  }
  return { total: visits.length, bySource, byCountry, avgDur: durCount ? Math.round(durSum / durCount) : 0 };
}
