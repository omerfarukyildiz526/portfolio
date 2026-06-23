'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'tr' | 'en';

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: 'tr', setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'tr' || stored === 'en') setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
