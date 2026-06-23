'use client';

import { motion } from 'framer-motion';
import Contact from '@/components/Contact';

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 px-5 md:px-14 lg:px-24 xl:px-32">
      <div className="max-w-[1400px] mx-auto">

        <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-3 mb-4" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
              <span className="text-[11px] font-black text-[#ff8c42] uppercase tracking-widest heading-accent">POST</span>
              <span className="text-[11px]" style={{ color: 'var(--dim)' }}>/api/contact</span>
              <span className="ml-2 text-[10px] text-[#ff8c42]/60">→ 201 Created</span>
            </div>
            <h1 className="font-black uppercase italic tracking-tighter leading-none text-white heading-primary accent-orange-glow"
                style={{ fontSize: 'clamp(24px, 4vw, 52px)' }}>
              BAĞLANTI.
            </h1>
            <p className="text-base mt-4 max-w-lg leading-relaxed text-premium" style={{ color: 'var(--dim)' }}>
              İletişim için aşağıdaki kanalları kullanabilirsin. İsteği gönder, yanıtı bekle.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="terminal rounded-md p-5"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
          >
            <div className="text-[10px] mb-3 uppercase tracking-widest" style={{ color: 'var(--dim)' }}>// REQUEST BODY</div>
            <div className="text-[11px] leading-loose" style={{ color: 'var(--dim)' }}>
              <span style={{ color: 'var(--border)', opacity: 0.6 }}>{'{'}</span><br />
              <span className="ml-4" style={{ color: 'var(--dim)' }}>&quot;intent&quot;:&nbsp;</span>
              <span className="text-[#fbbf24]">&quot;işbirliği&quot; | &quot;sadece merhaba&quot;</span>
              <span style={{ color: 'var(--dim)' }}>,</span><br />
              <span className="ml-4" style={{ color: 'var(--dim)' }}>&quot;channel&quot;:&nbsp;</span>
              <span className="accent">&quot;github&quot; | &quot;linkedin&quot; | &quot;email&quot;</span><br />
              <span style={{ color: 'var(--dim)' }}>{'}'}</span>
            </div>
          </motion.div>
        </div>

        <Contact />
      </div>
    </main>
  );
}
