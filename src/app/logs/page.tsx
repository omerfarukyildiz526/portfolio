'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, ContentBlock } from '@/lib/posts';
import { useLang } from '@/lib/i18n';
import { MD } from '@/components/Markdown';
import JsonSkeleton from '@/components/JsonSkeleton';
import Code from '@/components/Code';
import Typewriter from '@/components/Typewriter';

// Son 14 gün içinde eklenen yazılar "NEW" rozeti alır.
const NEW_WINDOW_DAYS = 14;
function isNew(date: string) {
  const t = new Date(date).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t < NEW_WINDOW_DAYS * 864e5;
}

// Başlık altı daktilo cümleleri. 30 adet × 10 sn = aynı cümle ~5 dakikada bir tekrar.
const TAGLINES_TR = [
  'Programcı notları — çözüp bir yere yazmak istediğim şeyler.',
  'Backend, otomasyon ve sistem entegrasyonu.',
  'Hata ayıklarken öğrendiklerim.',
  'Kod parçaları, çözümler ve teknik yazılar.',
  'Bir sorunu çözdüm, unutmadan yazdım.',
  '"Bende çalışıyor" demeden önce okunacaklar.',
  'Production’da öğrenilen dersler.',
  'Küçük numaralar, büyük zaman tasarrufu.',
  'Docker, .NET ve Python günlükleri.',
  'SAP RFC ile boğuştuğum anlar.',
  'Bir sonraki ben için bıraktığım ipuçları.',
  'Log okumadan çözüm yok.',
  'Gece 2’de bulunan hatalar.',
  'Refactor öncesi ve sonrası.',
  'Sessizce patlayan edge case’ler.',
  'Bir satır kodun uzun hikâyesi.',
  'Kopyala-yapıştır etmeden önce anla.',
  'Ölçmeden optimize etme.',
  'Entity Framework tuzakları.',
  'API tasarlarken verdiğim kararlar.',
  'Otomasyonun kurtardığı saatler.',
  'Stack trace’in söyledikleri.',
  'Basit tut, sonra hızlandır.',
  'Deploy’dan önce son kontroller.',
  'Cache: iki zor problemden biri.',
  'Neden çalıştığını da yaz.',
  'Terminalde geçen bir ömür.',
  'Bir bug, bir öğrenme.',
  'Yazılımcı hafızası: bu sayfa.',
  'Çalışan koddan çıkarılan dersler.',
];
const TAGLINES_EN = [
  'Programmer notes — things I worked out and wrote down.',
  'Backend, automation and system integration.',
  'What I learned while debugging.',
  'Snippets, fixes and technical write-ups.',
  'Solved a problem, wrote it down before forgetting.',
  'Read this before saying "works on my machine".',
  'Lessons learned in production.',
  'Small tricks, big time savings.',
  'Docker, .NET and Python journals.',
  'Wrestling with SAP RFC.',
  'Notes I left for the next me.',
  'No fix without reading the logs.',
  'Bugs found at 2 a.m.',
  'Before and after the refactor.',
  'Edge cases that fail silently.',
  'The long story of one line of code.',
  'Understand it before you copy-paste.',
  'Don’t optimize what you didn’t measure.',
  'Entity Framework pitfalls.',
  'Decisions made while designing an API.',
  'Hours saved by automation.',
  'What the stack trace was telling me.',
  'Keep it simple, then make it fast.',
  'Final checks before deploy.',
  'Cache: one of two hard problems.',
  'Write down why it works, too.',
  'A life spent in the terminal.',
  'One bug, one lesson.',
  'A developer’s memory: this page.',
  'Lessons pulled from working code.',
];

