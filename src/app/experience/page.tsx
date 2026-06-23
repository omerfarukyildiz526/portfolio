'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useT } from '@/lib/i18n';

const ISSUER_LOGOS: Record<string, string> = {
  'Turkcell Geleceği Yazanlar': 'https://gelecegiyazanlar.turkcell.com.tr/logo-night.svg',
  'BTK Akademi': 'https://www.btkakademi.gov.tr/favicon.ico',
  'ALT+TAB Kuluçka Merkezi': 'https://alttab.gungoren.bel.tr/assets/logo/alt-tab.svg',
};

const EXP_META = [
  { id: 1, stack: ['Python', 'C# / .NET', 'SQL Server', 'SAP RFC', 'Blue Prism', 'Selenium'], current: true  },
  { id: 2, stack: ['Python', 'C# / .NET', 'SQL Server', 'Selenium'],                          current: false },
];

const EDU_META = [
  { diploma: '/certificates/Diploma.pdf', logo: 'https://www.istinye.edu.tr/sites/default/files/2025-07/isu_logo_tr-1.svg' },
];

const REF_META = [
  { linkedin: 'https://www.linkedin.com/in/alperakoguz/' },
];

const CERTIFICATIONS = [
  { name: '.NET MVC Fullstack Web Geliştirme Eğitimi', issuer: 'ALT+TAB Kuluçka Merkezi',     date: 'Kas 2025', url: '',  image: '/certificates/alttab-yaz-kampi.jpg' },
  { name: 'Python 401',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '28 Eki 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/d5d8da13c8c2484aa2efb72058afcc79' },
  { name: 'Python 301',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '23 Eki 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/435eb150e460417fa48f238aceb37184' },
  { name: 'Python 201',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '12 Eki 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/2033d1b27e46432da7ad2e86a69a8715' },
  { name: 'Python 101',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '14 Eyl 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/42e44bf3c3ac4b5888da4b81e23fdb93' },
  { name: 'A1 Seviye İngilizce',                        issuer: 'BTK Akademi',                date: 'Eyl 2025', url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=jK1hKodg0z' },
  { name: 'API ve API Testi',                           issuer: 'BTK Akademi',                date: 'Ağu 2025', url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=nKqhnnge1A' },
  { name: 'Yeni Başlayanlar için Python Programlama',   issuer: 'BTK Akademi',                date: 'Ağu 2025', url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=VP1cggb8p7' },
  { name: 'Versiyon Kontrolleri: Git ve GitHub',        issuer: 'BTK Akademi',                date: 'Ağu 2025', url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=OKMhqaK7Vq' },
];

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const isPdf = src.endsWith('.pdf');
  return (
    <motion.div
      className="lightbox-overlay fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: isPdf ? '82vh' : 'auto', background: 'var(--bg-card)' }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {isPdf
          ? <iframe src={src} className="w-full h-full" title="diploma" />
          : <img src={src} alt="certificate" className="w-full h-auto max-h-[90vh] object-contain" />
        }
      </motion.div>
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </motion.div>
  );
}

function IssuerBadge({ issuer }: { issuer: string }) {
  const [error, setError] = useState(false);
  const src = ISSUER_LOGOS[issuer];
  if (!src || error) {
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded text-[10px] font-bold flex-shrink-0"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}
      >
        {issuer[0]}
      </span>
    );
  }
  return (
    <img
      src={src} alt={issuer} onError={() => setError(true)}
      className="h-6 w-auto max-w-[88px] object-contain opacity-60"
      style={{ filter: 'var(--logo-filter, none)' }}
    />
  );
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0  },
  transition: { delay: 0.15 + i * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] as const },
});

