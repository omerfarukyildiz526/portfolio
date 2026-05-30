'use client';

import { motion } from 'framer-motion';
import Projects from '@/components/Projects';

export default function ProjectsPage() {
  return (
    <main className="cyber-grid min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 px-5 md:px-14 lg:px-24 xl:px-32">
      <div className="max-w-[1400px] mx-auto">

        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-3 mb-4" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
              <span className="text-[11px] font-black accent uppercase tracking-widest">GET</span>
              <span className="text-[11px] text-white/25">/api/projects</span>
              <span className="ml-2 text-[10px] text-[#4488ff]/60">→ 200 OK</span>
            </div>
            <h1 className="font-black uppercase italic tracking-tighter leading-none text-white heading-primary accent-orange-glow"
                style={{ fontSize: 'clamp(24px, 4vw, 52px)' }}>
              PROJELER.
            </h1>
            <p className="text-base text-white/35 mt-4 max-w-lg leading-relaxed">
              GitHub&apos;daki public repositoryler. Tıklayarak README&apos;yi terminalde görüntüleyebilirsin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
            className="terminal rounded-xl p-5"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
          >
            <div className="text-[10px] text-white/25 mb-3 uppercase tracking-widest">// REPO İSTATİSTİKLERİ</div>
            <div className="text-[11px] leading-loose text-white/50">
              <span className="text-white/30">{'{'}</span><br />
              <span className="ml-4 text-white/25">&quot;kaynak&quot;:&nbsp;</span>
              <span className="text-[#fbbf24]">&quot;github.com/OmerFaruk-YILDIZ&quot;,</span><br />
              <span className="ml-4 text-white/25">&quot;sıralama&quot;:&nbsp;</span>
              <span className="text-[#4488ff]">&quot;son güncelleme&quot;,</span><br />
              <span className="ml-4 text-white/25">&quot;diller&quot;:&nbsp;</span>
              <span className="text-[#86efac]">[&quot;Python&quot;, &quot;C#&quot;, &quot;TypeScript&quot;],</span><br />
              <span className="ml-4 text-white/25">&quot;görüntüle&quot;:&nbsp;</span>
              <span className="text-[#fbbf24]">&quot;readme terminalde açılır&quot;</span><br />
              <span className="text-white/30">{'}'}</span>
            </div>
          </motion.div>
        </div>

        <Projects />
      </div>
    </main>
  );
}
