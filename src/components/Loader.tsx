'use client';

import { motion } from 'framer-motion';

// Site genelinde tek tip yükleniyor göstergesi: genişleyip sönen radar
// halkaları + parlayan merkez nokta + "GET <route> pending…" mono satırı.
export default function Loader({
  route = '/api',
  status = 'pending…',
  className = 'py-28',
}: { route?: string; status?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-7 ${className}`} aria-busy="true" aria-label="Yükleniyor">
      {/* Radar: genişleyip sönen halkalar + merkez nokta */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[0, 1, 2].map(i => (
          <motion.span key={i} className="absolute inset-0 rounded-full"
            style={{ border: '2px solid var(--accent)' }}
            initial={{ scale: 0.35, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }} />
        ))}
        <motion.span className="w-3.5 h-3.5 rounded-full"
          style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--accent)' }}
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* GET <route> pending… */}
      <div className="font-mono text-[12px] flex items-center gap-2" style={{ color: 'var(--fg-3)' }}>
        <span className="method-get">GET</span>
        <span>{route}</span>
        <motion.span style={{ color: 'var(--accent)' }}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>{status}</motion.span>
      </div>
    </div>
  );
}
