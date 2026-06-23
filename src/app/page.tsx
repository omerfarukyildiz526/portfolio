'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n';

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
  const [idx, setIdx]     = useState(0);

  const x  = useMotionValue(0);
  const y  = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  // Cycle through photos only while hovering.
  useEffect(() => {
    if (!hover) return;
    const id = setInterval(() => setIdx(i => (i + 1) % PHOTOS.length), 750);
    return () => clearInterval(id);
  }, [hover]);

  const track = (e: React.MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };

  return (
    <>
      <h1
        onMouseEnter={(e) => { track(e); setHover(true); }}
        onMouseMove={track}
        onMouseLeave={() => setHover(false)}
        className="display-xl mb-5 inline-block"
        style={{ color: 'var(--fg)' }}
      >
        Ömer Faruk<br />Yıldız.
      </h1>

      {/* Cursor-following reveal — fixed, never affects layout */}
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
                className="relative w-[150px] h-[190px]"
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
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
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
  const th = t.home;

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

        {/* API Routes — the signature element */}
        <motion.div {...fade(0.25)} className="mb-10">
          <p className="label mb-4" style={{ color: 'var(--fg-3)' }}>
            {th.sectionRoutes}
          </p>

          <div className="flex flex-col gap-2">
            <EndpointCard method="GET"  path="/api/experience" desc={th.endpoints.experience}                             href="/experience" delay={0.30} />
            <EndpointCard method="GET"  path="/api/skills"     desc={th.endpoints.skills}                                 href="/skills"     delay={0.36} />
            <EndpointCard method="GET"  path="/api/projects"   desc={th.endpoints.projects}                               href="/projects"   delay={0.42} />
            <EndpointCard method="GET"  path="/api/feed"       desc={th.endpoints.feed}                                                                                              href="/feed"      delay={0.48} />
            <EndpointCard method="POST" path="/api/contact"    desc={th.endpoints.contact}                                href="/contact"    delay={0.54} />
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div {...fade(0.62)} className="flex flex-wrap gap-2">
          {th.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </motion.div>

      </div>
    </main>
  );
}
