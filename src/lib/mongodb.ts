import 'server-only';
import { MongoClient, Db, Collection } from 'mongodb';
import type { Post } from './posts';

const dbName = process.env.MONGODB_DB || 'portfolio';

type Cache = typeof globalThis & { _mongo?: Promise<MongoClient> };

// Bağlantıyı tembel (lazy) kuruyoruz: modül yüklenirken değil, ilk sorguda.
// Böylece env değişkeni olmadan da build (next build) çökmez.
// Serverless ortamda (Vercel) tekrar tekrar bağlanmamak için global cache.
function getClient(): Promise<MongoClient> {
  const g = global as Cache;
  if (!g._mongo) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI ortam değişkeni tanımlı değil (.env.local dosyasına ekle).');
    }
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
