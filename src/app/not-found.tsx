'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const LINKS = [
  { method: 'GET', path: '/home', href: '/' },
  { method: 'GET', path: '/projects', href: '/projects' },
  { method: 'GET', path: '/logs', href: '/logs' },
  { method: 'POST', path: '/contact', href: '/contact' },
];

const LOG = [
  { t: '$ GET /unknown-route', c: 'var(--fg-2)' },
  { t: '> resolving endpoint…', c: 'var(--fg-3)' },
  { t: '> 404 NOT_FOUND', c: 'var(--accent-post)' },
];

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">

        {/* 404 — hafif glitch salınımı */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--fg-3)' }}>
            HTTP/1.1
          </span>
          <motion.span
            className="font-mono font-bold"
            style={{ fontSize: 'clamp(56px, 12vw, 96px)', color: 'var(--fg)', letterSpacing: '-0.04em', lineHeight: 1 }}
            animate={{
              textShadow: [
                '0 0 0 transparent',
                '2px 0 0 color-mix(in srgb, var(--accent) 70%, transparent), -2px 0 0 color-mix(in srgb, var(--accent-post) 70%, transparent)',
                '0 0 0 transparent',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.1, 0.2] }}
          >
            404
          </motion.span>
        </div>

        {/* Terminal log — satırlar sırayla belirir */}
        <div
          className="mx-auto mb-8 max-w-[300px] text-left rounded-lg px-4 py-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {LOG.map((l, i) => (
            <motion.div
              key={i}
              className="font-mono text-[12px] leading-relaxed"
              style={{ color: l.c }}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.5, duration: 0.3 }}
            >
              {l.t}
              {i === LOG.length - 1 && <span className="cursor-blink"> ▋</span>}
            </motion.div>
          ))}
        </div>

        <p className="body-md mb-8" style={{ color: 'var(--fg-2)' }}>
          İstediğin sayfa yok veya taşınmış. Aşağıdaki rotalardan biriyle devam et.
        </p>

        {/* Gerçek rotalara bağlantılar */}
        <div className="grid grid-cols-2 gap-2">
          {LINKS.map((r, i) => (
            <motion.div
              key={r.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.08, duration: 0.35 }}
            >
              <Link
                href={r.href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <span className={r.method === 'POST' ? 'method-post' : 'method-get'}>{r.method}</span>
                <span className="font-mono text-[12px]" style={{ color: 'var(--fg-2)' }}>{r.path}</span>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
