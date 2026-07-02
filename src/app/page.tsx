'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT, useLang } from '@/lib/i18n';
import { usePageContent } from '@/lib/use-page-content';
import ApiDemo from '@/components/ApiDemo';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';

const fade = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0  },
  transition: { delay, duration: 0.7, ease: [0.23, 1, 0.32, 1] as const },
});

const PHOTOS = [
  '/photos/1758641024787.png',
  '/photos/181980218.jpg',
  '/photos/482796749_1712698422644812_3597903296951852725_n.jpg',
];

/**
 * The hero name. Hovering it reveals a small photo card that follows the
 * cursor (spring-lagged) and cycles through the photos. Fixed-positioned and
 * pointer-events-none, so it never touches layout — the page reads identically
 * when nothing is hovered. Disabled below md (no hover on touch).
 */
function NameReveal() {
  const [hover, setHover] = useState(false);
  const [tapOpen, setTapOpen] = useState(false);   // mobile: tap the name to reveal
  const [idx, setIdx]     = useState(0);

  const x  = useMotionValue(0);
  const y  = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  // Cycle through photos while the reveal is active (hover on desktop, tap on mobile).
  useEffect(() => {
    if (!hover && !tapOpen) return;
    const id = setInterval(() => setIdx(i => (i + 1) % PHOTOS.length), 750);
    return () => clearInterval(id);
  }, [hover, tapOpen]);

  const track = (e: React.MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };

  return (
    <>
      <div className="relative inline-block mb-5">
        <h1
          onMouseEnter={(e) => { track(e); setHover(true); }}
          onMouseMove={track}
          onMouseLeave={() => setHover(false)}
          onClick={() => setTapOpen(o => !o)}
          className="display-xl inline-block cursor-pointer select-none"
          style={{ color: 'var(--fg)' }}
        >
          Ömer Faruk<br />
          <span className="relative inline-block">
            Yıldız.
            {/* Mobile-only affordance: a soft pulsing dot hinting the name is tappable */}
            <motion.span
              className="md:hidden absolute -right-3 top-1 w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
          </span>
        </h1>

        {/* Mobile reveal — appears to the right of the name; tap the name again to hide */}
        <AnimatePresence>
          {tapOpen && (
            <motion.div
              key="mobile-card"
              initial={{ opacity: 0, scale: 0.85, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: -8 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="md:hidden pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 w-[110px] h-[110px]"
              aria-hidden
            >
              <AnimatePresence>
                <motion.img
                  key={idx}
                  src={PHOTOS[idx]}
                  alt="Ömer Faruk Yıldız"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  style={{
                    border: '1px solid var(--border)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
                  }}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cursor-following reveal — desktop only, fixed, never affects layout */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block"
        style={{ x: sx, y: sy }}
        aria-hidden
      >
        <div style={{ transform: 'translate(28px, -50%)' }}>
          <AnimatePresence>
            {hover && (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-[160px] h-[160px]"
              >
                <AnimatePresence>
                  <motion.img
                    key={idx}
                    src={PHOTOS[idx]}
                    alt=""
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                    style={{
                      border: '1px solid var(--border)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
                    }}
                  />
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </>
  );
}

function EndpointCard({
  method, path, desc, href, delay = 0,
}: {
  method: string; path: string; desc: string; href: string; delay?: number;
}) {
  const isPost = method === 'POST';

  return (
    <motion.div {...fade(delay)}>
      <Link href={href}>
        <motion.div
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.985 }}
          className="group flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <span className={isPost ? 'method-post' : 'method-get'}>{method}</span>

          <span
            className="font-mono text-[13px] font-medium tracking-tight flex-shrink-0"
            style={{ color: 'var(--fg)' }}
          >
            {path}
          </span>

          <span
            className="text-sm flex-1 truncate hidden sm:block"
            style={{ color: 'var(--fg-3)' }}
          >
            {desc}
          </span>

          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: 'var(--fg-3)' }}
          >
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const t  = useT();
  const { lang } = useLang();
  const tr = lang === 'tr';
  const live = usePageContent('home');
  const th = {
    ...t.home,
    ...(live ?? {}),
    endpoints: { ...t.home.endpoints, ...(live?.endpoints ?? {}) },
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 md:px-8 pt-28 pb-24">
      <div className="w-full max-w-2xl mx-auto">

        {/* Hero */}
        <motion.div {...fade(0.1)} className="mb-14">
          <div className="flex items-center gap-2 mb-8">
            <span className="status-dot" />
            <span className="font-mono text-[11px] tracking-wide" style={{ color: 'var(--fg-3)' }}>
              {th.status}
            </span>
          </div>

          <NameReveal />

          <p className="body-lg max-w-md" style={{ color: 'var(--fg-2)' }}>
            {th.subtitle}{' '}
            <span style={{ color: 'var(--fg)' }}>{th.subtitleAccent}</span>
          </p>

          <p className="font-mono text-[12px] mt-4" style={{ color: 'var(--fg-3)' }}>
            {th.role}
          </p>
        </motion.div>

        {/* Live API response — reinforces the API/terminal motif */}
        <motion.div {...fade(0.2)} className="mb-10">
          <p className="label mb-4" style={{ color: 'var(--fg-3)' }}>
            {tr ? '// CANLI YANIT' : '// LIVE RESPONSE'}
          </p>
          <ApiDemo />
        </motion.div>

        {/* API Routes — the signature element */}
        <motion.div {...fade(0.25)} className="mb-10">
          <p className="label mb-4" style={{ color: 'var(--fg-3)' }}>
            {th.sectionRoutes}
          </p>

          <div className="flex flex-col gap-2">
            <EndpointCard method="GET"  path="/api/experience" desc={th.endpoints.experience}                             href="/experience" delay={0.30} />
            <EndpointCard method="GET"  path="/api/skills"     desc={th.endpoints.skills}                                 href="/skills"     delay={0.36} />
            <EndpointCard method="GET"  path="/api/projects"   desc={th.endpoints.projects}                               href="/projects"   delay={0.42} />
            <EndpointCard method="GET"  path="/api/logs"       desc={th.endpoints.feed}                                                                                              href="/logs"      delay={0.48} />
            <EndpointCard method="POST" path="/api/contact"    desc={th.endpoints.contact}                                href="/contact"    delay={0.54} />
          </div>
        </motion.div>

        {/* System architecture — interactive data-flow diagram */}
        <motion.div {...fade(0.6)} className="mb-10">
          <p className="label mb-1.5" style={{ color: 'var(--fg-3)' }}>
            {tr ? '// SİSTEM MİMARİSİ' : '// SYSTEM ARCHITECTURE'}
          </p>
          <p className="body-sm mb-4" style={{ color: 'var(--fg-3)' }}>
            {tr
              ? 'Verinin SAP, servisler ve operasyon arasında nasıl aktığı — sürükle, yakınlaştır.'
              : 'How data flows between SAP, services and operations — drag, zoom.'}
          </p>
          <ArchitectureDiagram />
        </motion.div>

        {/* Tags */}
        <motion.div {...fade(0.72)} className="flex flex-wrap gap-2">
          {th.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </motion.div>

      </div>
    </main>
  );
}
