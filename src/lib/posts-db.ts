import 'server-only';
import { getPostsCollection } from './mongodb';
import { SEED_POSTS, type Post } from './posts';

// Mongo'nun _id alanını dışarı sızdırmadan temiz Post objesi döndürmek için projeksiyon.
const NO_ID = { projection: { _id: 0 } } as const;

let indexEnsured = false;

async function ensureSetup() {
  const col = await getPostsCollection();
  if (!indexEnsured) {
    await col.createIndex({ slug: 1 }, { unique: true });
    indexEnsured = true;
  }
  // Koleksiyon boşsa mevcut içeriği bir kereye mahsus aktar.
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    try {
      await col.insertMany(SEED_POSTS, { ordered: false });
    } catch {
      // Eşzamanlı isteklerde mükerrer ekleme hatası olabilir; yok say.
    }
  }
  return col;
}

// Public: yalnızca yayında olanlar (published tanımsız da yayında sayılır).
export async function getAllPosts(): Promise<Post[]> {
  const col = await ensureSetup();
  // En yeni yazı en üstte (tarih YYYY-MM-DD olduğu için string sıralaması doğru çalışır).
  return col.find({ published: { $ne: false } }, NO_ID).sort({ date: -1 }).toArray() as Promise<Post[]>;
}

// Panel: taslaklar dahil hepsi.
export async function getAllPostsAdmin(): Promise<Post[]> {
  const col = await ensureSetup();
  return col.find({}, NO_ID).sort({ date: -1 }).toArray() as Promise<Post[]>;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const col = await ensureSetup();
  // Public erişimde taslaklar görünmesin.
  return col.findOne({ slug, published: { $ne: false } }, NO_ID) as Promise<Post | null>;
}

export async function createPost(post: Post): Promise<void> {
  const col = await getPostsCollection();
  await col.insertOne(post);
}

export async function updatePost(slug: string, post: Post): Promise<boolean> {
  const col = await getPostsCollection();
  const res = await col.replaceOne({ slug }, post);
  return res.matchedCount > 0;
}

export async function deletePost(slug: string): Promise<boolean> {
  const col = await getPostsCollection();
  const res = await col.deleteOne({ slug });
  return res.deletedCount > 0;
}

export async function slugExists(slug: string): Promise<boolean> {
  const col = await getPostsCollection();
  return (await col.countDocuments({ slug }, { limit: 1 })) > 0;
}
