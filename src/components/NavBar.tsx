'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const ROUTES = [
  { path: '/',         method: 'GET',  label: '/home' },
  { path: '/skills',   method: 'GET',  label: '/skills' },
  { path: '/projects', method: 'GET',  label: '/projects' },
  { path: '/feed',     method: 'GET',  label: '/feed' },
  { path: '/contact',  method: 'POST', label: '/contact' },
];

const METHOD_COLOR: Record<string, string> = {
  GET:  '#4488ff',
  POST: '#ff8c42',
};

export default function NavBar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-1.5 md:py-2 rounded-full border border-white/10 backdrop-blur-xl"
      style={{ background: 'linear-gradient(135deg, rgba(10,15,46,0.7) 0%, rgba(26,36,84,0.6) 100%)', fontFamily: 'var(--font-jetbrains, monospace)' }}
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
              <span className="hidden sm:inline" style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)' }}>
                {r.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </motion.nav>
  );
}
