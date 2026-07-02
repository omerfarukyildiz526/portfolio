import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getPostBySlug } from '@/lib/posts-db';

export const alt = 'Ömer Faruk Yıldız — Logs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Yazıya özel paylaşım/önizleme kartı — başlık, sembol, etiketler, tarih.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  const logo = await readFile(join(process.cwd(), 'public/logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  const title = post?.title ?? 'Yazı';
  const symbol = post?.symbol ?? '›';
  const tags = post?.tags?.slice(0, 4) ?? [];
  const gradient = post?.gradient ?? ['#0A84FF', '#1a2a6c'];
  const dateStr = post?.date
    ? new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72,
          background: 'radial-gradient(circle at 20% 10%, #15151c, #0b0b0f)',
          color: '#ffffff', fontFamily: 'sans-serif',
        }}
      >
        {/* Üst satır: GET /api/logs → 200 OK */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26 }}>
          <span style={{
            color: '#0A84FF', background: 'rgba(10,132,255,0.14)',
            padding: '6px 16px', borderRadius: 8, fontWeight: 700, letterSpacing: 1,
          }}>GET</span>
          <span style={{ color: '#8a8a99' }}>/api/logs/{slug}</span>
          <span style={{ color: '#30D158' }}>→ 200 OK</span>
        </div>

        {/* Orta: sembol kutusu + başlık */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{
            width: 108, height: 108, borderRadius: 26, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 58,
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          }}>{symbol}</div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {tags.map(t => (
              <span key={t} style={{
                fontSize: 24, color: '#0A84FF', background: 'rgba(10,132,255,0.12)',
                border: '1px solid rgba(10,132,255,0.28)', padding: '4px 16px', borderRadius: 999,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Alt: logo + isim + tarih */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={56} height={56} alt="" style={{ borderRadius: 28, border: '2px solid #2a2a35' }} />
            <span style={{ fontSize: 28, fontWeight: 600 }}>Ömer Faruk Yıldız</span>
          </div>
          <span style={{ fontSize: 24, color: '#8a8a99' }}>{dateStr}</span>
        </div>
      </div>
    ),
    { ...size, emoji: 'twemoji' },
  );
}
