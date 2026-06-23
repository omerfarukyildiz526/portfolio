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
              <span className="text-[11px]" style={{ color: 'var(--dim)' }}>/api/projects</span>
              <span className="ml-2 text-[10px] text-[#4488ff]/60">→ 200 OK</span>
            </div>
            <h1 className="font-black uppercase italic tracking-tighter leading-none heading-primary accent-orange-glow"
                style={{ fontSize: 'clamp(24px, 4vw, 52px)' }}>
              PROJELER.
            </h1>
            <p className="text-base mt-4 max-w-lg leading-relaxed" style={{ color: 'var(--dim)' }}>
              GitHub&apos;daki public repositoryler. Tıklayarak README&apos;yi terminalde görüntüleyebilirsin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
            className="terminal rounded-md p-5"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
          >
            <div className="text-[10px] mb-3 uppercase tracking-widest" style={{ color: 'var(--dim-soft)' }}>// REPO İSTATİSTİKLERİ</div>
            <div className="text-[11px] leading-loose">
              <span style={{ color: 'var(--dim-soft)' }}>{'{'}</span><br />
              <span className="ml-4" style={{ color: 'var(--dim-soft)' }}>&quot;kaynak&quot;:&nbsp;</span>
              <span style={{ color: '#d97706' }}>&quot;github.com/OmerFaruk-YILDIZ&quot;,</span><br />
              <span className="ml-4" style={{ color: 'var(--dim-soft)' }}>&quot;sıralama&quot;:&nbsp;</span>
              <span style={{ color: 'var(--accent)' }}>&quot;son güncelleme&quot;,</span><br />
              <span className="ml-4" style={{ color: 'var(--dim-soft)' }}>&quot;diller&quot;:&nbsp;</span>
              <span style={{ color: '#16a34a' }}>[&quot;Python&quot;, &quot;C#&quot;, &quot;TypeScript&quot;],</span><br />
              <span className="ml-4" style={{ color: 'var(--dim-soft)' }}>&quot;görüntüle&quot;:&nbsp;</span>
              <span style={{ color: '#d97706' }}>&quot;readme terminalde açılır&quot;</span><br />
              <span style={{ color: 'var(--dim-soft)' }}>{'}'}</span>
            </div>
          </motion.div>
        </div>

        <Projects />
      </div>
    </main>
  );
}
