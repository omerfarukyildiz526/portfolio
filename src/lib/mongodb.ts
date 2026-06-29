import 'server-only';
import { MongoClient, Db, Collection } from 'mongodb';
import type { Post } from './posts';
import type { SkillsContent } from './skills-content';
import type { PageKey } from './site-content';

// Donanım içeriği tek bir dokümanda tutulur: { _id: 'singleton', tr, en }
export type SkillsDoc = { _id: string } & SkillsContent;

// Sayfa içerikleri: sayfa başına bir doküman { _id: 'home'|…, tr, en }
export type ContentDoc = { _id: PageKey; tr: unknown; en: unknown };

// Kişisel cüzdan: tek doküman { _id: 'wallet', usd, eur, gold }
export type FinanceDoc = { _id: string; usd: number; eur: number; gold: number };

// Günlük fiyat anlık görüntüsü: günde bir doküman { _id: 'YYYY-MM-DD', ... }
export type FinSnapshotDoc = { _id: string; date: string; usd: number; eur: number; gold: number };

// Saat-içi (intraday) görüntü: dakikada bir doküman { _id: 'YYYY-MM-DDTHH:MM', at, ... }
// `at` üzerinde TTL ile ~35 gün sonra otomatik silinir.
export type FinIntradayDoc = { _id: string; at: Date; usd: number; eur: number; gold: number };

// Bağlantı bilgisi doğrudan kodda — hiçbir ortam değişkeni (env) gerekmez.
// Böylece Vercel'de ayar yapmadan, deploy ettiğin anda çalışır.
// ⚠️ GÜVENLİK: Bu dosya (şifre dahil) git deposuna gider. Depo PRIVATE olmalı.
//    İstersen yine de MONGODB_URI env'i tanımlayarak buradaki değeri geçersiz kılabilirsin.
const DEFAULT_URI = 'mongodb+srv://1abcdl:956T23kkFs6mIRKv@cluster0.xzoueys.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const uri = process.env.MONGODB_URI || DEFAULT_URI;
const dbName = process.env.MONGODB_DB || 'portfolio';

type Cache = typeof globalThis & { _mongo?: Promise<MongoClient> };

// Bağlantıyı tembel (lazy) kuruyoruz; serverless'ta (Vercel) tekrar tekrar
// bağlanmamak için global cache kullanıyoruz.
function getClient(): Promise<MongoClient> {
  const g = global as Cache;
  if (!g._mongo) {
    g._mongo = new MongoClient(uri).connect();
  }
  return g._mongo;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(dbName);
}

export async function getPostsCollection(): Promise<Collection<Post>> {
  const db = await getDb();
  return db.collection<Post>('posts');
}

export async function getSkillsCollection(): Promise<Collection<SkillsDoc>> {
  const db = await getDb();
  return db.collection<SkillsDoc>('skills');
}

export async function getContentCollection(): Promise<Collection<ContentDoc>> {
  const db = await getDb();
  return db.collection<ContentDoc>('content');
}

export async function getFinanceCollection(): Promise<Collection<FinanceDoc>> {
  const db = await getDb();
  return db.collection<FinanceDoc>('finance');
}

export async function getFinanceHistoryCollection(): Promise<Collection<FinSnapshotDoc>> {
  const db = await getDb();
  return db.collection<FinSnapshotDoc>('finance_history');
}

export async function getFinanceIntradayCollection(): Promise<Collection<FinIntradayDoc>> {
  const db = await getDb();
  return db.collection<FinIntradayDoc>('finance_intraday');
}
