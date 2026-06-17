'use client';

import { ThemeProvider } from 'next-themes';
import NavBar from './NavBar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <NavBar />
      <div className="relative z-10">{children}</div>
    </ThemeProvider>
  );
}
