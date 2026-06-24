import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün (saniye)

function secret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error('ADMIN_SECRET ortam değişkeni tanımlı değil.');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

/** İmzalı oturum jetonu üretir: "<expiry>.<signature>" */
export function createSessionToken(): string {
  const expiry = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expiry}.${sign(expiry)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiry, sig] = token.split('.');
  if (!expiry || !sig) return false;
  if (Number(expiry) < Date.now()) return false; // süresi dolmuş

  const expected = sign(expiry);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Verilen şifre, ortam değişkenindeki yönetici şifresiyle eşleşiyor mu? */
export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD ortam değişkeni tanımlı değil.');
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** İstekteki çerez geçerli bir oturum içeriyor mu? */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}
