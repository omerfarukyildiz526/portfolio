'use client';

import { useEffect, useRef, useState } from 'react';

// Sabit, tıklanamayan arka plan katmanı: yumuşak mesh gradient lekeleri +
// ince grain doku + imleci izleyen spotlight (yalnızca masaüstü, reduced-motion
// kapalıysa). İçeriğin arkasında durur (z-0), gövde rengiyle uyumludur.
export default function BackgroundFX() {
  const spotRef = useRef<HTMLDivElement>(null);
  const [spotOn, setSpotOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setSpotOn(true);

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (spotRef.current) {
          spotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        }
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Mesh gradient lekeleri */}
      <div
        className="absolute -top-40 -left-32 rounded-full"
        style={{
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute -bottom-48 -right-40 rounded-full"
        style={{
          width: 560,
          height: 560,
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-post) 12%, transparent), transparent 70%)',
          filter: 'blur(48px)',
        }}
      />

      {/* Grain doku */}
      <div className="bg-grain absolute inset-0" style={{ opacity: 0.05, mixBlendMode: 'overlay' }} />

      {/* İmleç spotlight */}
      {spotOn && (
        <div
          ref={spotRef}
          className="absolute top-0 left-0"
          style={{
            width: 640,
            height: 640,
            marginLeft: -320,
            marginTop: -320,
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 7%, transparent), transparent 60%)',
            willChange: 'transform',
          }}
        />
      )}
    </div>
  );
}
