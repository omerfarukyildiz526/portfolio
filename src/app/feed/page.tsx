'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { POSTS, Post, ContentBlock } from '@/lib/posts';


// ── Kod bloğu (kopyala butonu ile) ───────────────────────────────────────────
function CodeBlock({ block, index }: { block: ContentBlock; index: number }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(block.text ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.03, duration: 0.4 }}
      className="my-5 rounded-lg overflow-hidden border"
      style={{ borderColor: 'rgba(48,54,61,1)', background: '#0d1117' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'rgba(48,54,61,1)', background: '#090d12' }}
      >
        <span className="text-[10px] font-mono tracking-widest" style={{ color: '#8b949e' }}>
          {block.lang || 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest transition-colors px-2 py-0.5 rounded"
          style={{
            color: copied ? '#4ade80' : 'rgba(255,255,255,0.25)',
            background: copied ? 'rgba(74,222,128,0.08)' : 'transparent',
          }}
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Kopyalandı
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Kopyala
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed"
           style={{ fontFamily: 'var(--font-jetbrains, monospace)', color: '#e6edf3' }}>
        <code>{block.text}</code>
      </pre>
    </motion.div>
  );
}

// ── İçerik blokları ───────────────────────────────────────────────────────────
function Block({ block, index }: { block: ContentBlock; index: number }) {
  const delay = 0.1 + index * 0.03;
  const dur   = 0.4;

  if (block.type === 'code') return <CodeBlock block={block} index={index} />;

  switch (block.type) {
    case 'h2': return (
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: dur }}
        className="text-lg md:text-xl font-black uppercase tracking-tight text-white mt-10 mb-3">{block.text}</motion.h2>
    );
    case 'h3': return (
      <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: dur }}
        className="text-base font-bold uppercase tracking-tight text-white/90 mt-7 mb-2">{block.text}</motion.h3>
    );
    case 'p': return (
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: dur }}
        className="text-sm leading-loose text-white/55 mb-4">{block.text}</motion.p>
    );
    case 'list': return (
      <motion.ul initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: dur }}
        className="mb-4 space-y-2 pl-0">
        {block.items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-white/55">
            <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#4488ff' }} />
            {item}
          </li>
        ))}
      </motion.ul>
    );
    case 'note': return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: dur }}
        className="my-5 p-4 rounded-lg text-sm text-white/60 leading-loose"
        style={{ background: 'rgba(68,136,255,0.05)', border: '1px solid rgba(68,136,255,0.15)', borderLeft: '3px solid rgba(68,136,255,0.5)' }}>
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest block mb-2" style={{ color: '#4488ff' }}>Not</span>
        {block.text}
      </motion.div>
    );
    default: return null;
  }
}

// ── Ana sayfa ─────────────────────────────────────────────────────────────────
const slideVariants = {
  enter:  (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir * -48, opacity: 0 }),
};

