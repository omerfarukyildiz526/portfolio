'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT, useLang } from '@/lib/i18n';
import type { SkillsContent } from '@/lib/skills-content';

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.07, duration: 0.55, ease: [0.23, 1, 0.32, 1] as const },
});

function TechGroup({
  title, libs, delay, libCount,
}: {
  title: string;
  libs: ReadonlyArray<{ name: string; sub: ReadonlyArray<string> }>;
  delay: number;
  libCount: (n: number) => string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="card w-full p-6 text-left group"
        aria-expanded={open}
      >
        {/* Subtle accent top edge */}
        <div
          className="h-px mb-5 transition-opacity duration-300"
          style={{ background: 'var(--accent)', opacity: open ? 0.4 : 0.15 }}
        />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="display-md" style={{ color: 'var(--fg)' }}>{title}</h3>
            <p className="font-mono text-[11px] mt-1" style={{ color: 'var(--fg-3)' }}>{libCount(libs.length)}</p>
          </div>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300"
            style={{
              background: 'var(--surface)',
              border:     '1px solid var(--border)',
              color:      'var(--fg-3)',
              transform:  open ? 'rotate(45deg)' : 'none',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </span>
        </div>

        {/* Collapsed: dot list */}
        {!open && (
          <div className="flex flex-col gap-2">
            {libs.map((lib) => (
              <div key={lib.name} className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--fg-3)' }} />
                <span className="body-sm" style={{ color: 'var(--fg-2)' }}>{lib.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expanded: cards with sub-items */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
            >
              {libs.map((lib) => (
                <div
                  key={lib.name}
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <p className="font-semibold body-sm mb-1.5" style={{ color: 'var(--fg)' }}>{lib.name}</p>
                  <p className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>
                    {lib.sub.join(' · ')}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export default function SkillsPage() {
  const t  = useT();
  const { lang } = useLang();

  // Düzenlenebilir içerik DB'den gelir; gelene kadar translations'taki statik
  // değerler kullanılır (sayfa hiçbir zaman boş kalmaz).
  const [content, setContent] = useState<SkillsContent | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/skills', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (alive && d?.content) setContent(d.content); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Statik (pageRoute, pageTag, libCount) translations'tan; düzenlenebilir
  // alanlar DB'den (varsa) gelir.
  const live = content?.[lang];
  const ts = {
    ...t.skills,
    pageTitle:        live?.pageTitle        ?? t.skills.pageTitle,
    pageDesc:         live?.pageDesc         ?? t.skills.pageDesc,
    sectionMarquee:   live?.sectionMarquee   ?? t.skills.sectionMarquee,
    sectionStack:     live?.sectionStack     ?? t.skills.sectionStack,
    responsibilities: live?.responsibilities ?? t.skills.responsibilities,
    techCards:        live?.techCards        ?? t.skills.techCards,
  };

  return (
    <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <span className="method-get">GET</span>
            <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>{ts.pageRoute}</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>→ 200 OK</span>
          </div>
          <h1 className="display-lg mb-3" style={{ color: 'var(--fg)' }}>{ts.pageTitle}</h1>
          <p className="body-md max-w-lg" style={{ color: 'var(--fg-2)' }}>{ts.pageDesc}</p>
        </motion.div>

        {/* ── Responsibilities — quiet scrolling marquee ── */}
        <section className="mb-20">
          <p className="label mb-6">{ts.sectionMarquee}</p>

          <div
            className="overflow-hidden"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
          >
            <div className="marquee-track py-1">
              {[...ts.responsibilities, ...ts.responsibilities].map((r, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 p-4 rounded-xl border"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <span
                    className="font-mono text-[9px] font-bold uppercase tracking-widest block mb-2"
                    style={{ color: 'var(--accent)' }}
                  >
                    {r.icon}
                  </span>
                  <p className="font-medium body-sm mb-2" style={{ color: 'var(--fg)' }}>{r.title}</p>
                  <div className="flex flex-wrap gap-1">
                    {r.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                        style={{
                          background: 'var(--surface)',
                          color: 'var(--fg-3)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section>
          <p className="label mb-8">{ts.sectionStack}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ts.techCards.map((card, i) => (
              <TechGroup
                key={card.title}
                title={card.title}
                delay={0.05 + i * 0.07}
                libs={card.libs}
                libCount={ts.libCount}
              />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
