import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { getDb } from './mongodb';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün (saniye)

// Yönetici bilgisi veritabanındaki `settings` koleksiyonunda tek bir dokümanda tutulur:
//   { _id: 'admin', salt, hash, secret }
// Şifre düz değil, scrypt ile hash'lenmiş saklanır. `secret` oturum çerezini imzalar.
interface AdminDoc { _id: string; salt: string; hash: string; secret: string; }

async function settings() {
  const db = await getDb();
  return db.collection<AdminDoc>('settings');
}

let cachedSecret: string | null = null;

function hashWith(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('base64url');
}

/** Yönetici dokümanını getirir. Yoksa ve env ADMIN_PASSWORD tanımlıysa bir kereye mahsus DB'ye taşır. */
async function getAdmin(): Promise<AdminDoc | null> {
  const col = await settings();
  let doc = await col.findOne({ _id: 'admin' });
  if (!doc && process.env.ADMIN_PASSWORD) {
    doc = await setupAdmin(process.env.ADMIN_PASSWORD);
  }
  return doc;
}

/** Kurulum gerekli mi? (Hiç yönetici tanımlı değilse true.) */
export async function needsSetup(): Promise<boolean> {
  if (process.env.ADMIN_PASSWORD) return false; // env bootstrap mevcut
  const col = await settings();
  const doc = await col.findOne({ _id: 'admin' }, { projection: { _id: 1 } });
  return !doc;
}

/** İlk kurulum / şifre belirleme. */
export async function setupAdmin(password: string): Promise<AdminDoc> {
  const col = await settings();
  const salt = randomBytes(16).toString('base64url');
  const hash = hashWith(password, salt);
  const secret = randomBytes(48).toString('base64url');
  const doc: AdminDoc = { _id: 'admin', salt, hash, secret };
  await col.replaceOne({ _id: 'admin' }, doc, { upsert: true });
  cachedSecret = secret;
  return doc;
}

/** Verilen şifre yönetici şifresiyle eşleşiyor mu? */
export async function checkPassword(password: string): Promise<boolean> {
  const doc = await getAdmin();
  if (!doc) return false;
  const candidate = Buffer.from(hashWith(password, doc.salt));
  const expected = Buffer.from(doc.hash);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function getSecret(): Promise<string | null> {
  if (cachedSecret) return cachedSecret;
  const doc = await getAdmin();
  cachedSecret = doc?.secret ?? null;
  return cachedSecret;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export async function createSessionToken(): Promise<string> {
  const secret = await getSecret();
  if (!secret) throw new Error('Yönetici gizli anahtarı yok.');
  const expiry = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expiry}.${sign(expiry, secret)}`;
}

/** İstekteki çerez geçerli bir oturum içeriyor mu? (Hata olursa güvenli tarafta: false.) */
export async function isAuthed(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    const [expiry, sig] = token.split('.');
    if (!expiry || !sig) return false;
    if (Number(expiry) < Date.now()) return false;
    const secret = await getSecret();
    if (!secret) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(sign(expiry, secret));
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