function CodeBlock({ block, index }: { block: ContentBlock; index: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(block.text ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.03, duration: 0.4 }}
      className="code-block my-5"
    >
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{block.lang || 'code'}</span>
        <button onClick={copy} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded transition-all"
          style={{ color: copied ? '#30D158' : 'var(--fg-3)', background: copied ? 'color-mix(in srgb, #30D158 10%, transparent)' : 'transparent' }}>
          {copied ? (
            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>Copied</>
          ) : (
            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy</>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-5" style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 13, lineHeight: 1.65, color: 'var(--fg-2)' }}>
        <Code>{block.text ?? ''}</Code>
      </pre>
    </motion.div>
  );
}

function Block({ block, index }: { block: ContentBlock; index: number }) {
  const delay = 0.1 + index * 0.03;
  if (block.type === 'code') return <CodeBlock block={block} index={index} />;
  switch (block.type) {
    case 'h2': return (
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
        className="display-md mt-10 mb-4" style={{ color: 'var(--fg)' }}>{block.text}</motion.h2>
    );
    case 'h3': return (
      <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
        className="font-semibold text-base mt-7 mb-3" style={{ color: 'var(--fg)' }}>{block.text}</motion.h3>
    );
    case 'p': return (
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
        className="body-md mb-4" style={{ color: 'var(--fg-2)' }}><MD>{block.text ?? ''}</MD></motion.p>
    );
    case 'list': return (
      <motion.ul initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
        className="mb-4 space-y-2.5 pl-0">
        {block.items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3 body-md" style={{ color: 'var(--fg-2)' }}>
            <span className="mt-2.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />{item}
          </li>
        ))}
      </motion.ul>
    );
    case 'note': return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
        className="my-5 p-5 rounded-xl body-md"
        style={{ background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderLeft: '3px solid var(--accent)', color: 'var(--fg-2)' }}>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--accent)' }}>Note</span>
        <MD>{block.text ?? ''}</MD>
      </motion.div>
    );
    case 'quote': return (
      <motion.blockquote initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
        className="my-6 pl-5 body-lg italic" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--fg)' }}>
        <MD>{block.text ?? ''}</MD>
      </motion.blockquote>
    );
    case 'image': return (
      <motion.figure initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="my-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.url} alt={block.text || ''} className="w-full rounded-xl" style={{ border: '1px solid var(--border)' }} />
        {block.text && <figcaption className="body-sm text-center mt-2.5" style={{ color: 'var(--fg-3)' }}>{block.text}</figcaption>}
      </motion.figure>
    );
    case 'divider': return (
      <motion.hr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.4 }}
        className="my-8" style={{ border: 0, borderTop: '1px solid var(--border)' }} />
    );
    default: return null;
  }
}

const slideVariants = {
  enter:  (dir: number) => ({ x: dir * 32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir * -32, opacity: 0 }),
};

