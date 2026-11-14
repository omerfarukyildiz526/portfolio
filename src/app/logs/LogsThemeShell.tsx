'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import LogsAmbientIcons from '@/components/logs/LogsAmbientIcons';

// /logs alt ağacının tamamını sarar. Tema izolasyonu (.logs-theme, globals.css)
// yalnızca bu wrapper'ın içinde geçerli — NavBar dışarıda kaldığı için
// etkilenmez. Bu layout, /logs ve /logs/[slug] arasında geçişte yeniden monte
// olmaz (App Router aynı segment ağacını korur), bu yüzden fade yalnızca ana
// siteden /logs'a ilk girişte oynar — kart açarken tekrar etmez.
export default function LogsThemeShell({ children, fontVars }: { children: React.ReactNode; fontVars: string }) {
  // Geliştirme aşaması: yalnızca /logs ana sayfası bulanık + kilitli gösterilir.
  const underDevelopment = usePathname() === '/logs';

  return (
    <motion.div
      className={`logs-theme ${fontVars}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <LogsAmbientIcons />
      {underDevelopment ? (
        <>
          <div
            aria-hidden="true"
            inert
            style={{ filter: 'blur(14px)', pointerEvents: 'none', userSelect: 'none' }}
          >
            {children}
          </div>
          <div
            role="status"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                maxWidth: '26rem',
                textAlign: 'center',
                padding: '2rem 1.75rem',
                borderRadius: '1.25rem',
                background: 'rgba(15, 15, 20, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚧</div>
              <h1 style={{ fontFamily: 'var(--font-logs-display)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                Logs geliştiriliyor
              </h1>
              <p style={{ margin: '0.75rem 0 0', opacity: 0.8, lineHeight: 1.5 }}>
                Bu sayfa üzerinde çalışıyorum. Çok yakında yeni yazılarla burada olacak.
              </p>
            </div>
          </div>
        </>
      ) : (
        children
      )}
    </motion.div>
  );
}
