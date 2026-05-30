'use client';

import React, { useEffect, useRef } from 'react';

export default function MatrixRain({
  color = '#00f5ff',
  hiz = 55,
  siklik = 18,
  opacity = 0.06,
}: {
  color?: string;
  hiz?: number;
  siklik?: number;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>[]{}$#@!'.split('');
    const fontSize = siklik;
    const columns = Math.floor(W / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.055)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, hiz);

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, hiz, siklik]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity, filter: 'blur(0.3px)' }}
    />
  );
}
