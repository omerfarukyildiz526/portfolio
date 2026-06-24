import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Görsel yükleme yapılandırılmamış (BLOB_READ_WRITE_TOKEN yok).' }, { status: 501 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get('file');
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Yalnızca görsel dosyaları yüklenebilir.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Dosya 8 MB sınırını aşıyor.' }, { status: 400 });

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const blob = await put(`feed/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('POST /api/admin/upload', err);
    return NextResponse.json({ error: 'Yükleme başarısız.' }, { status: 500 });
  }
}
