import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getMessages, getUnreadCount } from '@/lib/messages-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const [messages, unread] = await Promise.all([getMessages(), getUnreadCount()]);
    return NextResponse.json({ messages, unread });
  } catch (err) {
    console.error('GET /api/admin/messages', err);
    return NextResponse.json({ error: 'Mesajlar getirilemedi.' }, { status: 500 });
  }
}
