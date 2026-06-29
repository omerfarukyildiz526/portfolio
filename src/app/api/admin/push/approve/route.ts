import { NextRequest, NextResponse } from 'next/server';
import { resolveLoginRequest } from '@/lib/push-auth';

export const dynamic = 'force-dynamic';

// Telefondaki bildirimden çağrılır. Yetki, push ile yalnızca kayıtlı cihaza
// giden approveToken'a sahip olmaktır (capability).
export async function POST(req: NextRequest) {
  let id = '', approveToken = '', action = '';
  try {
    const b = await req.json();
    id = String(b?.id || '');
    approveToken = String(b?.approveToken || '');
    action = String(b?.action || '');
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
  if (!id || !approveToken) return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });

  const approve = action !== 'deny';
  const ok = await resolveLoginRequest(id, approveToken, approve);
  if (!ok) return NextResponse.json({ error: 'İstek geçersiz ya da süresi dolmuş.' }, { status: 400 });
  return NextResponse.json({ ok: true, approved: approve });
}
