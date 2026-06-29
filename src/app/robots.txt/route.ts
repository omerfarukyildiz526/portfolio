export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_URL || 'https://omerfarukyildiz.tech').replace(/\/+$/, '');

export function GET() {
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${BASE}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
