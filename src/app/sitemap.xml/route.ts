import { getAllPosts } from '@/lib/posts-db';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_URL || 'https://omerfarukyildiz.tech').replace(/\/+$/, '');
const STATIC = ['', '/experience', '/skills', '/projects', '/feed', '/contact'];

export async function GET() {
  let posts: { slug: string; date: string }[] = [];
  try { posts = await getAllPosts(); } catch { /* DB yoksa yalnızca statik */ }

  const urls = [
    ...STATIC.map(p => `  <url><loc>${BASE}${p}</loc></url>`),
    ...posts.map(p => `  <url><loc>${BASE}/feed/${p.slug}</loc><lastmod>${p.date}</lastmod></url>`),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
