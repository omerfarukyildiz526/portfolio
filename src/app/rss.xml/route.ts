import { getAllPosts } from '@/lib/posts-db';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_URL || 'https://omerfarukyildiz.tech').replace(/\/+$/, '');

function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  let posts: { slug: string; title: string; excerpt: string; date: string }[] = [];
  try { posts = await getAllPosts(); } catch { /* DB yoksa boş besleme */ }

  const items = posts.map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/logs/${p.slug}</link>
      <guid>${BASE}/logs/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Ömer Faruk Yıldız — Yazılar</title>
    <link>${BASE}/logs</link>
    <description>Yazılar ve notlar</description>
    <language>tr</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
