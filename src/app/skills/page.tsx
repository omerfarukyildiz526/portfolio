'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RESPONSIBILITIES = [
  { icon: '⚙', title: 'REST API Tasarımı',       tags: ['GET', 'POST', 'PUT', 'DELETE'] },
  { icon: '🗄', title: 'Veritabanı Mimarisi',     tags: ['SQL Server', 'PostgreSQL', 'EF Core'] },
  { icon: '🤖', title: 'Süreç Otomasyonu',        tags: ['Selenium', 'Blue Prism', 'Power Automate'] },
  { icon: '🔗', title: 'Sistem Entegrasyonu',     tags: ['SAP RFC', 'SOAP', 'BAPI'] },
  { icon: '📊', title: 'Veri İşleme',             tags: ['Pandas', 'NumPy', 'Excel'] },
  { icon: '🐳', title: 'DevOps & Deployment',     tags: ['Docker', 'Git', 'CI/CD'] },
];

function TechCard({
  title, libs, delay,
}: {
  title: string;
  libs: { name: string; sub: string[] }[];
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setRot({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 10 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setRot({ x: 0, y: 0 })}
        onClick={() => setOpen(!open)}
        animate={{ rotateX: rot.x, rotateY: rot.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{ transformPerspective: 900, transformStyle: 'preserve-3d', minHeight: '200px' }}
        className="card rounded-xl p-5 md:p-6 cursor-pointer group relative flex flex-col"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#4488ff] opacity-40 group-hover:opacity-80 transition-opacity"
             style={{ boxShadow: '0 0 10px #4488ff' }} />

        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white">{title}</h3>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] mt-1">{libs.length} kütüphane</p>
          </div>
          <span className="text-[11px] font-mono text-white/20 group-hover:text-[#4488ff]/50 transition-colors mt-1">
            {open ? '[ − ]' : '[ + ]'}
          </span>
        </div>

        {/* Kapalı haldeyken kütüphane adları */}
        {!open && (
          <div className="flex flex-col gap-3 flex-1 mt-1">
            {libs.map((lib) => (
              <div key={lib.name} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4488ff]/40 flex-shrink-0" />
                <span className="text-sm font-mono text-white/35">{lib.name}</span>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 gap-2 overflow-hidden"
            >
              {libs.map((lib) => (
                <div key={lib.name} className="px-3 py-2.5 border border-white/5 rounded-lg bg-white/[0.015]">
                  <div className="text-[11px] font-bold uppercase tracking-wide mb-0.5 accent">{lib.name}</div>
                  <div className="text-[10px] text-white/25 font-mono">{lib.sub.join(' · ')}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function SkillsPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-5 md:px-14 lg:px-24 xl:px-32">
      <div className="max-w-[1400px] mx-auto w-full">

        {/* ── Header ── */}
        <div className="mb-5 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-3 mb-3" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
              <span className="text-[11px] font-black accent uppercase tracking-widest">GET</span>
              <span className="text-[11px] text-white/25">/api/skills</span>
              <span className="ml-2 text-[10px] text-[#4488ff]/60">→ 200 OK</span>
            </div>
            <h1 className="font-black uppercase italic tracking-tighter leading-none text-white heading-primary accent-orange-glow"
                style={{ fontSize: 'clamp(24px, 4vw, 52px)' }}>
              DONANIM.
            </h1>
            <p className="text-sm text-white/30 mt-2 max-w-lg leading-relaxed">
              Barsan Global Lojistik&apos;te kullandığım teknolojiler, kütüphaneler ve görevler.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="terminal rounded-xl p-4"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
          >
            <div className="text-[10px] text-white/25 mb-2 uppercase tracking-widest">// STACK ÖZET</div>
            <div className="text-[11px] leading-loose text-white/50">
              <span className="text-white/30">{'{'}</span>
              <span className="ml-4 text-white/25"> &quot;uzmanlık&quot;:&nbsp;</span>
              <span className="text-[#fbbf24]">[&quot;Python&quot;, &quot;C#&quot;, &quot;RPA&quot;],</span>
              <span className="ml-4 text-white/25"> &quot;deneyim&quot;:&nbsp;</span>
              <span className="text-[#fbbf24]">&quot;3+ yıl&quot;,&nbsp;</span>
              <span className="text-[#86efac]">&quot;mid-senior&quot;</span>
              <span className="text-white/30"> {'}'}</span>
            </div>
          </motion.div>
        </div>

        {/* ── Marquee: Görevler ── */}
        <div className="mb-5">
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/25 mb-3">// BACKEND GELİŞTİRİCİNİN GÖREVLERİ</p>
          <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <div className="marquee-track gap-3">
              {[...RESPONSIBILITIES, ...RESPONSIBILITIES].map((r, i) => (
                <div
                  key={i}
                  className="card rounded-xl p-4 flex-shrink-0 w-48 sm:w-56 group hover:border-[#4488ff]/25 transition-colors"
                >
                  <div className="text-xl mb-2">{r.icon}</div>
                  <h3 className="font-black uppercase tracking-tight text-white/80 text-xs mb-2">{r.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {r.tags.map((tag) => (
                      <span key={tag} className="text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#4488ff]/15 text-[#4488ff]/50 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tech Stack ── */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/25 mb-3">// TEKNOLOJİ STACK — DETAY</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TechCard title="Python" delay={0.05} libs={[
              { name: 'Selenium',  sub: ['WebDriver', 'RPA', 'Web Scraping'] },
              { name: 'Pandas',    sub: ['Veri İşleme', 'Excel Otomasyon'] },
              { name: 'Requests',  sub: ['API Entegrasyon', 'SOAP / HTTP'] },
              { name: 'NumPy',     sub: ['Matematiksel İşlemler'] },
            ]} />
            <TechCard title="C# / .NET" delay={0.1} libs={[
              { name: 'Entity Framework', sub: ['Database First', 'LINQ', 'Migration'] },
              { name: '.NET Core',        sub: ['Web API', 'Microservices'] },
              { name: 'WPF',              sub: ['Desktop UI', 'MVVM Pattern'] },
              { name: 'LINQ',             sub: ['Veri Filtreleme', 'Projection'] },
            ]} />
            <TechCard title="Veritabanı" delay={0.15} libs={[
              { name: 'SQL Server', sub: ['T-SQL', 'Stored Procedures'] },
              { name: 'PostgreSQL', sub: ['Query Optim.', 'Indexing'] },
              { name: 'Oracle',     sub: ['PL/SQL', 'Enterprise DB'] },
              { name: 'Redis',      sub: ['Cache Layer', 'Session'] },
            ]} />
            <TechCard title="DevOps & Diğer" delay={0.2} libs={[
              { name: 'Git / GitHub', sub: ['Branching', 'CI/CD Pipeline'] },
              { name: 'Docker',       sub: ['Containerization', 'Compose'] },
              { name: 'SAP',          sub: ['ABAP Temel', 'RFC / BAPI'] },
              { name: 'RPA Tools',    sub: ['Blue Prism', 'Power Automate'] },
            ]} />
          </div>
        </div>

      </div>
    </main>
  );
}
