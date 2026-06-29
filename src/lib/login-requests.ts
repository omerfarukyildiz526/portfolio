import 'server-only';
import { randomBytes } from 'crypto';
import { getDb } from './mongodb';

// Telefon onaylı giriş istekleri (hem Web Push hem Telegram bunu kullanır).
type ReqStatus = 'pending' | 'approved' | 'denied';
type ReqDoc = { _id: string; approveToken: string; status: ReqStatus; ua?: string; createdAt: Date; expiresAt: number; consumed?: boolean };

const REQ_TTL_MS = 5 * 60 * 1000; // istek 5 dk geçerli
let ttlEnsured = false;

async function reqCol() { return (await getDb()).collection<ReqDoc>('login_requests'); }

// Yeni bir bekleyen istek oluştur (id = masaüstü yoklaması, approveToken = capability).
export async function createPendingRequest(ua: string): Promise<{ id: string; approveToken: string }> {
  const id = randomBytes(16).toString('hex');
  const approveToken = randomBytes(24).toString('hex');
  const col = await reqCol();
  if (!ttlEnsured) {
    ttlEnsured = true;
    try { await col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 }); } catch {}
  }
  await col.insertOne({ _id: id, approveToken, status: 'pending', ua, createdAt: new Date(), expiresAt: Date.now() + REQ_TTL_MS });
  return { id, approveToken };
}

export async function getLoginStatus(id: string): Promise<ReqStatus | 'expired' | 'unknown'> {
  const r = await (await reqCol()).findOne({ _id: id });
  if (!r) return 'unknown';
  if (r.status === 'pending' && Date.now() > r.expiresAt) return 'expired';
  return r.status;
}

// Capability (approveToken) ile çöz — Web Push onayı için.
export async function resolveLoginRequest(id: string, approveToken: string, approve: boolean): Promise<boolean> {
  const col = await reqCol();
  const r = await col.findOne({ _id: id });
  if (!r || r.approveToken !== approveToken || r.status !== 'pending') return false;
  if (Date.now() > r.expiresAt) { await col.updateOne({ _id: id }, { $set: { status: 'denied' } }); return false; }
  await col.updateOne({ _id: id }, { $set: { status: approve ? 'approved' : 'denied' } });
  return true;
}

// Sadece id ile çöz — yetki çağıran tarafça doğrulanır (ör. Telegram webhook:
// gizli başlık + yapılandırılmış chat id). callback_data 64 bayt sınırı için token taşınmaz.
export async function resolveRequestById(id: string, approve: boolean): Promise<boolean> {
  const col = await reqCol();
  const r = await col.findOne({ _id: id });
  if (!r || r.status !== 'pending') return false;
  if (Date.now() > r.expiresAt) { await col.updateOne({ _id: id }, { $set: { status: 'denied' } }); return false; }
  await col.updateOne({ _id: id }, { $set: { status: approve ? 'approved' : 'denied' } });
  return true;
}

// Onaylanmış isteği tek kullanımlık tüket (oturum açmadan hemen önce).
export async function consumeApproved(id: string): Promise<boolean> {
  const col = await reqCol();
  const r = await col.findOne({ _id: id });
  if (!r || r.status !== 'approved' || r.consumed) return false;
  if (Date.now() > r.expiresAt + 60 * 1000) return false;
  const res = await col.updateOne({ _id: id, consumed: { $ne: true } }, { $set: { consumed: true } });
  return res.modifiedCount === 1;
}
