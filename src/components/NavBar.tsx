'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n';

const ROUTES = [
  { path: '/',           method: 'GET',  label: '/home'       },
  { path: '/experience', method: 'GET',  label: '/experience' },
  { path: '/skills',     method: 'GET',  label: '/skills'     },
  { path: '/projects',   method: 'GET',  label: '/projects'   },
  { path: '/feed',       method: 'GET',  label: '/feed'       },
  { path: '/contact',    method: 'POST', label: '/contact'    },
];

export default function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === 'light';

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="nav-bar fixed top-0 left-0 right-0 z-50 h-14"
    >
      <div className="max-w-[1400px] mx-auto h-full px-5 md:px-8 flex items-center gap-1">

        {/* Routes */}
        <nav className="flex items-center gap-0.5 flex-1" aria-label="Primary navigation">
          {ROUTES.map((r) => {
            const isActive = pathname === r.path;
            const isPost   = r.method === 'POST';

            return (
              <Link
                key={r.path}
                href={r.path}
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    background: isActive ? (isPost ? 'color-mix(in srgb, var(--accent-post) 10%, transparent)' : 'color-mix(in srgb, var(--accent) 10%, transparent)') : 'transparent',
                  }}
                >
                  {/* Method badge — monospace, intentional */}
                  <span
                    className="hidden sm:inline font-mono text-[9px] font-bold tracking-wider uppercase leading-none px-1.5 py-0.5 rounded"
                    style={{
                      color:      isPost ? 'var(--accent-post)' : 'var(--accent)',
                      background: isPost
                        ? 'color-mix(in srgb, var(--accent-post) 12%, transparent)'
                        : 'color-mix(in srgb, var(--accent) 12%, transparent)',
                      opacity: isActive ? 1 : 0.55,
                    }}
                  >
                    {r.method}
                  </span>

                  {/* Route path — monospace, intentional */}
                  <span
                    className="font-mono text-[11px] tracking-tight hidden md:inline"
                    style={{
                      color:   isActive ? 'var(--fg)' : 'var(--fg-2)',
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {r.label}
                  </span>

                  {/* Mobile: short label only */}
                  <span
                    className="font-mono text-[10px] tracking-tight md:hidden"
                    style={{ color: isActive ? 'var(--fg)' : 'var(--fg-3)' }}
                  >
                    {r.label.replace('/', '')}
                  </span>
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* Utilities */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Language toggle */}
          <div
            className="flex items-center rounded-md overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}
          >
            {(['tr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-150"
                style={{
                  background: lang === l ? 'var(--fg)' : 'transparent',
                  color:      lang === l ? 'var(--bg)' : 'var(--fg-3)',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              color:        'var(--fg-3)',
            }}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLight ? (
              /* Moon */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              /* Sun */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
