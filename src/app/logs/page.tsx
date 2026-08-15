'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/lib/posts';
import { useLang } from '@/lib/i18n';
import LogsGridSkeleton from '@/components/logs/LogsGridSkeleton';
import StoryViewer, { type ViewerStory } from '@/components/StoryViewer';
import { SEED_LOGS_PROFILE, type LogsProfileContent } from '@/lib/logs-profile';
import type { LogStoryDTO } from '@/lib/log-stories';
import { useLogsSearchQuery, openLogsSearch } from '@/lib/logs-search-store';
import ShareMenu from '@/components/logs/ShareMenu';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}B`;
  return String(n);
}

// Son 14 gün içinde eklenen yazılar "NEW" rozeti alır.
const NEW_WINDOW_DAYS = 14;
function isNew(date: string) {
  const t = new Date(date).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t < NEW_WINDOW_DAYS * 864e5;
}

function GridCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      <Link
        href={`/logs/${post.slug}`}
        className="logs-card group relative block w-full aspect-square overflow-hidden rounded-[2px]"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        {post.cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={post.cover} alt="" loading="lazy"
            className="logs-card-cover absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl"
            style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}>
            {post.symbol}
          </div>
        )}

        {/* Alttan gradient + başlık — mobilde her zaman görünür (tap gerekmez) */}
        <div className="absolute inset-x-0 bottom-0 p-3 pt-8"
          style={{ background: 'linear-gradient(to top, rgba(10,9,8,0.92), transparent)' }}>
          <p className="logs-display text-[13px] font-semibold leading-tight line-clamp-2" style={{ color: '#F3EEE4' }}>
            {post.title}
          </p>
        </div>

        {/* Hover'da (desktop) tam overlay: excerpt + meta */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'rgba(10,9,8,0.82)' }}>
          <p className="logs-display text-[15px] font-semibold leading-snug mb-1.5" style={{ color: '#F3EEE4' }}>{post.title}</p>
          <p className="text-[12px] leading-snug line-clamp-3 mb-2" style={{ color: '#B6AD9C', fontFamily: 'var(--font-logs-body)' }}>{post.excerpt}</p>
          <div className="flex items-center gap-2 logs-mono text-[10px]" style={{ color: 'var(--accent)' }}>
            {isNew(post.date) && <span className="font-bold uppercase tracking-wider">NEW ·</span>}
            <span>{post.readTime} dk</span>
          </div>
        </div>

        {isNew(post.date) && (
          <span className="absolute top-2 right-2 logs-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: '#fff', background: 'var(--accent)' }}>
            NEW
          </span>
        )}
      </Link>
    </motion.div>
  );
}

export default function LogsGridPage() {
  const { lang } = useLang();
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const query = useLogsSearchQuery();
  const [profile, setProfile] = useState<LogsProfileContent>(SEED_LOGS_PROFILE);
  const [stories, setStories] = useState<LogStoryDTO[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    fetch('/api/posts', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/logs-profile', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.profile) setProfile(d.profile); })
      .catch(() => {});
    fetch('/api/logs/stories', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setStories(d.stories ?? []))
      .catch(() => {});
  }, []);

  const IG_URL = profile.instagramUrl || `https://instagram.com/${profile.username}`;
  const hasStories = stories.length > 0;
  const viewerStories: ViewerStory[] = stories.map(s => ({ id: s.id, mediaUrl: s.mediaUrl, mediaType: s.mediaType, caption: s.caption }));

  useEffect(() => {
    (() => {
      const t = new URLSearchParams(window.location.search).get('tag');
      if (t) setActiveTag(t);
    })();
  }, []);

  const allTags = useMemo(() => {
    const count = new Map<string, number>();
    posts.forEach(p => p.tags.forEach(t => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [posts]);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeTag ? posts.filter(p => p.tags.includes(activeTag)) : posts;
    if (q) list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)));
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts, activeTag, query]);

  // Liste için Blog + ItemList yapısal verisi (JSON-LD) — Google'ın yazıları
  // tek tek keşfetmesi ve zengin sonuç göstermesi için.
  const blogJsonLd = useMemo(() => {
    if (!posts.length) return null;
    const SITE = 'https://omerfarukyildiz.tech';
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE}/logs#blog`,
      url: `${SITE}/logs`,
      name: 'Ömer Faruk Yıldız — Logs',
      description: 'Backend, RPA ve sistem entegrasyonu üzerine programcı notları.',
      inLanguage: 'tr-TR',
      publisher: { '@id': `${SITE}/#person` },
      blogPost: posts.map(p => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.excerpt,
        datePublished: p.date,
        url: `${SITE}/logs/${p.slug}`,
        keywords: p.tags.join(', '),
      })),
    };
  }, [posts]);

  return (
    <main className="min-h-screen pt-24 pb-32 px-4 md:px-8">
      {blogJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      )}
      <div className="max-w-3xl mx-auto">

        {/* ── Intro: IG profil başlığına gönderme yapan (ama kopyalamayan) header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
          <div className="flex items-start gap-5 sm:gap-9 mb-5">
            {/* Avatar — aktif hikaye varsa canlı ring, yoksa nötr ring */}
            <button
              type="button"
              onClick={() => {
                if (hasStories) setViewerOpen(true);
                else window.open(IG_URL, '_blank', 'noopener,noreferrer');
              }}
              className="relative flex-shrink-0 w-[76px] h-[76px] sm:w-[100px] sm:h-[100px] rounded-full transition-transform active:scale-95"
              aria-label={hasStories ? (lang === 'tr' ? 'hikayeleri gör' : 'view stories') : (lang === 'tr' ? 'profili gör' : 'view profile')}>
              {/* Ring katmanı — aktif story varken döner, avatar içeriği bundan etkilenmez */}
              <div className={`absolute inset-0 rounded-full ${hasStories ? 'logs-gradient-ring' : ''}`}
                style={hasStories ? undefined : { background: 'var(--border)' }} />
              <div className="absolute inset-[3px] rounded-full flex items-center justify-center text-3xl sm:text-4xl overflow-hidden"
                style={{ background: 'var(--bg)', border: '2px solid var(--bg)' }}>
                {profile.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : '📓'}
              </div>
            </button>

            <div className="flex-1 min-w-0 pt-1 flex items-start justify-between gap-4">
              {/* Sol: kullanıcı adı, ad-soyad, stats, butonlar — bio'nun yüksekliğinden etkilenmez */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="logs-display text-[17px] sm:text-[20px] font-semibold leading-tight truncate" style={{ color: 'var(--fg)' }}>
                    {profile.username}
                  </h1>
                  <ShareMenu path="/logs" title={lang === 'tr' ? 'Ömer Faruk Yıldız — Logs' : 'Ömer Faruk Yıldız — Logs'} />
                </div>

                {profile.displayName && (
                  <p className="text-[12px] sm:text-[13px] leading-tight mb-2.5" style={{ color: 'var(--fg-2)' }}>{profile.displayName}</p>
                )}

                {/* Stats: gönderi / takipçi / takip */}
                <div className="flex items-center gap-4 sm:gap-6 logs-mono text-[12px] sm:text-[13px] mb-3" style={{ color: 'var(--fg-2)' }}>
                  <span><strong style={{ color: 'var(--fg)' }}>{posts.length}</strong> {lang === 'tr' ? 'gönderi' : 'posts'}</span>
                  <span><strong style={{ color: 'var(--fg)' }}>{formatCount(profile.followerCount)}</strong> {lang === 'tr' ? 'takipçi' : 'followers'}</span>
                  <span><strong style={{ color: 'var(--fg)' }}>{formatCount(profile.followingCount)}</strong> {lang === 'tr' ? 'takip' : 'following'}</span>
                </div>

                {/* Butonlar */}
                <div className="flex items-center gap-2">
                  <a href={IG_URL} target="_blank" rel="noopener noreferrer"
                    title={lang === 'tr' ? "Instagram'da takip et" : 'Follow on Instagram'}
                    className="logs-follow-btn flex-1 sm:flex-none text-center logs-mono text-[12px] font-semibold px-4 py-1.5 rounded-lg"
                    style={{ color: '#fff' }}>
                    {lang === 'tr' ? 'Takip Et' : 'Follow'}
                  </a>
                  <Link href="/contact"
                    className="flex-1 sm:flex-none text-center logs-mono text-[12px] font-semibold px-4 py-1.5 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--fg)', background: 'var(--surface)' }}>
                    {lang === 'tr' ? 'Mesaj Gönder' : 'Message'}
                  </Link>
                  <button type="button" onClick={openLogsSearch}
                    aria-label={lang === 'tr' ? 'ara' : 'search'}
                    className="w-8 h-8 flex-shrink-0 rounded-lg border flex items-center justify-center"
                    style={{ borderColor: 'var(--border)', color: 'var(--fg-2)', background: 'var(--surface)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sağ: bio — kullanıcı adıyla aynı hizada başlar, ayrı bir kolon */}
              <p className="hidden sm:block flex-shrink-0 max-w-sm text-[14px] font-medium text-right leading-relaxed pr-3"
                style={{ color: 'var(--fg)', borderRight: '2px solid var(--accent)' }}>
                {lang === 'tr' ? profile.bio.tr : profile.bio.en}
              </p>
            </div>
          </div>

          {/* Bio — mobilde (sm altı) üstteki satıra sığmadığı için burada, tam genişlikte */}
          <p className="sm:hidden text-[14px] leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            {lang === 'tr' ? profile.bio.tr : profile.bio.en}
          </p>

          {/* IG profil tab çubuğuna gönderme — etiket çizginin üstünde, çizgi tab'ı ayırıyor */}
          <div className="mt-7">
            <div className="flex items-center justify-center gap-1.5 pb-3 logs-mono text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--fg)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              {lang === 'tr' ? 'gönderiler' : 'posts'}
            </div>
            <div className="logs-tab-underline" style={{ height: 1.5 }} />
          </div>
        </motion.div>

        {/* ── Etiket filtresi — çizginin altında, ayrı bir bölüm olarak ── */}
        {!loading && posts.length > 0 && allTags.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-wrap items-center gap-1.5 mt-2.5 mb-4">
            <button onClick={() => setActiveTag(null)}
              className="logs-mono text-[9px] px-2 py-[3px] rounded-full border transition-colors"
              style={activeTag === null
                ? { color: '#fff', background: 'var(--accent)', borderColor: 'var(--accent)' }
                : { color: 'var(--fg-3)', borderColor: 'var(--border)' }}>
              all
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(t => (t === tag ? null : tag))}
                className="logs-mono text-[9px] px-2 py-[3px] rounded-full border transition-colors"
                style={activeTag === tag
                  ? { color: '#fff', background: 'var(--accent)', borderColor: 'var(--accent)' }
                  : { color: 'var(--fg-3)', borderColor: 'var(--border)' }}>
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <LogsGridSkeleton />
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--fg-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="1.6">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <p className="logs-display text-[17px] font-semibold" style={{ color: 'var(--fg)' }}>
              {lang === 'tr' ? 'Henüz Hiç Gönderi Yok' : 'No Posts Yet'}
            </p>
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="logs-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
              {query.trim()
                ? (lang === 'tr' ? `// "${query.trim()}" için sonuç yok` : `// no results for "${query.trim()}"`)
                : (lang === 'tr' ? `// "${activeTag}" etiketiyle yazı yok` : `// no posts tagged "${activeTag}"`)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px] md:gap-1">
            {visiblePosts.map((post, i) => <GridCard key={post.slug} post={post} index={i} />)}
          </div>
        )}
      </div>

      {viewerOpen && hasStories && (
        <StoryViewer stories={viewerStories} onClose={() => setViewerOpen(false)} />
      )}
    </main>
  );
}
