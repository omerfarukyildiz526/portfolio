import 'server-only';
import { getDb } from './mongodb';

// Yazı görüntülenme sayıları: slug başına bir doküman { _id: slug, count }.
type ViewDoc = { _id: string; count: number };

async function viewsCol() { return (await getDb()).collection<ViewDoc>('post_views'); }

export async function incrementView(slug: string): Promise<void> {
  if (!slug) return;
  await (await viewsCol()).updateOne({ _id: slug }, { $inc: { count: 1 } }, { upsert: true });
}

// slug → görüntülenme haritası.
export async function getViewsMap(): Promise<Record<string, number>> {
  const docs = await (await viewsCol()).find({}).toArray();
  const out: Record<string, number> = {};
  for (const d of docs) out[d._id] = d.count;
  return out;
}
