'use client';

import { motion } from 'framer-motion';

const EXPERIENCE = [
  {
    id: 1,
    company: 'Barsan Global Lojistik',
    role: 'Yazılım Uzmanı',
    period: 'Mar 2022 — Günümüz',
    duration: '3+ yıl',
    location: 'İstanbul, Türkiye',
    desc: 'Kurumsal lojistik altyapısı için backend sistemler, RPA çözümleri ve sistem entegrasyonları geliştiriyorum.',
    stack: ['Python', 'C# / .NET', 'SQL Server', 'SAP RFC', 'Blue Prism', 'Selenium'],
    highlights: [
      'SAP RFC/BAPI entegrasyonları ile veri akışlarını otomatikleştirme',
      'Python Selenium/Playwright ile web scraping ve veri toplama sistemleri',
      'C# .NET Core ile iç REST API servisleri geliştirme',
      'Blue Prism ile kurumsal RPA süreç otomasyonu',
      'PostgreSQL / MSSQL veri mimarisi ve sorgu optimizasyonu',
    ],
    type: 'Tam Zamanlı',
    color: '#4488ff',
    current: true,
  },
];

const EDUCATION = [
  {
    school: 'Üniversite Adı',       // ← güncelle
    dept: 'Bölüm Adı',              // ← güncelle
    degree: 'Lisans',
    period: '20XX — 20XX',          // ← güncelle
    color: '#ff8c42',
  },
];

const CERTIFICATIONS = [
  {
    name: 'Sertifika Adı',          // ← güncelle
    issuer: 'Veren Kurum',
    date: '20XX',
    color: '#ff8c42',
  },
  {
    name: 'Sertifika Adı',
    issuer: 'Veren Kurum',
    date: '20XX',
    color: '#4488ff',
  },
  {
    name: 'Sertifika Adı',
    issuer: 'Veren Kurum',
    date: '20XX',
    color: '#86efac',
  },
];

export default function ExperiencePage() {
  return (
    <main className="min-h-screen pt-20 md:pt-28 pb-16 px-5 md:px-14 lg:px-24 xl:px-32">
      <div className="max-w-[1100px] mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
            <span className="text-[11px] font-black accent uppercase tracking-widest">GET</span>
            <span className="text-[11px] text-white/25">/api/experience</span>
            <span className="ml-2 text-[10px] text-[#4488ff]/60">→ 200 OK</span>
          </div>
          <h1
            className="font-black uppercase italic tracking-tighter leading-none text-white heading-primary accent-orange-glow"
            style={{ fontSize: 'clamp(24px, 4vw, 52px)' }}
          >
            DENEYİM.
          </h1>
          <p className="text-sm text-white/30 mt-2 max-w-lg leading-relaxed">
            Kariyer geçmişi, eğitim ve sertifikalar.
          </p>
        </motion.div>

        {/* ── İş Deneyimi Timeline ── */}
        <section className="mb-14">
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/25 mb-6">// İŞ DENEYİMİ</p>

          <div className="relative">
            {/* Dikey çizgi */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-[#4488ff] via-[#4488ff]/30 to-transparent" />

            <div className="space-y-8">
              {EXPERIENCE.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="flex gap-6"
                >
                  {/* Nokta */}
                  <div className="flex-shrink-0 mt-1.5">
                    <div
                      className="w-[15px] h-[15px] rounded-full border-2 relative z-10"
                      style={{
                        borderColor: exp.color,
                        background: exp.current ? exp.color : 'transparent',
                        boxShadow: exp.current ? `0 0 12px ${exp.color}` : 'none',
                      }}
                    />
                  </div>

                  {/* Kart */}
                  <div className="flex-1 pb-2">
                    <div className="card rounded-xl p-5 md:p-6">
                      {/* Üst bilgi */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black uppercase tracking-tight text-white">{exp.company}</h3>
                            {exp.current && (
                              <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(68,136,255,0.12)', color: '#4488ff', border: '1px solid rgba(68,136,255,0.25)' }}>
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-white/60">{exp.role}</p>
                        </div>
                        <div className="text-right flex-shrink-0" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                          <p className="text-[10px] text-white/40">{exp.period}</p>
                          <p className="text-[10px] text-white/25">{exp.location}</p>
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mt-1 inline-block"
                                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {exp.type}
                          </span>
                        </div>
                      </div>

                      {/* Açıklama */}
                      <p className="text-[12px] text-white/40 leading-relaxed mb-4">{exp.desc}</p>

                      {/* Öne çıkanlar */}
                      <ul className="space-y-1.5 mb-4">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="flex items-start gap-2 text-[11px] text-white/35 font-mono">
                            <span style={{ color: exp.color }} className="flex-shrink-0 mt-0.5">›</span>
                            {h}
                          </li>
                        ))}
                      </ul>

                      {/* Stack */}
                      <div className="flex flex-wrap gap-1.5">
                        {exp.stack.map((s) => (
                          <span key={s} className="accent-tag text-[9px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Eğitim ── */}
        <section className="mb-14">
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/25 mb-6">// EĞİTİM</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EDUCATION.map((edu, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="card rounded-xl p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: edu.color, opacity: 0.5 }} />
                <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">{edu.period}</p>
                <h3 className="text-base font-black uppercase tracking-tight text-white mb-0.5">{edu.school}</h3>
                <p className="text-[12px] text-white/50">{edu.dept}</p>
                <span className="mt-2 inline-block text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {edu.degree}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Sertifikalar ── */}
        <section>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/25 mb-6">// SERTİFİKALAR</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CERTIFICATIONS.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="card rounded-xl p-5 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: cert.color, opacity: 0.6 }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-2">{cert.date}</p>
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-white leading-tight mb-1">{cert.name}</h3>
                    <p className="text-[11px] font-mono" style={{ color: cert.color, opacity: 0.7 }}>{cert.issuer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
