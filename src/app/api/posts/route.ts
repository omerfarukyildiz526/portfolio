import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts-db';

export const dynamic = 'force-dynamic'; // her zaman güncel veri

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('GET /api/posts', err);
    return NextResponse.json({ error: 'Yazılar getirilemedi.' }, { status: 500 });
  }
}
