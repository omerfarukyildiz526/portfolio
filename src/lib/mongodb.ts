import 'server-only';
import { MongoClient, Db, Collection } from 'mongodb';
import type { Post } from './posts';
import type { SkillsContent } from './skills-content';
import type { PageKey } from './site-content';
import type { LibraryItem } from './library-db';
import type { LogsProfileContent } from './logs-profile';
import type { LogStory } from './log-stories';

// Donanım içeriği tek bir dokümanda tutulur: { _id: 'singleton', tr, en }
export type SkillsDoc = { _id: string } & SkillsContent;

// Sayfa içerikleri: sayfa başına bir doküman { _id: 'home'|…, tr, en }
export type ContentDoc = { _id: PageKey; tr: unknown; en: unknown };

// Bağlantı bilgisi ortam değişkeninden (env) gelir — kodda hardcoded credential
// TUTULMAZ. MONGODB_URI tanımlı değilse uygulama sessizce başka bir DB'ye
// bağlanmak yerine açıkça hata fırlatır.
const rawUri = process.env.MONGODB_URI;
if (!rawUri) {
  throw new Error('MONGODB_URI env değişkeni tanımlı değil');
}
const uri: string = rawUri;
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

export async function getLibraryCollection(): Promise<Collection<LibraryItem>> {
  const db = await getDb();
  return db.collection<LibraryItem>('library');
}

// Logs profil header'ı: tek doküman { _id: 'singleton', avatarUrl, username, instagramUrl, bio }
export type LogsProfileDoc = { _id: string } & LogsProfileContent;

export async function getLogsProfileCollection(): Promise<Collection<LogsProfileDoc>> {
  const db = await getDb();
  return db.collection<LogsProfileDoc>('logsProfile');
}

export async function getLogStoriesCollection(): Promise<Collection<LogStory>> {
  const db = await getDb();
  return db.collection<LogStory>('logStories');
}