export default function FeedPage() {
  const { lang } = useLang();
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<Post | null>(null);
  const [progress,  setProgress]  = useState(0);
  const [direction, setDirection] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSec, setActiveSec] = useState(0);
  const [query,     setQuery]     = useState('');
  const [sort,      setSort]      = useState<'new' | 'old' | 'az'>('new');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/posts', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  // İlk yüklemede URL'deki ?tag=... filtresini uygula (API teması: query param).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tag');
    if (t) setActiveTag(t);
  }, []);

  // Tüm etiketler (sıklığa göre) — filtre çubuğu için.
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
    const sorted = [...list];
    if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    else sorted.sort((a, b) => (sort === 'old' ? 1 : -1) * (new Date(b.date).getTime() - new Date(a.date).getTime()));
    return sorted;
  }, [posts, activeTag, query, sort]);

  // Liste için Blog + ItemList yapısal verisi (JSON-LD). Google'ın yazıları
  // tek tek keşfetmesi ve zengin sonuç göstermesi için — /logs/[slug]'a bağlar.
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

  // Response-meta: kayıt sayısı, etiket sayısı, son güncelleme (göreli).
  const lastUpdated = useMemo(() => {
    if (!posts.length) return null;
    const max = Math.max(...posts.map(p => new Date(p.date).getTime()).filter(t => !isNaN(t)));
    return isFinite(max) ? max : null;
  }, [posts]);

  const relTime = (ts: number) => {
    const d = Math.floor((Date.now() - ts) / 864e5);
    if (d <= 0) return lang === 'tr' ? 'bugün' : 'today';
    if (d === 1) return lang === 'tr' ? 'dün' : 'yesterday';
    if (d < 30) return lang === 'tr' ? `${d} gün önce` : `${d} days ago`;
    const m = Math.floor(d / 30);
    if (m < 12) return lang === 'tr' ? `${m} ay önce` : `${m} months ago`;
    return lang === 'tr' ? `${Math.floor(m / 12)} yıl önce` : `${Math.floor(m / 12)} years ago`;
  };

  const currentIndex = selected ? visiblePosts.findIndex(p => p.slug === selected.slug) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < visiblePosts.length - 1;

  // Okunan yazıyla en az bir etiketi paylaşan diğer yazılar (en çok 3).
  const related = useMemo(() => {
    if (!selected) return [];
    return posts
      .filter(p => p.slug !== selected.slug && p.tags.some(t => selected.tags.includes(t)))
      .slice(0, 3);
  }, [selected, posts]);

  // Okuma modundaki içindekiler (h2 / h3 başlıkları + blok index'i).
  const toc = useMemo(() => {
    if (!selected) return [];
    return selected.content
      .map((b, i) => ({ i, type: b.type, text: b.text ?? '' }))
      .filter(b => b.type === 'h2' || b.type === 'h3');
  }, [selected]);

  const goToSection = (i: number) => {
    document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setProgress(isNaN(pct) ? 0 : Math.min(1, Math.max(0, pct)));

    // Scroll-spy: viewport üstüne en yakın geçmiş başlığı aktif say.
    let cur = 0;
    for (const t of toc) {
      const node = document.getElementById(`sec-${t.i}`);
      if (node && node.getBoundingClientRect().top - 120 <= 0) cur = t.i;
    }
    setActiveSec(cur);
  }, [toc]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setProgress(0);
  }, [selected?.slug]);

  const goTo = (post: Post, dir: number) => { setDirection(dir); setSelected(post); };

  // Okuma modu klavye kısayolları: Esc kapatır, ← / → yazı değiştirir.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelected(null); return; }
      if (e.key === 'ArrowLeft'  && hasPrev) goTo(visiblePosts[currentIndex - 1], -1);
      if (e.key === 'ArrowRight' && hasNext) goTo(visiblePosts[currentIndex + 1],  1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, currentIndex, hasPrev, hasNext, visiblePosts]);

  return (
    <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
      {blogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
      )}
      <div className="max-w-3xl mx-auto relative">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} className="mb-16">
          <div className="hidden md:flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="method-get">GET</span>
              <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>/api/logs</span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>→ 200 OK</span>
            </div>

            {/* Beyaz, parlayan kalın karşılama — ilk girişte daktilo (soldan sağa),
                GET hizasında sağda. Görünmez kopya tam genişliği ayırır ki kutu kaymasın. */}
            <span className="relative inline-block font-bold tracking-tight whitespace-nowrap text-[clamp(15px,1.8vw,20px)]">
              <span className="invisible" aria-hidden>
                {lang === 'tr' ? 'Logs Tabloma Hoş Geldiniz' : 'Welcome to My Logs'}
              </span>
              <span className="absolute inset-0 flex items-center">
                <Typewriter
                  text={lang === 'tr' ? 'Logs Tabloma Hoş Geldiniz' : 'Welcome to My Logs'}
                  baseColor="var(--fg)"
                  highlightColor="#ffffff"
                  glowColor="var(--fg)"
                  startDelay={250}
                />
              </span>
            </span>
          </div>
          <motion.h1
            className="display-lg mb-3"
            style={{
              backgroundImage: 'linear-gradient(110deg, var(--fg) 0%, var(--fg) 40%, #ffffff 50%, var(--fg) 60%, var(--fg) 100%)',
              backgroundSize: '220% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 0 16px color-mix(in srgb, var(--fg) 45%, transparent))',
            }}
            animate={{ backgroundPositionX: ['160%', '-60%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          >
            LOGS.
          </motion.h1>
          <p className="body-md">
            <Typewriter text={lang === 'tr' ? TAGLINES_TR : TAGLINES_EN} />
          </p>

          {/* ── Response-meta: sayım + son güncelleme + biçim çipleri ── */}
          {!loading && posts.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-5 font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>
              <span><span style={{ color: 'var(--fg-2)' }}>{posts.length}</span> {lang === 'tr' ? 'kayıt' : 'entries'}</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span><span style={{ color: 'var(--fg-2)' }}>{allTags.length}</span> {lang === 'tr' ? 'etiket' : 'tags'}</span>
              {lastUpdated && (<>
                <span style={{ opacity: 0.35 }}>·</span>
                <span>{lang === 'tr' ? 'son güncelleme' : 'updated'} {relTime(lastUpdated)}</span>
              </>)}
            </div>
          )}
        </motion.div>

        {/* ── Arama + sıralama ── */}
        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-3)' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder={lang === 'tr' ? 'ara — başlık, etiket…' : 'search — title, tag…'}
                className="w-full font-mono text-[12px] rounded-lg pl-9 pr-8 py-2 outline-none transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')} />
              {query && (
                <button onClick={() => setQuery('')} aria-label="temizle"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-3)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="flex items-center rounded-lg overflow-hidden border flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              {([['new', lang === 'tr' ? 'yeni' : 'new'], ['old', lang === 'tr' ? 'eski' : 'old'], ['az', 'A–Z']] as const).map(([s, label]) => (
                <button key={s} onClick={() => setSort(s)}
                  className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors"
                  style={sort === s
                    ? { background: 'var(--fg)', color: 'var(--bg)' }
                    : { background: 'transparent', color: 'var(--fg-3)' }}>
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Etiket filtresi ── */}
        {!loading && allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap items-center gap-2 mb-8">
            <span className="font-mono text-[10px] mr-1" style={{ color: 'var(--fg-3)' }}>?tag=</span>
            <button
              onClick={() => setActiveTag(null)}
              className="tag font-mono text-[10px]"
              style={activeTag === null
                ? { color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }
                : undefined}>
              all
            </button>
            {allTags.map(tag => (
              <button key={tag}
                onClick={() => setActiveTag(t => (t === tag ? null : tag))}
                className="tag font-mono text-[10px]"
                style={activeTag === tag
                  ? { color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }
                  : undefined}>
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {loading ? (
          <JsonSkeleton rows={5} />
        ) : posts.length === 0 ? (
          /* ── Boş durum ── */
          <div className="text-center py-16">
            <p className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
              {lang === 'tr' ? '// henüz yazı yok' : '// no posts yet'}
            </p>
          </div>
        ) : (
        <div className="space-y-3">
          {visiblePosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
                {query.trim()
                  ? (lang === 'tr' ? `// "${query.trim()}" için sonuç yok` : `// no results for "${query.trim()}"`)
                  : (lang === 'tr' ? `// "${activeTag}" etiketiyle yazı yok` : `// no posts tagged "${activeTag}"`)}
              </p>
            </div>
          ) : visiblePosts.map((post, i) => (
            <motion.button key={post.slug}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => { setDirection(0); setSelected(post); }}
              className="w-full text-left flex items-center gap-5 p-5 rounded-xl border transition-all duration-200 group"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {post.cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={post.cover} alt="" loading="lazy"
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--border)' }} />
              ) : (
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}>
                  {post.symbol}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[14px] truncate" style={{ color: 'var(--fg)' }}>{post.title}</p>
                  {isNew(post.date) && (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ color: 'var(--accent-post)', background: 'color-mix(in srgb, var(--accent-post) 14%, transparent)' }}>
                      NEW
                    </span>
                  )}
                </div>
                <p className="body-sm truncate" style={{ color: 'var(--fg-3)' }}>{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-mono text-[11px] hidden sm:block" style={{ color: 'var(--fg-3)' }}>{post.date}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: 'var(--fg-3)' }}>
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} onClick={() => setSelected(null)} />

            <motion.div className="fixed inset-0 z-50 overflow-y-auto"
              ref={scrollRef} onScroll={onScroll}
              style={{ background: 'var(--bg)' }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>

              <div className="fixed top-0 left-0 right-0 z-10 h-[2px]" style={{ background: 'var(--border)' }}>
                <motion.div className="h-full"
                  style={{ background: `linear-gradient(90deg, ${selected.gradient[0]}, ${selected.gradient[1]})`, width: `${progress * 100}%` }}
                  transition={{ duration: 0.1 }} />
              </div>

              {/* ── İçindekiler (TOC) — geniş ekranlarda solda sabit ── */}
              {toc.length > 1 && (
                <nav className="hidden xl:block fixed top-1/2 left-6 -translate-y-1/2 z-10 max-w-[200px]"
                  aria-label="İçindekiler">
                  <span className="font-mono text-[9px] uppercase tracking-widest block mb-3" style={{ color: 'var(--fg-3)' }}>
                    {lang === 'tr' ? '# içindekiler' : '# contents'}
                  </span>
                  <ul className="space-y-1.5">
                    {toc.map(t => (
                      <li key={t.i}>
                        <button onClick={() => goToSection(t.i)}
                          className="text-left font-mono text-[11px] leading-snug transition-colors block truncate w-full"
                          style={{
                            color: activeSec === t.i ? 'var(--accent)' : 'var(--fg-3)',
                            paddingLeft: t.type === 'h3' ? 12 : 0,
                            fontWeight: activeSec === t.i ? 600 : 400,
                          }}
                          title={t.text}>
                          {t.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <div className="max-w-2xl mx-auto pt-14 pb-28 px-5 md:px-8">
                <div className="flex items-center justify-between mb-14">
                  <button onClick={() => setSelected(null)}
                    className="flex items-center gap-2 font-mono text-[11px] transition-opacity hover:opacity-100"
                    style={{ color: 'var(--fg-3)', opacity: 0.75 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    /logs
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>{currentIndex + 1} / {visiblePosts.length}</span>
                    <button onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: 'var(--surface)', color: 'var(--fg-3)', border: '1px solid var(--border)' }}
                      aria-label="Close">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div key={selected.slug} custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}>
                    <div className="mb-12">
                      {selected.cover && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={selected.cover} alt="" className="w-full rounded-2xl mb-7"
                          style={{ border: '1px solid var(--border)', maxHeight: 360, objectFit: 'cover' }} />
                      )}
                      <div className="w-14 h-14 rounded-2xl mb-7 flex items-center justify-center text-2xl"
                        style={{ background: `linear-gradient(135deg, ${selected.gradient[0]}, ${selected.gradient[1]})` }}>
                        {selected.symbol}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {selected.tags.map(tag => (
                          <span key={tag} className="tag tag-accent font-mono text-[10px]">{tag}</span>
                        ))}
                      </div>
                      <h1 className="display-lg mb-4" style={{ color: 'var(--fg)' }}>{selected.title}</h1>
                      <div className="flex items-center gap-2.5 font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
                        <span>{new Date(selected.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>·</span>
                        <span>{selected.readTime} min</span>
                      </div>
                      <p className="body-md mt-5 pl-4 max-w-lg"
                        style={{ color: 'var(--fg-2)', borderLeft: '2px solid var(--border)' }}>
                        {selected.excerpt}
                      </p>
                    </div>

                    <div className="divider mb-10" />

                    <div>{selected.content.map((block, i) => (
                      <div key={i} id={`sec-${i}`} style={{ scrollMarginTop: 90 }}>
                        <Block block={block} index={i} />
                      </div>
                    ))}</div>
                  </motion.div>
                </AnimatePresence>

                {related.length > 0 ? (
                  /* ── İlgili yazılar (aynı etiketten) ── */
                  <div className="mt-16 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2.5 mb-5">
                      <span className="method-get">GET</span>
                      <span className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>
                        {lang === 'tr' ? '/related — bunları da oku' : '/related — read these too'}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {related.map(p => (
                        <button key={p.slug} onClick={() => goTo(p, 0)}
                          className="group flex flex-col gap-2 p-4 rounded-xl border text-left transition-all duration-200"
                          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                          {p.cover ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={p.cover} alt="" loading="lazy"
                              className="w-8 h-8 rounded-lg object-cover"
                              style={{ border: '1px solid var(--border)' }} />
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                              style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}>
                              {p.symbol}
                            </div>
                          )}
                          <span className="body-sm font-medium line-clamp-2" style={{ color: 'var(--fg-2)' }}>{p.title}</span>
                          <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>{p.readTime} min</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ── İlgili yoksa: önceki / sonraki ── */
                  <div className="mt-16 pt-8 grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--border)' }}>
                    {hasPrev ? (
                      <button onClick={() => goTo(visiblePosts[currentIndex - 1], -1)}
                        className="group flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all duration-200"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                        <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: 'var(--fg-3)' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                          Previous
                        </span>
                        <span className="body-sm font-medium line-clamp-2" style={{ color: 'var(--fg-2)' }}>{visiblePosts[currentIndex - 1].title}</span>
                      </button>
                    ) : <div />}
                    {hasNext ? (
                      <button onClick={() => goTo(visiblePosts[currentIndex + 1], 1)}
                        className="group flex flex-col gap-1.5 p-4 rounded-xl border text-right ml-auto w-full transition-all duration-200"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                        <span className="font-mono text-[10px] flex items-center justify-end gap-1" style={{ color: 'var(--fg-3)' }}>
                          Next
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                        </span>
                        <span className="body-sm font-medium line-clamp-2" style={{ color: 'var(--fg-2)' }}>{visiblePosts[currentIndex + 1].title}</span>
                      </button>
                    ) : <div />}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
