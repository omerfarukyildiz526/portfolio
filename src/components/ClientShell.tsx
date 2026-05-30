'use client';

import dynamic from 'next/dynamic';
import NavBar from './NavBar';

const NeuralCanvas = dynamic(() => import('./NeuralCanvas'), { ssr: false });
const HoloCursor   = dynamic(() => import('./HoloCursor'),   { ssr: false });

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NeuralCanvas />
      <HoloCursor />
      {/* Noise grain */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <NavBar />
      <div className="relative z-10">{children}</div>
    </>
  );
}
