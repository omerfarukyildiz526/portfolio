'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Daktilo efekti + hafif "shine" + accent parıltı.
 * Tek metin verilirse bir kez yazıp durur; birden çok metin verilirse
 * sırayla yazar → bekler → siler → sonrakine geçer (sonsuz döngü).
 *
 * Zamanlama harf sayısına göre: yazma ve silme zaten harf başına ilerler,
 * bekleme süresi de cümlenin uzunluğuyla orantılıdır (uzun cümle daha uzun
 * durur). hold = max(minHold, uzunluk × holdPerChar).
 *
 * prefers-reduced-motion açıksa ilk metni animasyonsuz gösterir.
 */
export default function Typewriter({
  text,
  className = '',
  speed = 55,
  deleteSpeed = 28,
  holdPerChar = 90,
  minHold = 1200,
  startDelay = 350,
  baseColor = 'var(--fg-2)',
  highlightColor = 'var(--fg)',
  glowColor = 'var(--accent)',
}: {
  text: string | string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  holdPerChar?: number;
  minHold?: number;
  startDelay?: number;
  baseColor?: string;
  highlightColor?: string;
  glowColor?: string;
}) {
  const phrases = Array.isArray(text) ? text : [text];
  const cycle = phrases.length > 1;
  const key = phrases.join('|'); // dil değişince efekti sıfırla

  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState('');
  const [phase, setPhase] = useState<'typing' | 'hold' | 'deleting'>('typing');
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    setIdx(0); setShown(''); setPhase('typing');
  }, [key]);

  useEffect(() => {
    if (reduce.current) { setShown(phrases[0]); return; }
    const cur = phrases[idx % phrases.length];
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (shown.length < cur.length) {
        t = setTimeout(() => setShown(cur.slice(0, shown.length + 1)), shown.length === 0 ? startDelay : speed);
      } else if (cycle) {
        setPhase('hold');
      }
    } else if (phase === 'hold') {
      // Bekleme süresi harf sayısıyla orantılı: uzun cümle daha uzun durur.
      const wait = Math.max(minHold, cur.length * holdPerChar);
      t = setTimeout(() => setPhase('deleting'), wait);
    } else {
      if (shown.length > 0) {
        t = setTimeout(() => setShown(cur.slice(0, shown.length - 1)), deleteSpeed);
      } else {
        setIdx(i => i + 1); setPhase('typing');
      }
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, phase, idx, key]);

  const shining = phase === 'hold' || (!cycle && shown.length === phrases[0].length);

  return (
    <span className={className}>
      <motion.span
        style={{
          backgroundImage:
            `linear-gradient(110deg, ${baseColor} 0%, ${baseColor} 38%, ${highlightColor} 50%, ${baseColor} 62%, ${baseColor} 100%)`,
          backgroundSize: '220% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: `drop-shadow(0 0 10px color-mix(in srgb, ${glowColor} 35%, transparent))`,
        }}
        animate={shining ? { backgroundPositionX: ['160%', '-60%'] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
      >
        {shown}
      </motion.span>
      <motion.span
        aria-hidden
        className="inline-block align-middle"
        style={{
          width: '2px', height: '1.05em', marginLeft: 3, marginBottom: '-0.12em',
          background: glowColor,
          boxShadow: `0 0 8px color-mix(in srgb, ${glowColor} 70%, transparent)`,
        }}
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </span>
  );
}