export default function FeedPage() {
  const [selected,    setSelected]    = useState<Post | null>(null);
  const [flippingSlug, setFlippingSlug] = useState<string | null>(null);
  const [progress,    setProgress]    = useState(0);
  const [direction,   setDirection]   = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredPosts = POSTS;
  const currentIndex  = selected ? POSTS.findIndex((p) => p.slug === selected.slug) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < POSTS.length - 1;

  // Progress bar
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setProgress(isNaN(pct) ? 0 : Math.min(1, Math.max(0, pct)));
  }, []);

  // Reset scroll when post changes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setProgress(0);
  }, [selected?.slug]);

  // ESC ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const open = useCallback((post: Post) => {
    if (flippingSlug) return;
    setFlippingSlug(post.slug);
    setTimeout(() => { setSelected(post); setFlippingSlug(null); setDirection(0); }, 220);
  }, [flippingSlug]);

  const close = () => setSelected(null);

  const goTo = (post: Post, dir: number) => {
    setDirection(dir);
    setSelected(post);
  };

  return (
    <main className="min-h-screen pt-24 pb-16">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="px-8 md:px-14 lg:px-24 xl:px-32 mb-5 flex items-center justify-between"
        style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black text-[#4488ff] uppercase tracking-widest">GET</span>
          <span className="text-[11px] text-white/25">/api/feed</span>
          <span className="ml-2 text-[10px] text-[#4488ff]/50">→ 200 OK</span>
        </div>
        <span className="text-[10px] text-white/20">{POSTS.length} yazı</span>
      </motion.div>

      {/* ── Grid ── */}
      <div className="px-8 md:px-14 lg:px-24 xl:px-32">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
             style={{ perspective: '1200px' }}>
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: flippingSlug === post.slug ? 0 : 1,
                  rotateY: flippingSlug === post.slug ? 90 : 0,
                  scale:   flippingSlug === post.slug ? 0.9 : 1,
                }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={
                  flippingSlug === post.slug
                    ? { duration: 0.22, ease: [0.4, 0, 1, 1] }
                    : { delay: i * 0.04, duration: 0.35, ease: [0.23, 1, 0.32, 1] }
                }
                onClick={() => open(post)}
                className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
                     style={{ background: `linear-gradient(135deg, ${post.gradient[0]} 0%, ${post.gradient[1]} 100%)` }} />
                <div className="absolute inset-0 opacity-[0.035]"
                     style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-10 group-hover:scale-125">
                  <span className="text-3xl md:text-4xl select-none">{post.symbol}</span>
                </div>
                <div className="absolute inset-0 flex flex-col justify-between p-3 md:p-4 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[7px] md:text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(68,136,255,0.2)', color: '#4488ff', border: '1px solid rgba(68,136,255,0.25)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-tight text-white leading-snug mb-1">{post.title}</h3>
                    <div className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                      <span className="text-[8px] text-white/35">{post.readTime} dk</span>
                      <span className="text-white/15">·</span>
                      <span className="text-[8px] text-white/35">
                        {new Date(post.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 border border-white/[0.04] pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Açılmış yazı ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={close}
            />

            <motion.div
              className="fixed inset-0 z-50 overflow-y-auto"
              ref={scrollRef}
              onScroll={onScroll}
              style={{ background: 'var(--bg)', transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0,   opacity: 1 }}
              exit={{   rotateY:  90,  opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Progress bar */}
              <div className="fixed top-0 left-0 right-0 z-10 h-[2px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  className="h-full"
                  style={{ background: `linear-gradient(90deg, ${selected.gradient[0]}, ${selected.gradient[1]})`, width: `${progress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <div className="max-w-2xl mx-auto pt-14 pb-24 px-6 md:px-8">

                {/* Üst bar */}
                <div className="flex items-center justify-between mb-12">
                  <button onClick={close}
                    className="inline-flex items-center gap-2 transition-colors"
                    style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    /feed
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-white/15" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                      {currentIndex + 1} / {POSTS.length}
                    </span>
                    <button onClick={close}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* İçerik (slide animasyonu) */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={selected.slug}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {/* Header */}
                    <div className="mb-10">
                      <div className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                           style={{ background: `linear-gradient(135deg, ${selected.gradient[0]}, ${selected.gradient[1]})` }}>
                        <span className="text-2xl">{selected.symbol}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {selected.tags.map((tag) => (
                          <span key={tag} className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded"
                                style={{ background: 'rgba(68,136,255,0.08)', color: '#4488ff', border: '1px solid rgba(68,136,255,0.18)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h1 className="font-black uppercase tracking-tight text-white leading-none mb-3"
                          style={{ fontSize: 'clamp(22px, 4vw, 40px)' }}>
                        {selected.title}
                      </h1>
                      <div className="flex items-center gap-2.5" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                        <span className="text-[10px] text-white/30">
                          {new Date(selected.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-white/15">·</span>
                        <span className="text-[10px] text-white/30">{selected.readTime} dakika okuma</span>
                      </div>
                      <p className="text-sm text-white/35 mt-4 leading-loose max-w-xl pl-4"
                         style={{ borderLeft: '2px solid rgba(255,255,255,0.07)' }}>
                        {selected.excerpt}
                      </p>
                    </div>

                    <div className="h-px mb-10" style={{ background: 'rgba(255,255,255,0.05)' }} />

                    {/* İçerik blokları */}
                    <div>
                      {selected.content.map((block, i) => (
                        <Block key={i} block={block} index={i} />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* ── Önceki / Sonraki ── */}
                <div className="mt-16 pt-8 grid grid-cols-2 gap-4"
                     style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {hasPrev ? (
                    <button
                      onClick={() => goTo(POSTS[currentIndex - 1], -1)}
                      className="group flex flex-col gap-1 p-4 rounded-xl border border-white/6 hover:border-white/14 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200 text-left"
                    >
                      <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest flex items-center gap-1">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        Önceki
                      </span>
                      <span className="text-[11px] font-bold text-white/50 group-hover:text-white/80 transition-colors leading-snug line-clamp-2">
                        {POSTS[currentIndex - 1].title}
                      </span>
                    </button>
                  ) : <div />}

                  {hasNext ? (
                    <button
                      onClick={() => goTo(POSTS[currentIndex + 1], 1)}
                      className="group flex flex-col gap-1 p-4 rounded-xl border border-white/6 hover:border-white/14 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200 text-right ml-auto w-full"
                    >
                      <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest flex items-center gap-1 justify-end">
                        Sonraki
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                      </span>
                      <span className="text-[11px] font-bold text-white/50 group-hover:text-white/80 transition-colors leading-snug line-clamp-2">
                        {POSTS[currentIndex + 1].title}
                      </span>
                    </button>
                  ) : <div />}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
