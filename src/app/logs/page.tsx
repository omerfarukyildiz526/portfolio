'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/lib/posts';
import type { Topic } from '@/lib/topics';
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

// Kebab (⋮) menüsünden açılan diğer sayfalar — IG'nin profil menüsüne gönderme.
const SITE_PAGES: { path: string; label: { tr: string; en: string } }[] = [
  { path: '/',           label: { tr: 'Ana Sayfa', en: 'Home' } },
  { path: '/experience', label: { tr: 'Deneyim',   en: 'Experience' } },
  { path: '/skills',     label: { tr: 'Donanım',   en: 'Skills' } },
  { path: '/projects',   label: { tr: 'Projeler',  en: 'Projects' } },
  { path: '/contact',    label: { tr: 'İletişim',  en: 'Contact' } },
];

// Son 14 gün içinde eklenen yazılar "NEW" rozeti alır.
const NEW_WINDOW_DAYS = 14;
function isNew(date: string) {
  const t = new Date(date).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t < NEW_WINDOW_DAYS * 864e5;
}

function TopicCard({ topic, count, index, onOpen }: { topic: Topic; count: number; index: number; onOpen: (slug: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      <button
        type="button"
        onClick={() => onOpen(topic.slug)}
        className="logs-card group relative block w-full aspect-square overflow-hidden rounded-[2px] text-left"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        {topic.cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={topic.cover} alt="" loading="lazy"
            className="logs-card-cover absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl"
            style={{ background: `linear-gradient(135deg, ${topic.gradient[0]}, ${topic.gradient[1]})` }}>
            {topic.symbol}
          </div>
        )}

        <div className="absolute inset-0" style={{ background: 'rgba(10,9,8,0.28)' }} />

        <div className="absolute inset-x-0 bottom-0 p-3 pt-8"
          style={{ background: 'linear-gradient(to top, rgba(10,9,8,0.92), transparent)' }}>
          <p className="logs-display text-[13px] font-semibold leading-tight" style={{ color: '#F3EEE4' }}>
            {topic.title}
          </p>
          <p className="logs-mono text-[10px] mt-0.5" style={{ color: 'var(--accent)' }}>
            {count}
          </p>
        </div>
      </button>
    </motion.div>
  );
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
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [view, setView] = useState<'posts' | 'topics'>('posts');
  const [routeMenuOpen, setRouteMenuOpen] = useState(false);
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
    fetch('/api/topics', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setTopics(d.topics ?? []))
      .catch(() => setTopics([]));
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
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tag');
      const tp = params.get('topic');
      if (t) setActiveTag(t);
      if (tp) { setActiveTopic(tp); setView('posts'); }
    })();
  }, []);

  const allTags = useMemo(() => {
    const count = new Map<string, number>();
    posts.forEach(p => p.tags.forEach(t => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [posts]);

  // Her konu için kaç gönderi bağlı olduğunu sayar (post.topic == topic.slug).
  const topicCounts = useMemo(() => {
    const count = new Map<string, number>();
    posts.forEach(p => { if (p.topic) count.set(p.topic, (count.get(p.topic) ?? 0) + 1); });
    return count;
  }, [posts]);

  const openTopic = (slug: string) => {
    setActiveTopic(slug);
    setView('posts');
  };

  const activeTopicObj = useMemo(() => topics.find(t => t.slug === activeTopic) ?? null, [topics, activeTopic]);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = posts;
    if (activeTopic) list = list.filter(p => p.topic === activeTopic);
    if (activeTag) list = list.filter(p => p.tags.includes(activeTag));
    if (q) list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)));
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts, activeTag, activeTopic, query]);

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

          {/* Üst satır: kullanıcı adı solda, sağda paylaş + diğer sayfalar (⋮) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="logs-display text-[17px] sm:text-[20px] font-semibold leading-tight truncate" style={{ color: 'var(--fg)' }}>
                {profile.username}
              </h1>
              <ShareMenu path="/logs" title={lang === 'tr' ? 'Ömer Faruk Yıldız — Logs' : 'Ömer Faruk Yıldız — Logs'} />
            </div>
            <div className="relative flex-shrink-0">
              <button type="button" onClick={() => setRouteMenuOpen(o => !o)}
                aria-label={lang === 'tr' ? 'diğer sayfalar' : 'other pages'}
                aria-expanded={routeMenuOpen}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: 'var(--fg)', background: routeMenuOpen ? 'var(--surface)' : 'transparent' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/>
                </svg>
              </button>

              <AnimatePresence>
                {routeMenuOpen && (
                  <>
                    <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setRouteMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border overflow-hidden py-1"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 16px 40px -12px rgba(0,0,0,0.4)' }}>
                      {SITE_PAGES.map(p => (
                        <Link key={p.path} href={p.path} onClick={() => setRouteMenuOpen(false)}
                          className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px] transition-colors hover:opacity-80"
                          style={{ color: 'var(--fg)' }}>
                          {lang === 'tr' ? p.label.tr : p.label.en}
                          <span className="logs-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>{p.path}</span>
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Avatar + stats — IG profil satırı */}
          <div className="flex items-center gap-6 sm:gap-8 mb-4">
            {/* Avatar — aktif hikaye varsa canlı ring, yoksa nötr ring */}
            <button
              type="button"
              onClick={() => {
                if (hasStories) setViewerOpen(true);
                else window.open(IG_URL, '_blank', 'noopener,noreferrer');
              }}
              className="relative flex-shrink-0 w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-full transition-transform active:scale-95"
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

            {/* Stats: gönderi / takipçi / takip — sayı üstte, etiket altta (IG formatı) */}
            <div className="flex-1 flex items-center justify-around text-center">
              <div>
                <p className="logs-display text-[17px] sm:text-[19px] font-bold leading-tight" style={{ color: 'var(--fg)' }}>{posts.length}</p>
                <p className="logs-mono text-[11px] sm:text-[12px]" style={{ color: 'var(--fg-2)' }}>{lang === 'tr' ? 'gönderi' : 'posts'}</p>
              </div>
              <div>
                <p className="logs-display text-[17px] sm:text-[19px] font-bold leading-tight" style={{ color: 'var(--fg)' }}>{formatCount(profile.followerCount)}</p>
                <p className="logs-mono text-[11px] sm:text-[12px]" style={{ color: 'var(--fg-2)' }}>{lang === 'tr' ? 'takipçi' : 'followers'}</p>
              </div>
              <div>
                <p className="logs-display text-[17px] sm:text-[19px] font-bold leading-tight" style={{ color: 'var(--fg)' }}>{formatCount(profile.followingCount)}</p>
                <p className="logs-mono text-[11px] sm:text-[12px]" style={{ color: 'var(--fg-2)' }}>{lang === 'tr' ? 'takip' : 'following'}</p>
              </div>
            </div>
          </div>

          {/* Ad-soyad + bio — tam genişlik */}
          {profile.displayName && (
            <p className="text-[13px] font-semibold leading-tight mb-1" style={{ color: 'var(--fg)' }}>{profile.displayName}</p>
          )}
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            {lang === 'tr' ? profile.bio.tr : profile.bio.en}
          </p>

          {/* Butonlar — tam genişlik satır (IG: Takip Et / Mesaj / ara) */}
          <div className="flex items-center gap-2 mt-3">
            <a href={IG_URL} target="_blank" rel="noopener noreferrer"
              title={lang === 'tr' ? "Instagram'da takip et" : 'Follow on Instagram'}
              className="logs-follow-btn flex-1 text-center logs-mono text-[12px] font-semibold px-4 py-1.5 rounded-lg"
              style={{ color: '#fff' }}>
              {lang === 'tr' ? 'Takip Et' : 'Follow'}
            </a>
            <Link href="/contact"
              className="flex-1 text-center logs-mono text-[12px] font-semibold px-4 py-1.5 rounded-lg border transition-colors"
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

          {/* IG profil tab çubuğuna gönderme — ikon-sadece iki sekme, aktifte alt çizgi */}
          <div className="flex items-center justify-center gap-16 mt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={() => { setActiveTopic(null); setView('posts'); }}
              aria-label={lang === 'tr' ? 'gönderiler' : 'posts'}
              className="flex items-center justify-center py-3 transition-colors"
              style={{ color: view === 'posts' ? 'var(--fg)' : 'var(--fg-3)', borderTop: view === 'posts' ? '1.5px solid var(--fg)' : '1.5px solid transparent', marginTop: -1 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button type="button" onClick={() => setView('topics')}
              aria-label={lang === 'tr' ? 'konular' : 'topics'}
              className="flex items-center justify-center py-3 transition-colors"
              style={{ color: view === 'topics' ? 'var(--fg)' : 'var(--fg-3)', borderTop: view === 'topics' ? '1.5px solid var(--fg)' : '1.5px solid transparent', marginTop: -1 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3a1 1 0 0 0-1 1l.24 5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z"/>
                <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>
              </svg>
            </button>
          </div>
        </motion.div>

        {/* ── Aktif konu filtresi rozeti — bir konudan gelindiyse ── */}
        {view === 'posts' && activeTopicObj && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3">
            <span className="logs-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-3)' }}>
              {lang === 'tr' ? 'konu:' : 'topic:'}
            </span>
            <span className="logs-mono text-[10px] px-2 py-[3px] rounded-full" style={{ color: '#fff', background: 'var(--accent)' }}>
              {activeTopicObj.title}
            </span>
            <button onClick={() => setActiveTopic(null)} className="logs-mono text-[10px]" style={{ color: 'var(--fg-3)' }} aria-label={lang === 'tr' ? 'filtreyi kaldır' : 'clear filter'}>
              ✕
            </button>
          </motion.div>
        )}

        {/* ── Etiket filtresi — sadece gönderiler görünümünde, çizginin altında ── */}
        {view === 'posts' && !loading && posts.length > 0 && allTags.length > 0 && (
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
        ) : view === 'topics' ? (
          topics.length === 0 ? (
            <div className="text-center py-16">
              <p className="logs-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
                {lang === 'tr' ? '// henüz konu yok' : '// no topics yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px] md:gap-1">
              {topics.map((topic, i) => <TopicCard key={topic.slug} topic={topic} count={topicCounts.get(topic.slug) ?? 0} index={i} onOpen={openTopic} />)}
            </div>
          )
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="logs-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
              {query.trim()
                ? (lang === 'tr' ? `// "${query.trim()}" için sonuç yok` : `// no results for "${query.trim()}"`)
                : activeTopicObj
                  ? (lang === 'tr' ? `// "${activeTopicObj.title}" konusunda henüz yazı yok` : `// no posts in "${activeTopicObj.title}" yet`)
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
