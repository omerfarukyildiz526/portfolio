import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { createLibraryItem, getAllLibraryItems } from '@/lib/library-db';
import { parseLibraryItem } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// Panel için tüm link kayıtları (yeni en üstte).
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const items = await getAllLibraryItems();
    return NextResponse.json({ items });
  } catch (err) {
    console.error('GET /api/admin/library', err);
    return NextResponse.json({ error: 'Kayıtlar getirilemedi.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const parsed = parseLibraryItem(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const item = await createLibraryItem(parsed.item);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/library', err);
    return NextResponse.json({ error: 'Kayıt eklenemedi.' }, { status: 500 });
  }
}
