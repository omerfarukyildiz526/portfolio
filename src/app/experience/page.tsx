'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const ISSUER_LOGOS: Record<string, string> = {
  'Turkcell Geleceği Yazanlar': 'https://gelecegiyazanlar.turkcell.com.tr/logo-night.svg',
  'BTK Akademi': 'https://www.btkakademi.gov.tr/favicon.ico',
  'ALT+TAB Kuluçka Merkezi': 'https://alttab.gungoren.bel.tr/assets/logo/alt-tab.svg',
};

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const isPdf = src.endsWith('.pdf');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl"
        style={{ height: isPdf ? '82vh' : 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? (
          <iframe
            src={src}
            className="w-full h-full"
            title="diploma"
          />
        ) : (
          <img
            src={src}
            alt="sertifika"
            className="w-full h-auto max-h-[90vh] object-contain"
          />
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl font-bold transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

function IssuerLogo({ issuer, color }: { issuer: string; color: string }) {
  const [error, setError] = useState(false);
  const src = ISSUER_LOGOS[issuer];

  if (!src || error) {
    return (
      <span
        className="w-7 h-7 rounded text-[10px] font-black flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22`, color }}
      >
        {issuer[0]}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={issuer}
      onError={() => setError(true)}
      className="h-7 w-auto max-w-[100px] object-contain"
      style={{ filter: 'var(--logo-filter)', opacity: 0.7 }}
    />
  );
}

const EXPERIENCE = [
  {
    id: 1,
    company: 'Barsan Global Lojistik',
    role: 'Yazılım Uzmanı',
    period: 'Eyl 2025 — Günümüz',
    duration: '',
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
  {
    id: 2,
    company: 'Barsan Global Lojistik',
    role: 'Yazılım Stajyeri',
    period: 'Tem 2024 — Eyl 2025',
    duration: '14 ay',
    location: 'İstanbul, Türkiye',
    desc: 'Staj sürecinde kurumsal lojistik sistemlerinde backend geliştirme ve otomasyon projelerine katkı sağladım.',
    stack: ['Python', 'C# / .NET', 'SQL Server', 'Selenium'],
    highlights: [
      'Python Selenium ile otomasyon scriptleri geliştirme',
      'SQL Server üzerinde veri sorgulama ve raporlama',
      'C# .NET ile küçük ölçekli servis geliştirme',
    ],
    type: 'Staj',
    color: '#ff8c42',
    current: false,
  },
];

const EDUCATION = [
  {
    school: 'İstinye Üniversitesi',
    dept: 'Bilgisayar Programcılığı',
    degree: 'Önlisans',
    period: 'Eki 2023 — Haz 2025',
    diploma: '/certificates/Diploma.pdf',
    logo: 'https://www.istinye.edu.tr/sites/default/files/2025-07/isu_logo_tr-1.svg',
    color: '#ff8c42',
    topics: [
      { label: 'Programlama', items: ['Python', 'PHP', 'C', 'JavaScript', 'HTML', 'CSS', 'SQL'] },
      { label: 'Yazılım Geliştirme', items: ['OOP', 'Veri Yapıları', 'Arka Uç Geliştirme', 'Ön Uç Geliştirme'] },
      { label: 'Veritabanı', items: ['Veritabanı Yönetimi', 'Veritabanı Tasarımı'] },
      { label: 'Sistem & Altyapı', items: ['Linux', 'Sistem Analizi ve Tasarımı'] },
      { label: 'Yetkinlikler', items: ['Proje Yönetimi', 'Problem Çözme', 'Analitik Düşünme', 'Girişimcilik', 'Sunum Becerileri', 'Grafik Tasarımı', 'Uluslararası Ticaret'] },
    ],
  },
];

const REFERENCES = [
  {
    name: 'Alper Akoğuz',
    title: 'Öğretim Görevlisi',
    company: 'İstinye Üniversitesi',
    relation: 'Akademik Referans',
    contact: 'akoguz.alper@gmail.com',
    linkedin: 'https://www.linkedin.com/in/alperakoguz/',
    color: '#4488ff',
  },
];

const CERTIFICATIONS = [
  {
    name: '.NET MVC Fullstack Web Geliştirme Eğitimi',
    issuer: 'ALT+TAB Kuluçka Merkezi',
    date: 'Kas 2025',
    url: '',
    image: '/certificates/alttab-yaz-kampi.jpg',
    color: '#a78bfa',
  },
  {
    name: 'Python 401',
    issuer: 'Turkcell Geleceği Yazanlar',
    date: '28 Eki 2025',
    url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/d5d8da13c8c2484aa2efb72058afcc79',
    color: '#10b981',
  },
  {
    name: 'Python 301',
    issuer: 'Turkcell Geleceği Yazanlar',
    date: '23 Eki 2025',
    url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/435eb150e460417fa48f238aceb37184',
    color: '#10b981',
  },
  {
    name: 'Python 201',
    issuer: 'Turkcell Geleceği Yazanlar',
    date: '12 Eki 2025',
    url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/2033d1b27e46432da7ad2e86a69a8715',
    color: '#10b981',
  },
  {
    name: 'Python 101',
    issuer: 'Turkcell Geleceği Yazanlar',
    date: '14 Eyl 2025',
    url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/42e44bf3c3ac4b5888da4b81e23fdb93',
    color: '#10b981',
  },
  {
    name: 'A1 Seviye İngilizce',
    issuer: 'BTK Akademi',
    date: 'Eyl 2025',
    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=jK1hKodg0z',
    color: '#4488ff',
  },
  {
    name: 'API ve API Testi',
    issuer: 'BTK Akademi',
    date: 'Ağu 2025',
    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=nKqhnnge1A',
    color: '#4488ff',
  },
  {
    name: 'Yeni Başlayanlar için Python Programlama',
    issuer: 'BTK Akademi',
    date: 'Ağu 2025',
    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=VP1cggb8p7',
    color: '#4488ff',
  },
  {
    name: 'Versiyon Kontrolleri: Git ve GitHub',
    issuer: 'BTK Akademi',
    date: 'Ağu 2025',
    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=OKMhqaK7Vq',
    color: '#4488ff',
  },
];

export default function ExperiencePage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
    {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
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
            <span className="text-[11px]" style={{ color: 'var(--dim)' }}>/api/experience</span>
            <span className="ml-2 text-[10px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>→ 200 OK</span>
          </div>
          <h1
            className="font-black uppercase italic tracking-tighter leading-none heading-primary accent-orange-glow"
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
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-6" style={{ color: 'var(--dim-soft)' }}>// İŞ DENEYİMİ</p>

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
                      }}
                    />
                  </div>

                  {/* Kart */}
                  <div className="flex-1 pb-2">
                    <div className="card rounded-md p-5 md:p-6">
                      {/* Üst bilgi */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black uppercase tracking-tight" style={{ color: 'var(--fg)' }}>{exp.company}</h3>
                            {exp.current && (
                              <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.30)' }}>
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold" style={{ color: 'var(--dim)' }}>{exp.role}</p>
                        </div>
                        <div className="text-right flex-shrink-0" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                          <p className="text-[10px]" style={{ color: 'var(--dim)' }}>{exp.period}</p>
                          <p className="text-[10px]" style={{ color: 'var(--dim-soft)' }}>{exp.location}</p>
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mt-1 inline-block"
                                style={{ background: 'var(--surface)', color: 'var(--dim)', border: '1px solid var(--border)' }}>
                            {exp.type}
                          </span>
                        </div>
                      </div>

                      {/* Açıklama */}
                      <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--dim)' }}>{exp.desc}</p>

                      {/* Öne çıkanlar */}
                      <ul className="space-y-1.5 mb-4">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="flex items-start gap-2 text-[11px] font-mono" style={{ color: 'var(--dim)' }}>
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
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-6" style={{ color: 'var(--dim-soft)' }}>// EĞİTİM</p>
          <div className="flex flex-col gap-4">
            {EDUCATION.map((edu, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="card rounded-md p-5 md:p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: edu.color }} />

                {/* Üst bilgi */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--dim-soft)' }}>{edu.period}</p>
                    <h3 className="text-base font-black uppercase tracking-tight mb-0.5" style={{ color: 'var(--fg)' }}>{edu.school}</h3>
                    <p className="text-[12px]" style={{ color: 'var(--dim)' }}>{edu.dept}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 self-end sm:self-start">
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded"
                          style={{ background: 'var(--surface)', color: 'var(--dim)', border: '1px solid var(--border)' }}>
                      {edu.degree}
                    </span>
                    {'diploma' in edu && edu.diploma && (
                      <button
                        onClick={() => setLightbox(edu.diploma as string)}
                        className="inline-flex items-center gap-1.5 text-[9px] font-mono hover:opacity-100 transition-opacity duration-150"
                        style={{ color: edu.color, opacity: 0.85 }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/>
                        </svg>
                        Diplomayı Görüntüle
                      </button>
                    )}
                    {'logo' in edu && edu.logo && (
                      <img
                        src={edu.logo as string}
                        alt={edu.school}
                        className="h-10 w-auto max-w-[140px] object-contain"
                        style={{ filter: 'var(--logo-filter)', opacity: 0.75 }}
                      />
                    )}
                  </div>
                </div>

                {/* Konular */}
                {'topics' in edu && edu.topics && (
                  <div className="space-y-3">
                    {edu.topics.map((group) => (
                      <div key={group.label}>
                        <p className="text-[8px] font-mono uppercase tracking-[0.3em] mb-1.5" style={{ color: edu.color }}>
                          {group.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.items.map((item) => (
                            <span key={item} className="accent-tag text-[9px]">{item}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Referanslar ── */}
        <section className="mb-14">
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-6" style={{ color: 'var(--dim-soft)' }}>// REFERANSLAR</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REFERENCES.map((ref, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="card rounded-md p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: ref.color }} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded mb-3 inline-block"
                          style={{ background: 'var(--surface)', color: 'var(--dim)', border: '1px solid var(--border)' }}>
                      {ref.relation}
                    </span>
                    <h3 className="text-base font-black uppercase tracking-tight mb-0.5" style={{ color: 'var(--fg)' }}>{ref.name}</h3>
                    <p className="text-[12px] font-bold mb-0.5" style={{ color: 'var(--dim)' }}>{ref.title}</p>
                    <p className="text-[11px] font-mono font-semibold" style={{ color: ref.color }}>{ref.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-[10px] font-mono" style={{ color: 'var(--dim-soft)' }}>{ref.contact}</p>
                  {ref.linkedin && (
                    <a
                      href={ref.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-mono transition-opacity duration-150 hover:opacity-100"
                      style={{ color: ref.color, opacity: 0.85 }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Sertifikalar ── */}
        <section>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-6" style={{ color: 'var(--dim-soft)' }}>// SERTİFİKALAR</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CERTIFICATIONS.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="card rounded-md p-5 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: cert.color }} />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--dim-soft)' }}>{cert.date}</p>
                    <h3 className="text-[13px] font-black uppercase tracking-tight leading-tight mb-1" style={{ color: 'var(--fg)' }}>{cert.name}</h3>
                    <p className="text-[11px] font-mono font-semibold" style={{ color: cert.color }}>{cert.issuer}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {'url' in cert && cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] font-mono hover:opacity-100 transition-opacity duration-150"
                        style={{ color: cert.color, opacity: 0.8 }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Doğrula
                      </a>
                    ) : 'image' in cert && cert.image ? (
                      <button
                        onClick={() => setLightbox(cert.image as string)}
                        className="flex items-center gap-1 text-[9px] font-mono hover:opacity-100 transition-opacity duration-150"
                        style={{ color: cert.color, opacity: 0.8 }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Doğrula
                      </button>
                    ) : null}
                    <IssuerLogo issuer={cert.issuer} color={cert.color} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </main>
    </>
  );
}
