'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
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
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Logo: tek tık → ana sayfa, çift tık → gizli panel girişi.
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLogoClick = () => {
    if (logoTimer.current) {
      clearTimeout(logoTimer.current);
      logoTimer.current = null;
      router.push('/admin');
    } else {
      logoTimer.current = setTimeout(() => {
        logoTimer.current = null;
        router.push('/');
      }, 240);
    }
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const isLight = mounted && theme === 'light';

  const istanbulTime = now
    ? new Intl.DateTimeFormat('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now)
    : '';

  // Mobilde sol boşluğu dolduran, o anki sayfanın API rota göstergesi.
  const current  = ROUTES.find(r => r.path === pathname);
  const apiPath  = current ? (current.path === '/' ? '/api' : `/api${current.path}`) : '';
  const isPostCur = current?.method === 'POST';
  const statusCur = isPostCur ? '201 Created' : '200 OK';

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="nav-bar fixed top-0 left-0 right-0 z-50 h-14"
    >
      <div className="max-w-[1400px] mx-auto h-full px-3 md:px-8 flex items-center gap-1">

        {/* Brand logo — tüm ekranlar. Tek tık: ana sayfa · çift tık: panel */}
        <button onClick={onLogoClick} aria-label="Ana sayfa" title="Ana sayfa"
          className="flex flex-shrink-0 mr-2 md:mr-2.5 items-center" style={{ background: 'transparent' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img src="/logo.png" alt="Ömer Faruk Yıldız" width={32} height={32}
            className="w-8 h-8 rounded-full"
            style={{ border: '1px solid var(--border)' }}
            whileHover={{ scale: 1.08 }}
            animate={{ boxShadow: [
              '0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent)',
              '0 0 13px 3px color-mix(in srgb, var(--accent) 60%, transparent)',
              '0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent)',
            ] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
        </button>

        {/* Routes — desktop only (mobile uses the hamburger menu) */}
        <div className="relative flex-1 min-w-0">
          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-hide" aria-label="Primary navigation">
            {ROUTES.map((r) => {
              const isActive = pathname === r.path;
              const isPost   = r.method === 'POST';

              return (
                <Link
                  key={r.path}
                  href={r.path}
                  className="flex-shrink-0"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={r.label}
                >
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-md text-sm transition-colors"
                    style={{
                      background: isActive ? (isPost ? 'color-mix(in srgb, var(--accent-post) 10%, transparent)' : 'color-mix(in srgb, var(--accent) 10%, transparent)') : 'transparent',
                    }}
                  >
                    {/* Method badge */}
                    <span
                      className="font-mono text-[9px] font-bold tracking-wider uppercase leading-none px-1.5 py-0.5 rounded"
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

                    {/* Route path */}
                    <span
                      className="font-mono text-[11px] tracking-tight"
                      style={{
                        color:   isActive ? 'var(--fg)' : 'var(--fg-2)',
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {r.label}
                    </span>
                  </motion.span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile-only: current page's API route indicator (fills the left gap) */}
          {current && (
            <div className="md:hidden flex items-center gap-1.5 min-w-0 overflow-hidden">
              <span
                className="font-mono text-[9px] font-bold tracking-wider uppercase leading-none px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  color:      isPostCur ? 'var(--accent-post)' : 'var(--accent)',
                  background:  isPostCur
                    ? 'color-mix(in srgb, var(--accent-post) 12%, transparent)'
                    : 'color-mix(in srgb, var(--accent) 12%, transparent)',
                }}
              >
                {current.method}
              </span>
              <span className="font-mono text-[11px] tracking-tight truncate" style={{ color: 'var(--fg-2)' }}>
                {apiPath}
              </span>
              <span
                className="font-mono text-[10px] flex-shrink-0"
                style={{ color: isPostCur ? 'var(--accent-post)' : 'var(--accent)', opacity: 0.65 }}
              >
                → {statusCur}
              </span>
            </div>
          )}
        </div>

        {/* Utilities */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Language toggle */}
          <div
            className="flex items-center h-6 rounded-md overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}
          >
            {(['tr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="h-full px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-150"
                style={{
                  background: lang === l ? 'var(--fg)' : 'transparent',
                  color:      lang === l ? 'var(--bg)' : 'var(--fg-3)',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Istanbul clock — desktop only */}
          <div
            className="hidden md:flex items-center gap-1.5 leading-none rounded-md px-2.5 h-6 border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            aria-label="Istanbul saati"
          >
            <span
              className="font-mono text-[8px] uppercase tracking-widest"
              style={{ color: 'var(--fg-3)' }}
            >
              Istanbul, TR
            </span>
            <span
              className="font-mono text-[11px] font-bold tracking-wider tabular-nums"
              style={{ color: 'var(--fg)' }}
            >
              {istanbulTime || '--:--:--'}
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
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

          {/* Hamburger — mobile only, opens the route menu */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{
              background: menuOpen ? 'var(--fg)' : 'var(--surface)',
              border:     '1px solid var(--border)',
              color:      menuOpen ? 'var(--bg)' : 'var(--fg-3)',
            }}
            aria-label="Menü"
            aria-expanded={menuOpen}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu — backdrop + dropdown panel ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop (dışına dokununca kapanır) */}
            <motion.div
              className="md:hidden fixed inset-0 top-14"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Panel */}
            <motion.nav
              className="md:hidden absolute left-0 right-0 top-full origin-top overflow-hidden"
              style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              aria-label="Mobil menü"
            >
              <div className="px-5 py-3 flex flex-col">
                {ROUTES.map((r) => {
                  const isActive = pathname === r.path;
                  const isPost   = r.method === 'POST';
                  return (
                    <Link
                      key={r.path}
                      href={r.path}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className="flex items-center gap-3 py-3"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <span
                        className="font-mono text-[9px] font-bold tracking-wider uppercase leading-none px-1.5 py-0.5 rounded"
                        style={{
                          color:      isPost ? 'var(--accent-post)' : 'var(--accent)',
                          background:  isPost
                            ? 'color-mix(in srgb, var(--accent-post) 12%, transparent)'
                            : 'color-mix(in srgb, var(--accent) 12%, transparent)',
                          opacity: isActive ? 1 : 0.7,
                        }}
                      >
                        {r.method}
                      </span>
                      <span
                        className="font-mono text-[15px] tracking-tight"
                        style={{ color: isActive ? 'var(--fg)' : 'var(--fg-2)', fontWeight: isActive ? 600 : 400 }}
                      >
                        {r.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
