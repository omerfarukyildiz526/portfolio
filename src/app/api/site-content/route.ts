import { NextResponse } from 'next/server';
import { getSiteContent } from '@/lib/site-content-db';
import { SEED_CONTENT } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

// Tüm sayfa içerikleri (herkese açık). Hata olursa seed içeriğe düşer.
export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (err) {
    console.error('GET /api/site-content', err);
    return NextResponse.json({ content: SEED_CONTENT });
  }
}
