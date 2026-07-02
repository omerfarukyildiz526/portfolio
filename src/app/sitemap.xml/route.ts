import { getAllPosts } from '@/lib/posts-db';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_URL || 'https://omerfarukyildiz.tech').replace(/\/+$/, '');

// [path, changefreq, priority]
const STATIC: [string, string, string][] = [
  ['', 'weekly', '1.0'],
  ['/experience', 'monthly', '0.9'],
  ['/skills', 'monthly', '0.9'],
  ['/projects', 'weekly', '0.9'],
  ['/logs', 'daily', '0.8'],
  ['/contact', 'yearly', '0.6'],
];

export async function GET() {
  let posts: { slug: string; date: string }[] = [];
  try { posts = await getAllPosts(); } catch { /* DB yoksa yalnızca statik */ }

  const now = new Date().toISOString();

  const urls = [
    ...STATIC.map(([p, freq, prio]) =>
      `  <url><loc>${BASE}${p}</loc><lastmod>${now}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`),
    ...posts.map(p =>
      `  <url><loc>${BASE}/logs/${p.slug}</loc><lastmod>${new Date(p.date).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
