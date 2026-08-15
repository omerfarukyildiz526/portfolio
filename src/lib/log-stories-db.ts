import 'server-only';
import { ObjectId } from 'mongodb';
import { getLogStoriesCollection } from './mongodb';
import { type LogStory, type LogStoryDTO, toStoryDTO } from './log-stories';

let indexEnsured = false;

async function ensureSetup() {
  const col = await getLogStoriesCollection();
  if (!indexEnsured) {
    await col.createIndex({ createdAt: -1 });
    indexEnsured = true;
  }
  return col;
}

export type CreateStoryInput = {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  expiresAt: Date | null;
};

export async function createStory(data: CreateStoryInput): Promise<LogStoryDTO> {
  const col = await ensureSetup();
  const doc: LogStory = {
    _id: new ObjectId(),
    mediaUrl: data.mediaUrl,
    mediaType: data.mediaType,
    caption: data.caption,
    expiresAt: data.expiresAt,
    createdAt: new Date(),
  };
  await col.insertOne(doc);
  return toStoryDTO(doc);
}

// Public: yalnızca hâlâ aktif olan hikâyeler (expiresAt null VEYA şu andan ileri).
export async function getActiveStories(): Promise<LogStoryDTO[]> {
  const col = await ensureSetup();
  const now = new Date();
  const docs = await col
    .find({ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] })
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map(d => toStoryDTO(d));
}

// Admin: süresi geçmişler dahil tümü, "expired" etiketiyle.
export async function getAllStoriesForAdmin(): Promise<LogStoryDTO[]> {
  const col = await ensureSetup();
  const now = new Date();
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(d => toStoryDTO(d, { expired: d.expiresAt !== null && d.expiresAt <= now }));
}

export async function deleteStory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await getLogStoriesCollection();
  const res = await col.deleteOne({ _id: new ObjectId(id) });
  return res.deletedCount > 0;
}
