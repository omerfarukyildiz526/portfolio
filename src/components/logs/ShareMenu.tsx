'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/lib/i18n';

const SITE_URL = 'https://omerfarukyildiz.tech';

// Instagram'daki "..." menüsüne gönderme yapan küçük paylaş menüsü — /logs
// grid'inde ve ileride yazı detay sayfasında da kullanılabilir.
export default function ShareMenu({ path, title }: { path?: string; title?: string }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function url() {
    if (typeof window !== 'undefined') return window.location.href;
    return `${SITE_URL}${path ?? '/logs'}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Panoya erişim reddedildiyse sessizce yok say.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: title ?? 'Ömer Faruk Yıldız — Logs', url: url() });
      setOpen(false);
    } catch {
      // Kullanıcı iptal etti ya da desteklenmiyor — sessizce yok say.
    }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        aria-label={lang === 'tr' ? 'daha fazla seçenek' : 'more options'}
        aria-expanded={open}
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ color: 'var(--fg-3)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-full mt-1.5 z-20 w-48 rounded-xl border overflow-hidden py-1"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.4)' }}>
            {canShare && (
              <button type="button" onClick={nativeShare}
                className="w-full text-left px-3.5 py-2.5 text-[13px] flex items-center gap-2.5 transition-colors hover:opacity-80"
                style={{ color: 'var(--fg)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" /><line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
                </svg>
                {lang === 'tr' ? 'Paylaş' : 'Share'}
              </button>
            )}
            <button type="button" onClick={copyLink}
              className="w-full text-left px-3.5 py-2.5 text-[13px] flex items-center gap-2.5 transition-colors hover:opacity-80"
              style={{ color: copied ? '#30D158' : 'var(--fg)' }}>
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              {copied ? (lang === 'tr' ? 'Kopyalandı ✓' : 'Copied ✓') : (lang === 'tr' ? 'Linki kopyala' : 'Copy link')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
