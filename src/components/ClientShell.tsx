'use client';

import { ThemeProvider } from 'next-themes';
import { LangProvider } from '@/lib/i18n';
import NavBar from './NavBar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <LangProvider>
        <NavBar />
        <div className="relative z-10">{children}</div>
      </LangProvider>
    </ThemeProvider>
  );
}
