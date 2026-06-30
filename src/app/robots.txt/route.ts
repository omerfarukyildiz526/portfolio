export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_URL || 'https://omerfarukyildiz.tech').replace(/\/+$/, '');

// Yapay zekâ / cevap motorlarının tarayıcıları — AI aramalarında öne çıkmak için
// hepsine açıkça izin veriyoruz (yalnızca /admin ve /api hariç).
const AI_BOTS = [
  'GPTBot',            // OpenAI eğitim/indeksleme
  'OAI-SearchBot',     // ChatGPT Search
  'ChatGPT-User',      // ChatGPT tarama (kullanıcı isteğiyle)
  'ClaudeBot',         // Anthropic Claude
  'Claude-Web',        // Anthropic Claude (web)
  'anthropic-ai',      // Anthropic
  'PerplexityBot',     // Perplexity indeksleme
  'Perplexity-User',   // Perplexity tarama
  'Google-Extended',   // Google Gemini / AI Overviews
  'Applebot',          // Apple / Siri
  'Applebot-Extended', // Apple AI
  'Bingbot',           // Bing / Copilot
  'Amazonbot',         // Amazon / Alexa
  'DuckAssistBot',     // DuckDuckGo AI
  'YandexBot',         // Yandex
  'CCBot',             // Common Crawl (birçok LLM veri kaynağı)
  'Meta-ExternalAgent',// Meta AI
  'Bytespider',        // TikTok / Doubao
];

export function GET() {
  const rule = 'Allow: /\nDisallow: /admin\nDisallow: /api/';
  const blocks = [
    `User-agent: *\n${rule}`,
    ...AI_BOTS.map((bot) => `User-agent: ${bot}\n${rule}`),
  ];

  const body =
    blocks.join('\n\n') +
    `\n\nSitemap: ${BASE}/sitemap.xml\nHost: ${BASE}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
