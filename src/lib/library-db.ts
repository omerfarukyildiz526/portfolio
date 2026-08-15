import 'server-only';
import { ObjectId } from 'mongodb';
import { getLibraryCollection } from './mongodb';

// Kişisel link kütüphanesi — Instagram/Twitter vb. yerlerden kaydedilen
// içerik linklerini etiketlerle saklamak için. TAMAMEN PRIVATE: public
// endpoint yok, yalnızca admin panelinden erişilir.
export interface LibraryItem {
  _id: ObjectId;
  url: string;
  title: string;
  note?: string;
  tags: string[];
  source?: string; // "instagram" | "twitter" | "web" | "other" gibi serbest string
  createdAt: Date;
  updatedAt: Date;
}

// Dışarıya `_id` string olarak dönen, formlarda kullanılan şekil.
export type LibraryItemDTO = Omit<LibraryItem, '_id'> & { id: string };

function toDTO(doc: LibraryItem): LibraryItemDTO {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

// Yeni kayıt oluşturmak için gelen veri; _id/createdAt/updatedAt DB'de üretilir.
export type LibraryItemInput = Pick<LibraryItem, 'url' | 'title' | 'tags'> &
  Partial<Pick<LibraryItem, 'note' | 'source'>>;

let indexEnsured = false;

async function ensureSetup() {
  const col = await getLibraryCollection();
  if (!indexEnsured) {
    await col.createIndex({ createdAt: -1 });
    await col.createIndex({ tags: 1 });
    indexEnsured = true;
  }
  return col;
}

// En yeni kayıt en üstte.
export async function getAllLibraryItems(): Promise<LibraryItemDTO[]> {
  const col = await ensureSetup();
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(toDTO);
}

export async function getLibraryItemById(id: string): Promise<LibraryItemDTO | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await ensureSetup();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? toDTO(doc) : null;
}

export async function getLibraryItemsByTag(tag: string): Promise<LibraryItemDTO[]> {
  const col = await ensureSetup();
  const docs = await col.find({ tags: tag }).sort({ createdAt: -1 }).toArray();
  return docs.map(toDTO);
}

export async function createLibraryItem(data: LibraryItemInput): Promise<LibraryItemDTO> {
  const col = await ensureSetup();
  const now = new Date();
  const doc: LibraryItem = {
    _id: new ObjectId(),
    url: data.url,
    title: data.title,
    note: data.note,
    tags: data.tags,
    source: data.source,
    createdAt: now,
    updatedAt: now,
  };
  await col.insertOne(doc);
  return toDTO(doc);
}

export async function updateLibraryItem(id: string, data: LibraryItemInput): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await getLibraryCollection();
  const res = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
  );
  return res.matchedCount > 0;
}

export async function deleteLibraryItem(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await getLibraryCollection();
  const res = await col.deleteOne({ _id: new ObjectId(id) });
  return res.deletedCount > 0;
}
