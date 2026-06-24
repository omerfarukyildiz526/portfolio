import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/posts-db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: RouteContext<'/api/posts/[slug]'>) {
  try {
    const { slug } = await ctx.params;
    const post = await getPostBySlug(slug);
    if (!post) return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error('GET /api/posts/[slug]', err);
    return NextResponse.json({ error: 'Yazı getirilemedi.' }, { status: 500 });
  }
}
