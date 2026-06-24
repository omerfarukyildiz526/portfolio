import 'server-only';
import { randomUUID } from 'crypto';
import { getDb } from './mongodb';

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string; // ISO
  read: boolean;
}

const NO_ID = { projection: { _id: 0 } } as const;

async function col() {
  const db = await getDb();
  return db.collection<Message>('messages');
}

export async function createMessage(input: { name: string; email: string; message: string }): Promise<void> {
  const c = await col();
  await c.insertOne({
    id: randomUUID(),
    name: input.name,
    email: input.email,
    message: input.message,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

export async function getMessages(): Promise<Message[]> {
  const c = await col();
  return c.find({}, NO_ID).sort({ createdAt: -1 }).toArray() as Promise<Message[]>;
}

export async function getUnreadCount(): Promise<number> {
  const c = await col();
  return c.countDocuments({ read: false });
}

export async function setMessageRead(id: string, read: boolean): Promise<boolean> {
  const c = await col();
  const res = await c.updateOne({ id }, { $set: { read } });
  return res.matchedCount > 0;
}

export async function deleteMessage(id: string): Promise<boolean> {
  const c = await col();
  const res = await c.deleteOne({ id });
  return res.deletedCount > 0;
}