export default function ExperiencePage() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const t  = useT();
  const te = t.experience;

  const experience = te.experience.map((exp, i) => ({ ...exp, ...EXP_META[i] }));
  const education  = te.education.map((edu, i)  => ({ ...edu, ...EDU_META[i]  }));
  const references = te.references.map((ref, i)  => ({ ...ref, ...REF_META[i]  }));

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="mb-16"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <span className="method-get">GET</span>
              <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>{te.pageRoute}</span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>→ 200 OK</span>
            </div>
            <h1 className="display-lg mb-3" style={{ color: 'var(--fg)' }}>{te.pageTitle}</h1>
            <p className="body-md max-w-lg" style={{ color: 'var(--fg-2)' }}>{te.pageDesc}</p>
          </motion.div>

          {/* ── Work Experience ── */}
          <section className="mb-20">
            <p className="label mb-8">{te.sectionWork}</p>

            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-[7px] top-3 bottom-3 w-px"
                style={{ background: 'linear-gradient(to bottom, var(--accent) 0%, var(--border) 100%)' }}
              />

              <div className="space-y-8">
                {experience.map((exp, i) => (
                  <motion.div key={exp.id} {...stagger(i)} className="flex gap-7">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 mt-5">
                      <div
                        className="w-[15px] h-[15px] rounded-full border-2 relative z-10"
                        style={{
                          borderColor: 'var(--accent)',
                          background: exp.current ? 'var(--accent)' : 'var(--bg)',
                        }}
                      />
                    </div>

                    {/* Card */}
                    <div className="card flex-1 p-6 md:p-7">
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base" style={{ color: 'var(--fg)' }}>
                              {exp.company}
                            </h3>
                            {exp.current && (
                              <span
                                className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{
                                  background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                                  color:      'var(--accent)',
                                  border:     '1px solid color-mix(in srgb, var(--accent) 22%, transparent)',
                                }}
                              >
                                {te.activeBadge}
                              </span>
                            )}
                          </div>
                          <p className="body-sm font-medium" style={{ color: 'var(--fg-2)' }}>{exp.role}</p>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <p className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{exp.period}</p>
                          <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>{exp.location}</p>
                          <span
                            className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 inline-block"
                            style={{ background: 'var(--surface)', color: 'var(--fg-3)', border: '1px solid var(--border)' }}
                          >
                            {exp.type}
                          </span>
                        </div>
                      </div>

                      <p className="body-sm mb-5" style={{ color: 'var(--fg-2)' }}>{exp.desc}</p>

                      {/* Highlights */}
                      <ul className="space-y-2 mb-5">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="flex items-start gap-3 body-sm" style={{ color: 'var(--fg-2)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                 className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>
                              <path d="M5 12h14m-7-7 7 7-7 7"/>
                            </svg>
                            {h}
                          </li>
                        ))}
                      </ul>

                      {/* Stack tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {exp.stack.map((s) => (
                          <span key={s} className="tag tag-accent text-[11px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Education ── */}
          <section className="mb-20">
            <p className="label mb-8">{te.sectionEdu}</p>

            <div className="flex flex-col gap-5">
              {education.map((edu, i) => (
                <motion.div key={i} {...stagger(i)} className="card p-6 md:p-7">
                  {/* Top accent line */}
                  <div className="h-px mb-6" style={{ background: 'var(--accent)', opacity: 0.3 }} />

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--fg-3)' }}>
                        {edu.period}
                      </p>
                      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>{edu.school}</h3>
                      <p className="body-sm" style={{ color: 'var(--fg-2)' }}>{edu.dept}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <span
                        className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded"
                        style={{ background: 'var(--surface)', color: 'var(--fg-3)', border: '1px solid var(--border)' }}
                      >
                        {edu.degree}
                      </span>
                      {edu.diploma && (
                        <button
                          onClick={() => setLightbox(edu.diploma)}
                          className="flex items-center gap-1.5 body-sm transition-opacity hover:opacity-100"
                          style={{ color: 'var(--accent)', opacity: 0.75 }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M7 7h10M7 12h10M7 17h6"/>
                          </svg>
                          {te.viewDiploma}
                        </button>
                      )}
                      {edu.logo && (
                        <img src={edu.logo} alt={edu.school} className="h-8 w-auto max-w-[120px] object-contain opacity-60" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {edu.topics.map((group) => (
                      <div key={group.label}>
                        <p className="label mb-2" style={{ color: 'var(--accent)', opacity: 0.75 }}>
                          {group.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.items.map((item) => <span key={item} className="tag text-[11px]">{item}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="mb-20">
            <p className="label mb-8">{te.sectionRef}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {references.map((ref, i) => (
                <motion.div key={i} {...stagger(i)} className="card p-6">
                  <div className="h-px mb-5" style={{ background: 'var(--accent)', opacity: 0.3 }} />
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded mb-4 inline-block"
                    style={{ background: 'var(--surface)', color: 'var(--fg-3)', border: '1px solid var(--border)' }}
                  >
                    {ref.relation}
                  </span>
                  <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>{ref.name}</h3>
                  <p className="body-sm font-medium mb-0.5" style={{ color: 'var(--fg-2)' }}>{ref.title}</p>
                  <p className="font-mono text-[12px]" style={{ color: 'var(--accent)' }}>{ref.company}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <p className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{ref.contact}</p>
                    {ref.linkedin && (
                      <a
                        href={ref.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[11px] transition-opacity hover:opacity-100"
                        style={{ color: 'var(--accent)', opacity: 0.75 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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

          {/* ── Certifications ── */}
          <section>
            <p className="label mb-8">{te.sectionCert}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CERTIFICATIONS.map((cert, i) => (
                <motion.div
                  key={i} {...stagger(i)}
                  className="card p-5 group"
                >
                  <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] mb-2" style={{ color: 'var(--fg-3)' }}>{cert.date}</p>
                      <h3 className="body-sm font-semibold leading-snug mb-1" style={{ color: 'var(--fg)' }}>
                        {cert.name}
                      </h3>
                      <p className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{cert.issuer}</p>
                    </div>
                    <IssuerBadge issuer={cert.issuer} />
                  </div>

                  {cert.url ? (
                    <a
                      href={cert.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] transition-opacity hover:opacity-100 mt-1"
                      style={{ color: 'var(--accent)', opacity: 0.7 }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      {te.verify}
                    </a>
                  ) : cert.image ? (
                    <button
                      onClick={() => setLightbox(cert.image!)}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] transition-opacity hover:opacity-100 mt-1"
                      style={{ color: 'var(--accent)', opacity: 0.7 }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      {te.verify}
                    </button>
                  ) : null}
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
