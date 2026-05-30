'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
}

export default function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const COUNT = 55;
    const MAX_DIST = 160;

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.5 + 0.5,
    }));

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const p of particles) {
        // Subtle mouse repulsion
        const dx = p.x - mx, dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 && d > 0) {
          const f = ((120 - d) / 120) * 0.03;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        // Speed cap + friction
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1) { p.vx = (p.vx / speed); p.vy = (p.vy / speed); }
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.vx += (Math.random() - 0.5) * 0.015;
        p.vy += (Math.random() - 0.5) * 0.015;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      }

      // Connections
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(68,136,255,${(1 - dist / MAX_DIST) * 0.25})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(68,136,255,0.55)';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.5 }}
    />
  );
}
