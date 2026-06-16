'use client';

import NavBar from './NavBar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <div className="relative z-10">{children}</div>
    </>
  );
}
