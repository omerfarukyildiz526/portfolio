'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LINKS = [
  {
    method: 'GET',
    endpoint: '/contact/github',
    name: 'GitHub',
    href: 'https://github.com/OmerFaruk-YILDIZ',
    detail: 'OmerFaruk-YILDIZ',
    status: '200 OK',
    desc: 'Kod repolarım, katkılar ve açık kaynak projelerim.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
        <path d="M9 18c-4.51 2-5-2-7-2"/>
      </svg>
    ),
    wide: false,
  },
  {
    method: 'GET',
    endpoint: '/contact/linkedin',
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/omerfaruk-yildiz/',
    detail: 'omerfaruk-yildiz',
    status: '200 OK',
    desc: 'Profesyonel profil, iş deneyimi ve bağlantılar.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect width="4" height="12" x="2" y="9"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    wide: false,
  },
  {
    method: 'GET',
    endpoint: '/contact/instagram',
    name: 'Instagram',
    href: 'https://www.instagram.com/omerfarukYLDZ_/',
    detail: 'omerfarukYLDZ_',
    status: '200 OK',
    desc: 'Kişisel içerikler ve günlük paylaşımlar.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
    wide: false,
  },
  {
    method: 'POST',
    endpoint: '/contact/email',
    name: 'E-Posta',
    href: 'mailto:omerfaruk_yildiz@outlook.com',
    detail: 'omerfaruk_yildiz@outlook.com',
    status: '201 Created',
    desc: 'Doğrudan iletişim için e-posta gönder. Proje teklifleri ve işbirliği talepleri.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    wide: true,
  },
];

const Arrow = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       className="group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
       style={{ color: color + '40' }}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

export default function Contact() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {LINKS.map((link, i) => {
        const isPost = link.method === 'POST';
        const mc = isPost ? '#ff8c42' : '#4488ff';

        return (
          <motion.a
            key={link.name}
            href={link.href}
            target={isPost ? undefined : '_blank'}
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="group card rounded-xl overflow-hidden block transition-all duration-250"
            style={{
              gridColumn: link.wide ? '1 / -1' : undefined,
              borderLeft: `3px solid ${mc}55`,
            }}
          >
            {link.wide ? (
              /* ── E-Posta: geniş kart, yatay düzen ── */
              <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Sol: ikon + isim */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="p-3 rounded-xl transition-colors"
                    style={{
                      color: mc,
                      background: mc + '18',
                      border: `1px solid ${mc}35`,
                    }}>
                    {link.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: mc }}>{link.method}</span>
                      <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{link.endpoint}</span>
                    </div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter" style={{ color: 'var(--fg)' }}>{link.name}</h3>
                    <p className="text-[10px] font-mono tracking-tight" style={{ color: 'var(--dim)' }}>{link.detail}</p>
                  </div>
                </div>

                {/* Orta: açıklama */}
                <p className="text-[11px] leading-relaxed font-mono flex-1" style={{ color: 'var(--dim)' }}>{link.desc}</p>

                {/* Sağ: durum + ok */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[9px] font-mono" style={{ color: mc, opacity: 0.7 }}>{link.status}</span>
                  <Arrow color={mc} />
                </div>
              </div>
            ) : (
              /* ── Küçük kartlar: dikey düzen ── */
              <div className="p-5 md:p-6 flex flex-col justify-between min-h-[160px] md:h-52">
                <div>
                  <div className="flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: mc }}>{link.method}</span>
                    <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{link.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl transition-colors"
                      style={{
                        color: mc,
                        background: mc + '18',
                        border: `1px solid ${mc}35`,
                      }}>
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase italic tracking-tighter" style={{ color: 'var(--fg)' }}>{link.name}</h3>
                      <p className="text-[10px] font-mono tracking-tight" style={{ color: 'var(--dim)' }}>{link.detail}</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed font-mono" style={{ color: 'var(--dim)' }}>{link.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[9px] font-mono" style={{ color: mc, opacity: 0.7 }}>{link.status}</span>
                  <Arrow color={mc} />
                </div>
              </div>
            )}
          </motion.a>
        );
      })}
    </div>
  );
}
