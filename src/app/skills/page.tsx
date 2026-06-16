'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MarqueeDir = 'normal' | 'reverse';

interface Spark {
  id: number;
  x: number; y: number;
  dx: number; dy: number;
  color: string; size: number;
}

interface Smoke {
  id: number;
  x: number;
  dx: number;
  dy: number;
  size: number;
}

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
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{ minHeight: '200px' }}
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
      </div>
    </motion.div>
  );
}

export default function SkillsPage() {
  const [dir,    setDir]    = useState<MarqueeDir>('normal');
  const [speed,  setSpeed]  = useState(22);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [smokes, setSmokes] = useState<Smoke[]>([]);
  const sparkId = useRef(0);
  const smokeId = useRef(0);

  const COLORS = ['#ff8c42', '#fbbf24', '#ff4444', '#ffffff', '#ffdd00', '#ff6b6b'];
  const heatIntensity = speed <= 1 ? Math.min(1, (1 - speed) / 0.8) : 0;

  useEffect(() => {
    if (speed > 1.5) { setSparks([]); return; }

    const interval = setInterval(() => {
      const count = speed <= 0.3 ? 4 : speed <= 0.6 ? 3 : speed <= 1 ? 2 : 1;
      for (let n = 0; n < count; n++) {
        const edge  = Math.random() > 0.5 ? -4 : 104;
        const isTop = edge < 0;
        const newSpark: Spark = {
          id:    sparkId.current++,
          x:     Math.random() * 100,
          y:     edge,
          dx:    (Math.random() - 0.5) * 130,
          dy:    isTop ? -(35 + Math.random() * 90) : (35 + Math.random() * 90),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size:  Math.random() * 6 + 2,
        };
        setSparks((prev) => [...prev.slice(-70), newSpark]);
        setTimeout(() => setSparks((prev) => prev.filter((s) => s.id !== newSpark.id)), 850);
      }
    }, Math.max(35, speed * 300));

    return () => clearInterval(interval);
  }, [speed]);

  useEffect(() => {
    if (speed > 0.8) { setSmokes([]); return; }

    const interval = setInterval(() => {
      const sz = 14 + Math.random() * 18;
      const newSmoke: Smoke = {
        id:   smokeId.current++,
        x:    8 + Math.random() * 84,
        dx:   (Math.random() - 0.5) * 45,
        dy:   -(55 + Math.random() * 55),
        size: sz,
      };
      setSmokes((prev) => [...prev.slice(-14), newSmoke]);
      setTimeout(() => setSmokes((prev) => prev.filter((s) => s.id !== newSmoke.id)), 2800);
    }, Math.max(110, speed * 700));

    return () => clearInterval(interval);
  }, [speed]);

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
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/25">// BACKEND GELİŞTİRİCİNİN GÖREVLERİ</p>
            <div className="flex items-center gap-1" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
              {/* Yön */}
              <button
                onClick={() => setDir('reverse')}
                title="Sola"
                className="w-6 h-6 rounded flex items-center justify-center transition-all duration-150"
                style={{
                  background: dir === 'reverse' ? 'rgba(68,136,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border:     dir === 'reverse' ? '1px solid rgba(68,136,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  color:      dir === 'reverse' ? '#4488ff' : 'rgba(255,255,255,0.3)',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
              </button>
              <button
                onClick={() => setDir('normal')}
                title="Sağa"
                className="w-6 h-6 rounded flex items-center justify-center transition-all duration-150"
                style={{
                  background: dir === 'normal' ? 'rgba(68,136,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border:     dir === 'normal' ? '1px solid rgba(68,136,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  color:      dir === 'normal' ? '#4488ff' : 'rgba(255,255,255,0.3)',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </button>

              {/* Ayraç */}
              <span className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* Hız */}
              <button
                onClick={() => setSpeed((s) => Math.min(60, s + 2))}
                title="Yavaşlat"
                className="w-6 h-6 rounded flex items-center justify-center transition-all duration-150 text-[13px] font-bold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                −
              </button>
              <span className="text-[9px] w-8 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {speed <= 0.3 ? '💀' : speed <= 1 ? '🔥' : `${Math.round(22 / speed * 10) / 10}x`}
              </span>
              <button
                onClick={() => setSpeed((s) => +Math.max(0.2, s > 2 ? s - 2 : s - 0.2).toFixed(1))}
                title="Hızlandır"
                className="w-6 h-6 rounded flex items-center justify-center transition-all duration-150 text-[13px] font-bold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                +
              </button>
            </div>
          </div>
          <div
            className="relative overflow-visible"
            style={{
              transition: 'box-shadow 0.5s ease',
              boxShadow: heatIntensity > 0
                ? [
                    `0 0 ${Math.round(heatIntensity * 20)}px rgba(255,100,0,${(heatIntensity * 0.55).toFixed(2)})`,
                    `0 0 ${Math.round(heatIntensity * 55)}px rgba(255,50,0,${(heatIntensity * 0.32).toFixed(2)})`,
                    `0 0 ${Math.round(heatIntensity * 110)}px rgba(200,20,0,${(heatIntensity * 0.18).toFixed(2)})`,
                  ].join(', ')
                : 'none',
            }}
          >
            {/* Kıvılcımlar */}
            <AnimatePresence>
              {sparks.map((s) => (
                <motion.div
                  key={s.id}
                  className="absolute pointer-events-none rounded-full z-10"
                  style={{
                    left:      `${s.x}%`,
                    top:       `${s.y}%`,
                    width:      s.size,
                    height:     s.size,
                    background: s.color,
                    boxShadow:  `0 0 ${s.size * 3}px ${s.color}, 0 0 ${s.size * 7}px ${s.color}66`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: s.dx, y: s.dy, opacity: 0, scale: 0.15 }}
                  exit={{}}
                  transition={{ duration: 0.8, ease: [0.2, 0, 0.8, 1] }}
                />
              ))}
            </AnimatePresence>

            {/* Duman */}
            <AnimatePresence>
              {smokes.map((sm) => (
                <motion.div
                  key={sm.id}
                  className="absolute pointer-events-none z-20 rounded-full"
                  style={{
                    left:       `${sm.x}%`,
                    top:        '-4%',
                    width:       sm.size,
                    height:      sm.size,
                    background: 'radial-gradient(circle, rgba(180,155,130,0.22) 0%, rgba(120,100,80,0.07) 55%, transparent 100%)',
                    filter:     `blur(${sm.size * 0.45}px)`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 0.8, scale: 1 }}
                  animate={{ x: sm.dx, y: sm.dy, opacity: 0, scale: 3.5 }}
                  exit={{}}
                  transition={{ duration: 2.4, ease: [0.1, 0.25, 0.55, 1] }}
                />
              ))}
            </AnimatePresence>

            {/* Ateş çizgisi — üst kenar */}
            {heatIntensity > 0 && (
              <motion.div
                className="absolute inset-x-0 top-0 z-[25] pointer-events-none"
                style={{ height: 3 }}
                animate={{
                  boxShadow: [
                    `0 0 6px 2px rgba(255,80,0,${(heatIntensity * 0.7).toFixed(2)}), 0 0 18px 5px rgba(255,30,0,${(heatIntensity * 0.4).toFixed(2)})`,
                    `0 0 14px 4px rgba(255,140,0,${(heatIntensity).toFixed(2)}), 0 0 40px 10px rgba(255,60,0,${(heatIntensity * 0.55).toFixed(2)})`,
                    `0 0 6px 2px rgba(255,80,0,${(heatIntensity * 0.7).toFixed(2)}), 0 0 18px 5px rgba(255,30,0,${(heatIntensity * 0.4).toFixed(2)})`,
                  ],
                  background: [
                    `rgba(255,80,0,${(heatIntensity * 0.85).toFixed(2)})`,
                    `rgba(255,160,0,${(heatIntensity).toFixed(2)})`,
                    `rgba(255,80,0,${(heatIntensity * 0.85).toFixed(2)})`,
                  ],
                }}
                transition={{ duration: 0.38, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Ateş çizgisi — alt kenar */}
            {heatIntensity > 0 && (
              <motion.div
                className="absolute inset-x-0 bottom-0 z-[25] pointer-events-none"
                style={{ height: 3 }}
                animate={{
                  boxShadow: [
                    `0 0 6px 2px rgba(255,80,0,${(heatIntensity * 0.7).toFixed(2)}), 0 0 18px 5px rgba(255,30,0,${(heatIntensity * 0.4).toFixed(2)})`,
                    `0 0 14px 4px rgba(255,140,0,${(heatIntensity).toFixed(2)}), 0 0 40px 10px rgba(255,60,0,${(heatIntensity * 0.55).toFixed(2)})`,
                    `0 0 6px 2px rgba(255,80,0,${(heatIntensity * 0.7).toFixed(2)}), 0 0 18px 5px rgba(255,30,0,${(heatIntensity * 0.4).toFixed(2)})`,
                  ],
                  background: [
                    `rgba(255,80,0,${(heatIntensity * 0.85).toFixed(2)})`,
                    `rgba(255,160,0,${(heatIntensity).toFixed(2)})`,
                    `rgba(255,80,0,${(heatIntensity * 0.85).toFixed(2)})`,
                  ],
                }}
                transition={{ duration: 0.38, repeat: Infinity, ease: 'easeInOut', delay: 0.19 }}
              />
            )}

          <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <div className="marquee-track gap-3" style={{ animationDirection: dir, animationDuration: `${speed}s` }}>
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
          </div>{/* /relative overflow-visible */}
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
