'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/i18n';

// Terminal benzeri "canlı" yanıt kartı: GET /api/profile isteği atılır,
// dönen JSON satır satır (daktilo) belirir. API/terminal temasını pekiştirir.
type Token = { t: string; c?: string };
type Line = { indent: number; tokens: Token[] };

const P = { c: 'var(--fg-3)' };          // noktalama
const KEY = { c: 'var(--accent)' };       // anahtar
const STR = { c: 'var(--sx-str)' };       // string
const NUM = { c: 'var(--sx-num)' };       // sayı
const KW = { c: 'var(--sx-kw)' };         // boolean

export default function ApiDemo() {
  const { lang } = useLang();
  const tr = lang === 'tr';
  const [posts, setPosts] = useState<number | null>(null);
  const [shown, setShown] = useState(0);          // görünen satır sayısı
  const [runId, setRunId] = useState(0);          // "re-run" için
  const latency = useMemo(() => 30 + Math.floor(Math.random() * 40), [runId]);

  useEffect(() => {
    fetch('/api/posts', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d.posts) ? d.posts.length : null))
      .catch(() => setPosts(null));
  }, []);

  const lines = useMemo<Line[]>(() => {
    const q = (s: string): Token => ({ t: `"${s}"`, c: STR.c });
    return [
      { indent: 0, tokens: [{ t: '{', ...P }] },
      { indent: 1, tokens: [{ t: '"name"', ...KEY }, { t: ': ', ...P }, q('Ömer Faruk Yıldız'), { t: ',', ...P }] },
      { indent: 1, tokens: [{ t: '"role"', ...KEY }, { t: ': ', ...P }, q('Backend Developer'), { t: ',', ...P }] },
      { indent: 1, tokens: [{ t: '"company"', ...KEY }, { t: ': ', ...P }, q('Barsan Global Lojistik'), { t: ',', ...P }] },
      { indent: 1, tokens: [{ t: '"location"', ...KEY }, { t: ': ', ...P }, q('İstanbul, TR'), { t: ',', ...P }] },
      {
        indent: 1,
        tokens: [
          { t: '"stack"', ...KEY }, { t: ': [', ...P },
          q('Python'), { t: ', ', ...P }, q('C#/.NET'), { t: ', ', ...P }, q('RPA'),
          { t: '],', ...P },
        ],
      },
      { indent: 1, tokens: [{ t: '"posts"', ...KEY }, { t: ': ', ...P }, { t: String(posts ?? '…'), c: posts == null ? P.c : NUM.c }, { t: ',', ...P }] },
      { indent: 1, tokens: [{ t: '"open_to_work"', ...KEY }, { t: ': ', ...P }, { t: 'true', ...KW }, { t: ',', ...P }] },
      { indent: 1, tokens: [{ t: '"response_ms"', ...KEY }, { t: ': ', ...P }, { t: String(latency), ...NUM }] },
      { indent: 0, tokens: [{ t: '}', ...P }] },
    ];
  }, [posts, latency]);

  const lineCount = lines.length;

  // Yüklenince (ve her re-run'da) JSON'u satır satır daktilo et.
  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(lineCount); return; }

    setShown(0);
    let n = 0;
    const timer = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= lineCount) clearInterval(timer);
    }, 130);
    return () => clearInterval(timer);
  }, [runId, lineCount]);

  const done = shown >= lines.length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {/* Başlık: istek satırı + durum */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="method-get">GET</span>
        <span className="font-mono text-[12px]" style={{ color: 'var(--fg)' }}>/api/profile</span>
        <span className="font-mono text-[11px] ml-auto flex items-center gap-1.5" style={{ color: 'var(--fg-3)' }}>
          {done && (
            <>
              <span className="status-dot" style={{ background: '#30D158' }} />
              200 OK · {latency}ms
            </>
          )}
        </span>
        <button
          onClick={() => setRunId((n) => n + 1)}
          aria-label={tr ? 'Yeniden çalıştır' : 'Re-run'}
          title={tr ? 'Yeniden çalıştır' : 'Re-run'}
          className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded transition-colors"
          style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
        >
          ↻
        </button>
      </div>

      {/* Gövde: JSON yanıtı */}
      <pre
        className="px-4 py-4 overflow-x-auto"
        style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 12.5, lineHeight: 1.7, margin: 0 }}
      >
        {lines.slice(0, shown).map((line, i) => (
          <motion.div
            key={`${runId}-${i}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            style={{ paddingLeft: line.indent * 18 }}
          >
            {line.tokens.map((tk, j) => (
              <span key={j} style={{ color: tk.c ?? 'var(--fg-2)' }}>{tk.t}</span>
            ))}
            {!done && i === shown - 1 && (
              <span className="cursor-blink" style={{ color: 'var(--accent)' }}> ▋</span>
            )}
          </motion.div>
        ))}
      </pre>
    </div>
  );
}
