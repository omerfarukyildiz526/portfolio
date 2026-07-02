'use client';

import { useMemo } from 'react';

/**
 * Bağımlılıksız, hafif sözdizimi vurgulayıcı.
 * Kütüphane yüklemeden string/yorum/sayı/anahtar kelime/fonksiyon çağrısı
 * ayrımı yapar. Amaç mükemmel bir parser değil, kod bloğunu okunur kılmak.
 * Renkler globals.css'teki --sx-* değişkenlerinden gelir (temaya duyarlı).
 */

// Diller arası geniş anahtar kelime kümesi (Python, C#, JS/TS, SQL, bash,
// Dockerfile, YAML, Go). Küçük/büyük harf duyarlı — Docker komutları dahil.
const KEYWORDS = new Set([
  // ortak kontrol/deklarasyon
  'const','let','var','function','def','class','return','if','else','elif','for','while',
  'foreach','do','switch','case','break','continue','in','of','import','from','as','using',
  'namespace','async','await','new','try','catch','except','finally','throw','raise','with',
  'yield','lambda','this','self','base','super','public','private','protected','internal',
  'static','readonly','virtual','override','abstract','sealed','partial','void','get','set',
  'package','func','type','struct','interface','enum','map','defer','go','chan','nil','pass',
  'and','or','not','is','del','global','nonlocal','assert','match','when','where','out','ref',
  // SQL
  'SELECT','INSERT','UPDATE','DELETE','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER',
  'ON','GROUP','ORDER','BY','INTO','VALUES','SET','LIMIT','HAVING','AS','AND','OR','NULL',
  // Dockerfile
  'FROM','RUN','COPY','ADD','WORKDIR','EXPOSE','ENTRYPOINT','CMD','ENV','ARG','LABEL','USER','VOLUME',
]);

// Boole/null gibi sabitler ve yaygın tip/builtin adları
const BUILTINS = new Set([
  'true','false','True','False','None','null','undefined','int','string','bool','decimal',
  'double','float','long','short','byte','char','object','str','list','dict','tuple','set',
  'print','len','range','console','Console','await','Task','IActionResult','DateTime','var',
]);

// Gruplar: 1=yorum · 2=dizgi · 3=sayı · 4=fonksiyon çağrısı · 5=tanımlayıcı
// (adlandırılmamış gruplar; ES2018 altı hedefle uyumlu)
const RE =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d[\w.]*\b)|([A-Za-z_]\w*(?=\s*\())|([A-Za-z_]\w*)/g;

type Tok = { t: string; v: string };

function tokenize(code: string): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  for (const m of code.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: 'plain', v: code.slice(last, i) });
    if (m[1]) out.push({ t: 'com', v: m[0] });
    else if (m[2]) out.push({ t: 'str', v: m[0] });
    else if (m[3]) out.push({ t: 'num', v: m[0] });
    else if (m[4]) out.push({ t: KEYWORDS.has(m[0]) ? 'kw' : 'fn', v: m[0] });
    else out.push({ t: KEYWORDS.has(m[0]) ? 'kw' : BUILTINS.has(m[0]) ? 'bi' : 'plain', v: m[0] });
    last = i + m[0].length;
  }
  if (last < code.length) out.push({ t: 'plain', v: code.slice(last) });
  return out;
}

const CLS: Record<string, string> = {
  com: 'sx-com', str: 'sx-str', num: 'sx-num', fn: 'sx-fn', kw: 'sx-kw', bi: 'sx-bi',
};

export default function Code({ children }: { children: string }) {
  const toks = useMemo(() => tokenize(children ?? ''), [children]);
  return (
    <code>
      {toks.map((tok, i) =>
        tok.t === 'plain'
          ? <span key={i}>{tok.v}</span>
          : <span key={i} className={CLS[tok.t]}>{tok.v}</span>
      )}
    </code>
  );
}
