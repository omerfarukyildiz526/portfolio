'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { POSTS, Post, ContentBlock } from '@/lib/posts';
import { useLang } from '@/lib/i18n';

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
        <code>{block.text}</code>
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
        className="body-md mb-4" style={{ color: 'var(--fg-2)' }}>{block.text}</motion.p>
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
        {block.text}
      </motion.div>
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
  const [selected,  setSelected]  = useState<Post | null>(null);
  const [progress,  setProgress]  = useState(0);
  const [direction, setDirection] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentIndex = selected ? POSTS.findIndex(p => p.slug === selected.slug) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < POSTS.length - 1;

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setProgress(isNaN(pct) ? 0 : Math.min(1, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setProgress(0);
  }, [selected?.slug]);

  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  const goTo = (post: Post, dir: number) => { setDirection(dir); setSelected(post); };

  return (
    <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} className="mb-16">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="method-get">GET</span>
            <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>/api/feed</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>→ 200 OK</span>
          </div>
          <h1 className="display-lg mb-3" style={{ color: 'var(--fg)' }}>FEED.</h1>
          <p className="body-md" style={{ color: 'var(--fg-2)' }}>
            {lang === 'tr'
              ? 'Mühendislik notları — çözüp bir yere yazmak istediğim şeyler.'
              : 'Engineering notes — things I worked out and wanted written down.'}
          </p>
        </motion.div>

        <div className="space-y-3">
          {POSTS.map((post, i) => (
            <motion.button key={post.slug}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => { setDirection(0); setSelected(post); }}
              className="w-full text-left flex items-center gap-5 p-5 rounded-xl border transition-all duration-200 group"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}>
                {post.symbol}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] truncate mb-1" style={{ color: 'var(--fg)' }}>{post.title}</p>
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

              <div className="max-w-2xl mx-auto pt-14 pb-28 px-5 md:px-8">
                <div className="flex items-center justify-between mb-14">
                  <button onClick={() => setSelected(null)}
                    className="flex items-center gap-2 font-mono text-[11px] transition-opacity hover:opacity-100"
                    style={{ color: 'var(--fg-3)', opacity: 0.75 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    /feed
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>{currentIndex + 1} / {POSTS.length}</span>
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

                    <div>{selected.content.map((block, i) => <Block key={i} block={block} index={i} />)}</div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-16 pt-8 grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--border)' }}>
                  {hasPrev ? (
                    <button onClick={() => goTo(POSTS[currentIndex - 1], -1)}
                      className="group flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all duration-200"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                      <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: 'var(--fg-3)' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                        Previous
                      </span>
                      <span className="body-sm font-medium line-clamp-2" style={{ color: 'var(--fg-2)' }}>{POSTS[currentIndex - 1].title}</span>
                    </button>
                  ) : <div />}
                  {hasNext ? (
                    <button onClick={() => goTo(POSTS[currentIndex + 1], 1)}
                      className="group flex flex-col gap-1.5 p-4 rounded-xl border text-right ml-auto w-full transition-all duration-200"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                      <span className="font-mono text-[10px] flex items-center justify-end gap-1" style={{ color: 'var(--fg-3)' }}>
                        Next
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                      </span>
                      <span className="body-sm font-medium line-clamp-2" style={{ color: 'var(--fg-2)' }}>{POSTS[currentIndex + 1].title}</span>
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
