'use client';

import { useState, useEffect } from 'react';
import { useLang } from './i18n';
import type { SiteContent, PageKey } from './site-content';

// Bir sayfanın o anki dildeki düzenlenebilir içeriğini DB'den çeker.
// Yüklenene (veya hata olana) kadar null döner; sayfalar bu durumda
// translations.ts'deki statik değerlere düşmelidir.
export function usePageContent<P extends PageKey>(page: P): SiteContent[P]['tr'] | null {
  const { lang } = useLang();
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/site-content', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (alive && d?.content) setContent(d.content); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return content ? content[page][lang] : null;
}
