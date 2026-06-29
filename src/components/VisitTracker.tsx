'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Sayfa açılışında ziyareti kaydeder, sayfa kapanırken kalış süresini gönderir.
// Admin sayfaları izlenmez.
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    // Dış kaynak referrer'ı (aynı site içi gezinme 'Doğrudan' sayılsın).
    let ref = '';
    try {
      if (document.referrer && new URL(document.referrer).host !== location.host) ref = document.referrer;
    } catch { /* ignore */ }

    let id = '';
    let dead = false;
    const start = Date.now();

    fetch('/api/visit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, ref }), keepalive: true,
    }).then(r => r.json()).then(d => { if (!dead) id = d?.id || ''; }).catch(() => {});

    const sendDwell = () => {
      if (!id) return;
      const dur = Math.round((Date.now() - start) / 1000);
      try {
        const blob = new Blob([JSON.stringify({ id, dur })], { type: 'application/json' });
        navigator.sendBeacon?.('/api/visit/dwell', blob);
      } catch { /* ignore */ }
    };
    const onHide = () => { if (document.visibilityState === 'hidden') sendDwell(); };
    document.addEventListener('visibilitychange', onHide);

    return () => { dead = true; document.removeEventListener('visibilitychange', onHide); sendDwell(); };
  }, [pathname]);

  return null;
}
