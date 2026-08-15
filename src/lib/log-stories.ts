import { ObjectId } from 'mongodb';

// Instagram-benzeri "hikaye" — /logs sayfasının avatar'ına tıklanınca açılan
// geçici (ya da kalıcı) medya.
export interface LogStory {
  _id: ObjectId;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  expiresAt: Date | null; // null = kalıcı
  createdAt: Date;
}

// Dışarıya `_id` string olarak dönen, UI'da kullanılan şekil.
export type LogStoryDTO = Omit<LogStory, '_id' | 'expiresAt' | 'createdAt'> & {
  id: string;
  expiresAt: string | null;
  createdAt: string;
  expired?: boolean; // yalnızca admin listesinde işaretlenir
};

export function toStoryDTO(doc: LogStory, opts?: { expired?: boolean }): LogStoryDTO {
  const { _id, expiresAt, createdAt, ...rest } = doc;
  return {
    id: _id.toString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    ...(opts?.expired !== undefined ? { expired: opts.expired } : {}),
    ...rest,
  };
}
