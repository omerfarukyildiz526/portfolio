'use client';

import { motion } from 'framer-motion';
import Projects from '@/components/Projects';
import { useT } from '@/lib/i18n';
import { usePageContent } from '@/lib/use-page-content';

export default function ProjectsPage() {
  const t  = useT();
  const live = usePageContent('projects');
  const tp = { ...t.projects, ...(live ?? {}) };

  return (
    <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
      <div className="max-w-[1200px] mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16"
        >
          <div className="hidden md:flex items-center gap-2.5 mb-6">
            <span className="method-get">GET</span>
            <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>{tp.pageRoute}</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>→ 200 OK</span>
          </div>
          <h1 className="display-lg mb-3" style={{ color: 'var(--fg)' }}>{tp.pageTitle}</h1>
          <p className="body-md max-w-xl" style={{ color: 'var(--fg-2)' }}>{tp.pageDesc}</p>
        </motion.div>

        <Projects />
      </div>
    </main>
  );
}
