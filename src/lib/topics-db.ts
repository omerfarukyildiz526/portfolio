import 'server-only';
import { getTopicsCollection } from './mongodb';
import type { Topic } from './topics';

const NO_ID = { projection: { _id: 0 } } as const;

let indexEnsured = false;

async function ensureSetup() {
  const col = await getTopicsCollection();
  if (!indexEnsured) {
    await col.createIndex({ slug: 1 }, { unique: true });
    indexEnsured = true;
  }
  return col;
}

// En yeni konu en üstte.
export async function getAllTopics(): Promise<Topic[]> {
  const col = await ensureSetup();
  return col.find({}, NO_ID).sort({ createdAt: -1 }).toArray() as Promise<Topic[]>;
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const col = await ensureSetup();
  return col.findOne({ slug }, NO_ID) as Promise<Topic | null>;
}

export async function createTopic(topic: Topic): Promise<void> {
  const col = await ensureSetup();
  await col.insertOne(topic);
}

export async function updateTopic(slug: string, topic: Topic): Promise<boolean> {
  const col = await ensureSetup();
  const res = await col.replaceOne({ slug }, topic);
  return res.matchedCount > 0;
}

export async function deleteTopic(slug: string): Promise<boolean> {
  const col = await ensureSetup();
  const res = await col.deleteOne({ slug });
  return res.deletedCount > 0;
}

export async function topicSlugExists(slug: string): Promise<boolean> {
  const col = await ensureSetup();
  return (await col.countDocuments({ slug }, { limit: 1 })) > 0;
}
