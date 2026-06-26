import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { getDb } from './mongodb';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün (saniye)

// Yönetici bilgisi veritabanındaki `settings` koleksiyonunda tek bir dokümanda tutulur:
//   { _id: 'admin', salt, hash, secret }
// Şifre düz değil, scrypt ile hash'lenmiş saklanır. `secret` oturum çerezini imzalar.
interface AdminDoc {
  _id: string; salt: string; hash: string; secret: string;
  // 2 adımlı doğrulama (e-posta kodu) için geçici alanlar:
  codeHash?: string; codeExpires?: number; codeAttempts?: number;
}

const CODE_TTL = 10 * 60 * 1000;   // kod 10 dakika geçerli
const CODE_MAX_ATTEMPTS = 5;       // 5 yanlış denemeden sonra kod iptal

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

/** Mevcut yöneticinin şifresini değiştirir. Oturum gizli anahtarı (secret)
 *  korunur, böylece aktif oturum geçersiz olmaz. */
export async function changePassword(next: string): Promise<boolean> {
  const col = await settings();
  const doc = await col.findOne({ _id: 'admin' });
  if (!doc) return false;
  const salt = randomBytes(16).toString('base64url');
  const hash = hashWith(next, salt);
  const res = await col.updateOne({ _id: 'admin' }, { $set: { salt, hash } });
  return res.matchedCount > 0;
}

/** Verilen şifre yönetici şifresiyle eşleşiyor mu? */
export async function checkPassword(password: string): Promise<boolean> {
  const doc = await getAdmin();
  if (!doc) return false;
  const candidate = Buffer.from(hashWith(password, doc.salt));
  const expected = Buffer.from(doc.hash);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// ── 2 adımlı doğrulama: e-posta giriş kodu ──

/** 6 haneli giriş kodu üretir, hash'leyip saklar ve düz halini döndürür
 *  (e-posta ile gönderilmek üzere). Yönetici yoksa null. */
export async function createLoginCode(): Promise<string | null> {
  const doc = await getAdmin();
  if (!doc) return null;
  const col = await settings();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = hashWith(code, doc.salt);
  await col.updateOne({ _id: 'admin' }, { $set: { codeHash, codeExpires: Date.now() + CODE_TTL, codeAttempts: 0 } });
  return code;
}

/** Girilen kodu doğrular; doğruysa kodu temizler ve true döner. */
export async function verifyLoginCode(code: string): Promise<boolean> {
  const col = await settings();
  const doc = await col.findOne({ _id: 'admin' });
  if (!doc || !doc.codeHash || !doc.codeExpires) return false;

  const clear = () => col.updateOne({ _id: 'admin' }, { $unset: { codeHash: '', codeExpires: '', codeAttempts: '' } });

  if (Date.now() > doc.codeExpires || (doc.codeAttempts ?? 0) >= CODE_MAX_ATTEMPTS) {
    await clear();
    return false;
  }

  const candidate = Buffer.from(hashWith(code, doc.salt));
  const expected = Buffer.from(doc.codeHash);
  const ok = candidate.length === expected.length && timingSafeEqual(candidate, expected);

  if (ok) { await clear(); return true; }
  await col.updateOne({ _id: 'admin' }, { $inc: { codeAttempts: 1 } });
  return false;
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
