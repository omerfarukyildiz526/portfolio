import type { Post, ContentBlock } from './posts';

const BLOCK_TYPES = ['p', 'h2', 'h3', 'code', 'list', 'note', 'quote', 'image', 'divider'] as const;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Gelen JSON'ı temiz bir Post objesine dönüştürür; geçersizse hata mesajı verir. */
export function parsePost(input: unknown): { ok: true; post: Post } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Geçersiz veri.' };
  const o = input as Record<string, unknown>;

  const title = str(o.title);
  if (!title) return { ok: false, error: 'Başlık zorunlu.' };

  let slug = str(o.slug);
  if (!slug) {
    // Başlıktan otomatik slug üret
    slug = title.toLowerCase()
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: 'Slug yalnızca küçük harf, rakam ve tire içerebilir.' };
  }

  const grad = o.gradient;
  const gradient: [string, string] = Array.isArray(grad) && grad.length === 2
    ? [str(grad[0]) || '#1a2a6c', str(grad[1]) || '#0d1433']
    : ['#0d1433', '#1a2a6c'];

  const tags = Array.isArray(o.tags)
    ? o.tags.map(str).filter(Boolean)
    : [];

  const rawContent = Array.isArray(o.content) ? o.content : [];
  const content: ContentBlock[] = [];
  for (const raw of rawContent) {
    if (typeof raw !== 'object' || raw === null) continue;
    const b = raw as Record<string, unknown>;
    const type = b.type as ContentBlock['type'];
    if (!BLOCK_TYPES.includes(type)) continue;

    if (type === 'divider') {
      content.push({ type });
    } else if (type === 'list') {
      const items = Array.isArray(b.items) ? b.items.map(str).filter(Boolean) : [];
      if (items.length) content.push({ type, items });
    } else if (type === 'code') {
      const text = typeof b.text === 'string' ? b.text : '';
      if (text.trim()) content.push({ type, text, lang: str(b.lang) || 'code' });
    } else if (type === 'image') {
      const url = str(b.url);
      if (url) content.push({ type, url, text: str(b.text) || undefined });
    } else {
      const text = str(b.text);
      if (text) content.push({ type, text });
    }
  }
  if (content.length === 0) return { ok: false, error: 'En az bir içerik bloğu ekle.' };

  const dateRaw = str(o.date);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : new Date().toISOString().slice(0, 10);

  const readTime = Number(o.readTime);

  const post: Post = {
    slug,
    title,
    excerpt: str(o.excerpt) || title,
    gradient,
    symbol: str(o.symbol) || '📝',
    tags,
    date,
    readTime: Number.isFinite(readTime) && readTime > 0 ? Math.round(readTime) : 5,
    content,
    published: typeof o.published === 'boolean' ? o.published : true,
    cover: str(o.cover) || undefined,
  };
  return { ok: true, post };
}
