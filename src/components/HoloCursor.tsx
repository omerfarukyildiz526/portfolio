'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export default function HoloCursor() {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const idRef = useRef(0);

  // Dot: anlık takip
  const dotX = useSpring(mx, { damping: 32, stiffness: 750, mass: 0.25 });
  const dotY = useSpring(my, { damping: 32, stiffness: 750, mass: 0.25 });
  // Ring: yavaş, organik, biraz arkada kalıyor
  const ringX = useSpring(mx, { damping: 24, stiffness: 80, mass: 1.1 });
  const ringY = useSpring(my, { damping: 24, stiffness: 80, mass: 1.1 });

  useEffect(() => {
    let fadeInterval: ReturnType<typeof setInterval>;

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);

      if (Math.random() > 0.78) {
        const size = Math.random() * 2.5 + 1.5;
        setSparkles((prev) => [
          ...prev,
          {
            id: idRef.current++,
            x: e.clientX + (Math.random() - 0.5) * 12,
            y: e.clientY + (Math.random() - 0.5) * 12,
            size,
            opacity: 0.5,
          },
        ].slice(-12));
      }
    };

    const onDown = () => setClicked(true);
    const onUp   = () => setClicked(false);
    const onOver = (e: MouseEvent) => {
      setHovered(!!(e.target as Element).closest('a, button, [role="button"], input, select, textarea, label'));
    };

    fadeInterval = setInterval(() => {
      setSparkles((prev) =>
        prev.map((s) => ({ ...s, opacity: s.opacity - 0.09 })).filter((s) => s.opacity > 0)
      );
    }, 40);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('mouseover', onOver);

    return () => {
      clearInterval(fadeInterval);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('mouseover', onOver);
    };
  }, [mx, my]);

  const warmColor = hovered ? '#ff8c42' : '#fffaf0';

  return (
    <>
      {/* Küçük sıcak parıltı izi */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="fixed top-0 left-0 z-[99997] pointer-events-none rounded-full"
          style={{
            transform: `translate(${s.x - s.size / 2}px, ${s.y - s.size / 2}px)`,
            width:  s.size,
            height: s.size,
            background: warmColor,
            opacity:    s.opacity,
            boxShadow:  `0 0 ${s.size * 3}px ${warmColor}`,
          }}
        />
      ))}

      {/* Merkez nokta — hızlı, hassas */}
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          animate={{ scale: clicked ? 0.3 : hovered ? 0 : 1 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}
          style={{
            width:        8,
            height:       8,
            borderRadius: '50%',
            background:   '#ffffff',
            boxShadow:    '0 0 5px rgba(255,255,255,0.95), 0 0 14px rgba(255,250,235,0.45)',
          }}
        />
      </motion.div>

      {/* Dış halka — yavaş, organik */}
      <motion.div
        className="fixed top-0 left-0 z-[99998] pointer-events-none"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          animate={{
            scale:           hovered ? 2.0 : clicked ? 0.6 : 1,
            opacity:         hovered ? 0.95 : 0.4,
            borderColor:     hovered ? '#ff8c42' : 'rgba(255, 252, 245, 0.75)',
            backgroundColor: hovered ? 'rgba(255, 140, 66, 0.1)' : 'rgba(0,0,0,0)',
            boxShadow:       hovered
              ? '0 0 20px rgba(255,140,66,0.25)'
              : '0 0 8px rgba(255,250,235,0.10)',
          }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          style={{
            width:       36,
            height:      36,
            borderRadius:'50%',
            borderWidth: '1.5px',
            borderStyle: 'solid',
          }}
        />
      </motion.div>
    </>
  );
}
