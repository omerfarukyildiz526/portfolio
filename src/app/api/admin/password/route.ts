import { NextRequest, NextResponse } from 'next/server';
import { isAuthed, checkPassword, changePassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const current = typeof b.current === 'string' ? b.current : '';
  const next = typeof b.next === 'string' ? b.next : '';

  if (next.length < 4) {
    return NextResponse.json({ error: 'Yeni şifre en az 4 karakter olmalı.' }, { status: 400 });
  }
  if (!(await checkPassword(current))) {
    return NextResponse.json({ error: 'Mevcut şifre yanlış.' }, { status: 400 });
  }

  try {
    const ok = await changePassword(next);
    if (!ok) return NextResponse.json({ error: 'Yönetici bulunamadı.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/password', err);
    return NextResponse.json({ error: 'Şifre değiştirilemedi.' }, { status: 500 });
  }
}
