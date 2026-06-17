'use client';

import { useState, useEffect, useRef } from 'react';

const ACCENTS = [
  { key: 'blue',   color: '#4488ff', label: 'Mavi' },
  { key: 'green',  color: '#22c55e', label: 'Yeşil' },
  { key: 'purple', color: '#a855f7', label: 'Mor' },
  { key: 'pink',   color: '#ec4899', label: 'Pembe' },
  { key: 'cyan',   color: '#06b6d4', label: 'Camgöbeği' },
  { key: 'orange', color: '#ff8c42', label: 'Turuncu' },
];

export default function AccentPicker() {
  const [open, setOpen]     = useState(false);
  const [accent, setAccent] = useState('blue');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('accent') ?? 'blue';
    setAccent(saved);
    document.documentElement.setAttribute('data-accent', saved);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (key: string) => {
    setAccent(key);
    localStorage.setItem('accent', key);
    document.documentElement.setAttribute('data-accent', key);
    setOpen(false);
  };

  const current = ACCENTS.find(a => a.key === accent) ?? ACCENTS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ border: `2px solid ${current.color}55` }}
        title="Renk seç"
      >
        <span className="w-3.5 h-3.5 rounded-full block" style={{ background: current.color }} />
      </button>

      {open && (
        <div
          className="absolute top-10 right-0 p-2.5 rounded-xl z-50"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: '130px',
          }}
        >
          <p className="text-[8px] font-mono uppercase tracking-widest text-white/30 mb-2 px-0.5">Vurgu Rengi</p>
          <div className="flex flex-col gap-1">
            {ACCENTS.map(a => (
              <button
                key={a.key}
                onClick={() => pick(a.key)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 w-full text-left"
                style={{
                  background: accent === a.key ? `${a.color}18` : 'transparent',
                  border: accent === a.key ? `1px solid ${a.color}40` : '1px solid transparent',
                }}
              >
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <span className="text-[10px] font-mono" style={{ color: accent === a.key ? a.color : 'rgba(255,255,255,0.4)' }}>
                  {a.label}
                </span>
                {accent === a.key && (
                  <svg className="ml-auto" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: a.color }}>
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
