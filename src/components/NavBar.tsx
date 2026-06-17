'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ROUTES = [
  { path: '/',            method: 'GET',  label: '/home' },
  { path: '/experience',  method: 'GET',  label: '/experience' },
  { path: '/skills',      method: 'GET',  label: '/skills' },
  { path: '/projects',    method: 'GET',  label: '/projects' },
  { path: '/feed',        method: 'GET',  label: '/feed' },
  { path: '/contact',     method: 'POST', label: '/contact' },
];

const METHOD_COLOR: Record<string, string> = {
  GET:  '#4488ff',
  POST: '#ff8c42',
};

export default function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === 'light';

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-1.5 md:py-2 rounded-full border border-white/10 backdrop-blur-xl"
      style={{ background: 'var(--bg-card)', fontFamily: 'var(--font-jetbrains, monospace)' }}
    >
      {ROUTES.map((r) => {
        const isActive = pathname === r.path;
        const mc = METHOD_COLOR[r.method];
        return (
          <Link key={r.path} href={r.path}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-bold tracking-wide transition-all duration-200"
              style={{
                background: isActive ? mc + '18' : 'transparent',
                border: isActive ? `1px solid ${mc}40` : '1px solid transparent',
                boxShadow: isActive ? `0 0 14px ${mc}25` : 'none',
              }}
            >
              <span
                className="uppercase font-black text-[8px] md:text-[9px] tracking-widest"
                style={{ color: mc, opacity: isActive ? 1 : 0.5 }}
              >
                {r.method}
              </span>
              <span className="hidden sm:inline" style={{ color: isActive ? 'var(--fg)' : 'var(--dim)' }}>
                {r.label}
              </span>
            </motion.div>
          </Link>
        );
      })}

      <span className="w-px h-4 ml-1" style={{ background: 'var(--border)' }} />

      {/* Tema toggle */}
      <button
        onClick={() => setTheme(isLight ? 'dark' : 'light')}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ml-1"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--dim)',
        }}
        title={isLight ? 'Gece modu' : 'Gündüz modu'}
      >
        {isLight ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        )}
      </button>
    </motion.nav>
  );
}
