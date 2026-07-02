import { getAllPosts } from '@/lib/posts-db';
import type { Post } from '@/lib/posts';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_URL || 'https://omerfarukyildiz.tech').replace(/\/+$/, '');
const AUTHOR = 'omerfaruk_yildiz@outlook.com (Ömer Faruk Yıldız)';

function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  let posts: Post[] = [];
  try { posts = await getAllPosts(); } catch { /* DB yoksa boş besleme */ }

  // En yeni yazının tarihi kanalın lastBuildDate'i olur.
  const latest = posts.reduce<number>((max, p) => {
    const t = new Date(p.date).getTime();
    return isNaN(t) ? max : Math.max(max, t);
  }, 0);
  const buildDate = new Date(latest || Date.now()).toUTCString();

  const items = posts.map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/logs/${p.slug}</link>
      <guid isPermaLink="true">${BASE}/logs/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <dc:creator>${esc(AUTHOR)}</dc:creator>
${(p.tags ?? []).map(t => `      <category>${esc(t)}</category>`).join('\n')}
      <description>${esc(p.excerpt)}</description>
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Ömer Faruk Yıldız — Logs</title>
    <link>${BASE}/logs</link>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Backend, RPA ve sistem entegrasyonu üzerine programcı notları ve teknik yazılar.</description>
    <language>tr</language>
    <managingEditor>${esc(AUTHOR)}</managingEditor>
    <webMaster>${esc(AUTHOR)}</webMaster>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <generator>Next.js</generator>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
