import 'server-only';
import webpush, { type PushSubscription } from 'web-push';
import { randomBytes } from 'crypto';
import { getDb } from './mongodb';

// Telefon onaylı giriş (Web Push). VAPID anahtarları DB'de saklanır → env gerekmez.
type SubDoc = { _id: string; sub: PushSubscription; createdAt: Date };
type ReqStatus = 'pending' | 'approved' | 'denied';
type ReqDoc = { _id: string; approveToken: string; status: ReqStatus; ua?: string; createdAt: Date; expiresAt: number; consumed?: boolean };
type VapidDoc = { _id: string; publicKey: string; privateKey: string };

const REQ_TTL_MS = 5 * 60 * 1000; // onay isteği 5 dk geçerli

async function subsCol() { return (await getDb()).collection<SubDoc>('push_subscriptions'); }
async function reqCol() { return (await getDb()).collection<ReqDoc>('login_requests'); }

let vapidPublic: string | null = null;
let reqTtlEnsured = false;

// VAPID anahtarlarını hazırla (yoksa üret + DB'ye yaz) ve web-push'a tanıt.
async function ensureVapid(): Promise<string> {
  if (vapidPublic) return vapidPublic;
  const col = (await getDb()).collection<VapidDoc>('settings');
  let doc = await col.findOne({ _id: 'vapid' });
  if (!doc) {
    const keys = webpush.generateVAPIDKeys();
    doc = { _id: 'vapid', publicKey: keys.publicKey, privateKey: keys.privateKey };
    try { await col.insertOne(doc); } catch { doc = await col.findOne({ _id: 'vapid' }); }
  }
  if (!doc) throw new Error('VAPID hazırlanamadı.');
  const subject = process.env.SITE_URL || 'mailto:admin@omerfarukyildiz.tech';
  webpush.setVapidDetails(subject.startsWith('http') ? subject : `mailto:${subject.replace(/^mailto:/, '')}`, doc.publicKey, doc.privateKey);
  vapidPublic = doc.publicKey;
  return vapidPublic;
}

export async function getVapidPublicKey(): Promise<string> {
  return ensureVapid();
}

export async function saveSubscription(sub: PushSubscription): Promise<void> {
  await ensureVapid();
  const col = await subsCol();
  await col.replaceOne({ _id: sub.endpoint }, { sub, createdAt: new Date() }, { upsert: true });
}

export async function countSubscriptions(): Promise<number> {
  return (await subsCol()).countDocuments();
}

export async function clearSubscriptions(): Promise<void> {
  await (await subsCol()).deleteMany({});
}

// Yeni bir giriş onay isteği oluştur + kayıtlı tüm cihazlara push gönder.
// Kayıtlı cihaz yoksa null döner.
export async function createLoginRequest(ua: string): Promise<{ id: string } | null> {
  await ensureVapid();
  const subs = await (await subsCol()).find({}).toArray();
  if (subs.length === 0) return null;

  const id = randomBytes(16).toString('hex');
  const approveToken = randomBytes(24).toString('hex');
  const col = await reqCol();
  if (!reqTtlEnsured) {
    reqTtlEnsured = true;
    try { await col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 }); } catch {}
  }
  await col.insertOne({ _id: id, approveToken, status: 'pending', ua, createdAt: new Date(), expiresAt: Date.now() + REQ_TTL_MS });

  const payload = JSON.stringify({ id, approveToken, ua, time: new Date().toLocaleString('tr-TR') });
  const sc = await subsCol();
  await Promise.all(subs.map(s =>
    webpush.sendNotification(s.sub, payload).catch(async (err: unknown) => {
      const code = (err as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) await sc.deleteOne({ _id: s._id }); // abonelik ölmüş
    }),
  ));
  return { id };
}

export async function getLoginStatus(id: string): Promise<ReqStatus | 'expired' | 'unknown'> {
  const r = await (await reqCol()).findOne({ _id: id });
  if (!r) return 'unknown';
  if (r.status === 'pending' && Date.now() > r.expiresAt) return 'expired';
  return r.status;
}

// Telefondan gelen onay/ret. approveToken yalnızca push ile telefona gittiği için
// onay yetkisi bu token'a sahip olmaktır (capability).
export async function resolveLoginRequest(id: string, approveToken: string, approve: boolean): Promise<boolean> {
  const col = await reqCol();
  const r = await col.findOne({ _id: id });
  if (!r || r.approveToken !== approveToken || r.status !== 'pending') return false;
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
