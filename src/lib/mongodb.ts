import 'server-only';
import { MongoClient, Db, Collection } from 'mongodb';
import type { Post } from './posts';
import type { SkillsContent } from './skills-content';
import type { PageKey } from './site-content';

// Donanım içeriği tek bir dokümanda tutulur: { _id: 'singleton', tr, en }
export type SkillsDoc = { _id: string } & SkillsContent;

// Sayfa içerikleri: sayfa başına bir doküman { _id: 'home'|…, tr, en }
export type ContentDoc = { _id: PageKey; tr: unknown; en: unknown };

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
