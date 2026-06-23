'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProfileStack from '@/components/ProfileStack';

// ─── API Endpoint Card ─────────────────────────────────────────────────────────
function EndpointCard({ method, path, desc, href, delay = 0 }: {
  method: string; path: string; desc: string; href: string; delay?: number;
}) {
  const mc = method === 'GET' ? '#4488ff' : method === 'POST' ? '#ff8c42' : '#60a5fa';
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ borderColor: mc + '55' }}
          whileTap={{ scale: 0.99 }}
          className="group flex items-center gap-5 p-5 rounded-md border transition-all duration-200 relative overflow-hidden card"
          style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
               style={{ background: mc }} />
          <div className="flex-shrink-0 w-1 h-10 rounded-full group-hover:animate-glow-pulse" style={{ background: mc, boxShadow: `0 0 10px ${mc}` }} />
          <span className="text-[11px] font-black uppercase tracking-widest flex-shrink-0 w-12 heading-accent" style={{ color: mc }}>
            {method}
          </span>
          <span className="text-sm font-bold flex-shrink-0 text-premium transition-colors" style={{ color: 'var(--fg)' }}>
            {path}
          </span>
          <span className="text-[11px] font-mono flex-1 truncate hidden md:block" style={{ color: 'var(--dim)' }}>
            // {desc}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
               className="group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
               style={{ color: 'var(--dim-soft)' }}>
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Terminal Line Types ───────────────────────────────────────────────────────
type TermLine = {
  id: number;
  text: string;
  color?: string;
  isInput?: boolean;
  indent?: number;
};

const WELCOME_LINES: Omit<TermLine, 'id'>[] = [
  { text: 'Ömer Faruk Yıldız — Portfolio Terminal v1.0.0', color: '#4488ff' },
  { text: '──────────────────────────────────────────────', color: 'rgba(68,136,255,0.3)' },
  { text: 'Komut listesi için  help  yazın.', color: 'rgba(244,244,244,0.35)' },
  { text: '' },
];

const COMMANDS: Record<string, (args: string[], history: string[]) => Omit<TermLine, 'id'>[]> = {
  help: () => [
    { text: '' },
    { text: 'Kullanılabilir komutlar:', color: '#4488ff' },
    { text: '  whoami          → Geliştirici bilgisi', color: 'rgba(244,244,244,0.45)' },
    { text: '  skills          → Teknoloji stack', color: 'rgba(244,244,244,0.45)' },
    { text: '  projects        → Proje listesi', color: 'rgba(244,244,244,0.45)' },
    { text: '  contact         → İletişim bilgileri', color: 'rgba(244,244,244,0.45)' },
    { text: '  ls              → Dizin içeriği', color: 'rgba(244,244,244,0.45)' },
    { text: '  cat [dosya]     → Dosya içeriği', color: 'rgba(244,244,244,0.45)' },
    { text: '  curl [endpoint] → API simülasyonu', color: 'rgba(244,244,244,0.45)' },
    { text: '  git log         → Commit geçmişi', color: 'rgba(244,244,244,0.45)' },
    { text: '  date            → Tarih & saat', color: 'rgba(244,244,244,0.45)' },
    { text: '  uname           → Sistem bilgisi', color: 'rgba(244,244,244,0.45)' },
    { text: '  history         → Komut geçmişi', color: 'rgba(244,244,244,0.45)' },
    { text: '  clear           → Terminali temizle', color: 'rgba(244,244,244,0.45)' },
    { text: '' },
  ],

  whoami: () => [
    { text: '' },
    { text: 'HTTP/1.1 200 OK', color: '#4488ff' },
    { text: 'Content-Type: application/json', color: 'rgba(244,244,244,0.25)' },
    { text: '' },
    { text: '{', color: 'rgba(244,244,244,0.5)' },
    { text: '  "name":           "Ömer Faruk Yıldız",', color: '#fbbf24' },
    { text: '  "role":           "Yazılım Uzmanı",', color: '#fbbf24' },
    { text: '  "company":        "Barsan Global Lojistik",', color: '#fbbf24' },
    { text: '  "location":       "Türkiye",', color: '#fbbf24' },
    { text: '  "experience":     "3+ yıl",', color: '#fbbf24' },
    { text: '  "specialization": ["Python", "C#", ".NET", "RPA"],', color: '#60a5fa' },
    { text: '  "available":      true,', color: '#4488ff' },
    { text: '  "status":         "Sistemler inşa ediliyor..."', color: '#fbbf24' },
    { text: '}', color: 'rgba(244,244,244,0.5)' },
    { text: '' },
  ],

  skills: () => [
    { text: '' },
    { text: 'HTTP/1.1 200 OK', color: '#4488ff' },
    { text: '' },
    { text: '{', color: 'rgba(244,244,244,0.5)' },
    { text: '  "backend":    ["Python", "C#", ".NET", "Node.js", "FastAPI"],', color: '#60a5fa' },
    { text: '  "database":   ["PostgreSQL", "MSSQL", "Redis", "MongoDB"],', color: '#34d399' },
    { text: '  "devops":     ["Docker", "Git", "Linux", "CI/CD"],', color: '#ff8c42' },
    { text: '  "automation": ["UiPath", "RPA", "Selenium", "Playwright"],', color: '#a78bfa' },
    { text: '  "frontend":   ["Next.js", "React", "TypeScript", "Tailwind"],', color: '#fbbf24' },
    { text: '  "tools":      ["VS Code", "Postman", "Figma", "Jira"]', color: 'rgba(244,244,244,0.45)' },
    { text: '}', color: 'rgba(244,244,244,0.5)' },
    { text: '' },
  ],

  projects: () => [
    { text: '' },
    { text: 'HTTP/1.1 200 OK', color: '#4488ff' },
    { text: '' },
    { text: '[', color: 'rgba(244,244,244,0.5)' },
    { text: '  { "name": "Portfolio API",    "stack": "Next.js + TypeScript",    "status": "live"       },', color: '#fbbf24' },
    { text: '  { "name": "RPA Otomasyon",    "stack": "UiPath + Python",          "status": "production" },', color: '#fbbf24' },
    { text: '  { "name": "Lojistik Backend", "stack": "C# .NET + PostgreSQL",     "status": "active"     },', color: '#fbbf24' },
    { text: '  { "name": "Web Scraper",      "stack": "Python + Playwright",      "status": "active"     }', color: '#fbbf24' },
    { text: ']', color: 'rgba(244,244,244,0.5)' },
    { text: '' },
    { text: '→ Tüm projeler için:  /projects  sayfasına gidin.', color: 'rgba(68,136,255,0.6)' },
    { text: '' },
  ],

  contact: () => [
    { text: '' },
    { text: 'HTTP/1.1 200 OK', color: '#4488ff' },
    { text: '' },
    { text: '{', color: 'rgba(244,244,244,0.5)' },
    { text: '  "email":    "oy1264204@gmail.com",', color: '#fbbf24' },
    { text: '  "github":   "github.com/OmerFaruk-YILDIZ",', color: '#60a5fa' },
    { text: '  "linkedin": "linkedin.com/in/ömer-faruk-yıldız",', color: '#60a5fa' },
    { text: '  "response": "< 24 saat"', color: '#34d399' },
    { text: '}', color: 'rgba(244,244,244,0.5)' },
    { text: '' },
  ],

  ls: () => [
    { text: '' },
    { text: 'drwxr-xr-x  README.md', color: '#60a5fa' },
    { text: 'drwxr-xr-x  package.json', color: '#60a5fa' },
    { text: 'drwxr-xr-x  src/', color: '#fbbf24' },
    { text: 'drwxr-xr-x  public/', color: '#fbbf24' },
    { text: '-rw-r--r--  .env.local', color: '#ff8c42' },
    { text: '-rw-r--r--  next.config.ts', color: 'rgba(244,244,244,0.45)' },
    { text: '-rw-r--r--  tailwind.config.ts', color: 'rgba(244,244,244,0.45)' },
    { text: '' },
  ],

  date: () => [
    { text: '' },
    { text: new Date().toLocaleString('tr-TR', { dateStyle: 'full', timeStyle: 'medium' }), color: '#fbbf24' },
    { text: `UTC: ${new Date().toUTCString()}`, color: 'rgba(244,244,244,0.3)' },
    { text: '' },
  ],

  uname: () => [
    { text: '' },
    { text: 'Portfolio-OS 1.0.0 #1 SMP Next.js x86_64 TypeScript', color: 'rgba(244,244,244,0.5)' },
    { text: '' },
  ],

  pwd: () => [
    { text: '' },
    { text: '/home/omerfaruk/portfolio', color: '#fbbf24' },
    { text: '' },
  ],

  history: (_args, hist) => [
    { text: '' },
    ...hist.slice().reverse().map((cmd, i) => ({
      text: `  ${String(i + 1).padStart(3, ' ')}  ${cmd}`,
      color: 'rgba(244,244,244,0.4)',
    })),
    { text: '' },
  ],

  'git log': () => [
    { text: '' },
    { text: 'commit a3f8c21  (HEAD -> main)', color: '#fbbf24' },
    { text: 'Author: Ömer Faruk Yıldız <oy1264204@gmail.com>', color: 'rgba(244,244,244,0.4)' },
    { text: 'Date:   ' + new Date().toDateString(), color: 'rgba(244,244,244,0.3)' },
    { text: '    feat: interaktif terminal eklendi', color: 'rgba(244,244,244,0.6)' },
    { text: '' },
    { text: 'commit b7d2e15', color: '#fbbf24' },
    { text: 'Author: Ömer Faruk Yıldız <oy1264204@gmail.com>', color: 'rgba(244,244,244,0.4)' },
    { text: 'Date:   Thu May 15 2025', color: 'rgba(244,244,244,0.3)' },
    { text: '    feat: portfolio ana sayfa tasarımı', color: 'rgba(244,244,244,0.6)' },
    { text: '' },
    { text: 'commit c1a9f03', color: '#fbbf24' },
    { text: 'Author: Ömer Faruk Yıldız <oy1264204@gmail.com>', color: 'rgba(244,244,244,0.4)' },
    { text: 'Date:   Mon Apr 28 2025', color: 'rgba(244,244,244,0.3)' },
    { text: '    init: proje başlangıcı', color: 'rgba(244,244,244,0.6)' },
    { text: '' },
  ],

  sudo: (args) => [
    { text: '' },
    { text: `sudo: ${args.join(' ') || 'komut'}: Permission denied.`, color: '#ef4444' },
    { text: 'Bu sistem izin gerektiriyor. Yetkisiz erişim loglandı.', color: 'rgba(244,244,244,0.3)' },
    { text: '' },
  ],

  echo: (args) => [
    { text: '' },
    { text: args.join(' ') || '', color: 'rgba(244,244,244,0.6)' },
    { text: '' },
  ],
};

const CAT_FILES: Record<string, Omit<TermLine, 'id'>[]> = {
  'README.md': [
    { text: '' },
    { text: '# Ömer Faruk Yıldız — Portfolio', color: '#4488ff' },
    { text: '' },
    { text: 'Backend geliştirici, otomasyon uzmanı.', color: 'rgba(244,244,244,0.5)' },
    { text: 'Python · C# · .NET · RPA · Web API', color: '#fbbf24' },
    { text: '' },
    { text: '## Çalıştırmak için', color: '#60a5fa' },
    { text: '  npm install && npm run dev', color: 'rgba(244,244,244,0.4)' },
    { text: '' },
  ],
  'package.json': [
    { text: '' },
    { text: '{', color: 'rgba(244,244,244,0.5)' },
    { text: '  "name": "backend-portfolio",', color: '#fbbf24' },
    { text: '  "version": "1.0.0",', color: '#fbbf24' },
    { text: '  "framework": "Next.js 15",', color: '#fbbf24' },
    { text: '  "dependencies": { "next": "^15", "framer-motion": "^12", "react": "^19" }', color: '#60a5fa' },
    { text: '}', color: 'rgba(244,244,244,0.5)' },
    { text: '' },
  ],
  '.env.local': [
    { text: '' },
    { text: 'cat: .env.local: İzin reddedildi.', color: '#ef4444' },
    { text: 'Gizli dosyalara erişim yasaktır.', color: 'rgba(244,244,244,0.3)' },
    { text: '' },
  ],
};

const CURL_ENDPOINTS: Record<string, Omit<TermLine, 'id'>[]> = {
  '/api/developer': COMMANDS['whoami']([], []),
  '/api/skills':    COMMANDS['skills']([], []),
  '/api/projects':  COMMANDS['projects']([], []),
  '/api/contact':   COMMANDS['contact']([], []),
};

// ─── Interactive Terminal ──────────────────────────────────────────────────────
function InteractiveTerminal() {
  const idRef = useRef(0);
  const nextId = () => idRef.current++;

  const makeLines = useCallback((defs: Omit<TermLine, 'id'>[]): TermLine[] =>
    defs.map(d => ({ ...d, id: nextId() })), []);

  const [lines, setLines] = useState<TermLine[]>(() =>
    WELCOME_LINES.map(d => ({ ...d, id: idRef.current++ })));
  const [input, setInput]     = useState('');
  const [cmdHist, setCmdHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const inputRef  = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const append = useCallback((defs: Omit<TermLine, 'id'>[]) => {
    setLines(prev => [...prev, ...defs.map(d => ({ ...d, id: idRef.current++ }))]);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const runCommand = useCallback((raw: string) => {
    const cmd = raw.trim();

    // echo the input
    append([{ text: cmd, color: 'rgba(244,244,244,0.75)', isInput: true }]);

    if (!cmd) { append([{ text: '' }]); return; }

    // special: rm -rf /
    if (/^rm\s+-rf\s+\//.test(cmd)) {
      append([
        { text: '' },
        { text: 'Siliniyor: /', color: '#ef4444' },
        { text: '...', color: '#ef4444' },
        { text: '...', color: '#ef4444' },
        { text: 'Şaka şaka. Bu bir portfolio sitesi.', color: '#fbbf24' },
        { text: '' },
      ]);
      return;
    }

    // clear
    if (cmd === 'clear') {
      setLines(makeLines(WELCOME_LINES));
      return;
    }

    // git log (special multi-word command)
    if (cmd === 'git log' || cmd === 'git log --oneline') {
      append(makeLines(COMMANDS['git log']([], cmdHist)));
      return;
    }

    const parts = cmd.split(/\s+/);
    const verb  = parts[0].toLowerCase();
    const args  = parts.slice(1);

    // sudo
    if (verb === 'sudo') {
      append(makeLines(COMMANDS['sudo'](args, cmdHist)));
      return;
    }

    // echo
    if (verb === 'echo') {
      append(makeLines(COMMANDS['echo'](args, cmdHist)));
      return;
    }

    // cat
    if (verb === 'cat') {
      const file = args[0] ?? '';
      const content = CAT_FILES[file];
      if (content) {
        append(makeLines(content));
      } else if (!file) {
        append([{ text: '' }, { text: 'Kullanım: cat [dosya]  (örn: cat README.md)', color: 'rgba(244,244,244,0.4)' }, { text: '' }]);
      } else {
        append([{ text: '' }, { text: `cat: ${file}: Dosya bulunamadı.`, color: '#ef4444' }, { text: '' }]);
      }
      return;
    }

    // curl
    if (verb === 'curl') {
      const endpoint = args.find(a => a.startsWith('/')) ?? args[args.length - 1] ?? '';
      const clean = endpoint.replace(/^https?:\/\/[^/]+/, '');
      const content = CURL_ENDPOINTS[clean];
      if (content) {
        append(makeLines([
          { text: '' },
          { text: `> GET ${endpoint}`, color: 'rgba(244,244,244,0.3)' },
          ...content,
        ]));
      } else {
        append([
          { text: '' },
          { text: `curl: endpoint bulunamadı: ${endpoint}`, color: '#ef4444' },
          { text: 'Geçerli endpointler: /api/developer  /api/skills  /api/projects  /api/contact', color: 'rgba(244,244,244,0.3)' },
          { text: '' },
        ]);
      }
      return;
    }

    // history
    if (verb === 'history') {
      append(makeLines(COMMANDS['history'](args, cmdHist)));
      return;
    }

    // git (any other)
    if (verb === 'git') {
      append([
        { text: '' },
        { text: `git: '${args[0] ?? ''}' desteklenmiyor. Dene: git log`, color: 'rgba(244,244,244,0.35)' },
        { text: '' },
      ]);
      return;
    }

    // registered single-word commands
    const handler = COMMANDS[verb];
    if (handler) {
      append(makeLines(handler(args, cmdHist)));
      return;
    }

    // not found
    append([
      { text: '' },
      { text: `bash: ${verb}: komut bulunamadı. 'help' yazın.`, color: '#ef4444' },
      { text: '' },
    ]);
  }, [append, cmdHist, makeLines]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = input;
      if (val.trim()) {
        setCmdHist(prev => [val, ...prev]);
      }
      setHistIdx(-1);
      setInput('');
      runCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHist.length - 1);
      setHistIdx(next);
      setInput(cmdHist[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : (cmdHist[next] ?? ''));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // simple tab completion for known commands
      const knownCmds = ['help', 'whoami', 'skills', 'projects', 'contact', 'ls', 'cat', 'curl', 'git log', 'date', 'uname', 'pwd', 'history', 'clear', 'echo', 'sudo'];
      const match = knownCmds.find(c => c.startsWith(input) && c !== input);
      if (match) setInput(match);
    }
  };

  return (
    <div
      className="terminal rounded-md overflow-hidden flex flex-col h-full"
      style={{ cursor: 'text' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="terminal-header flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-blue-500/50" />
        </div>
        <span className="text-[10px] font-mono text-white/25 tracking-widest">
          bash — portfolio/terminal
        </span>
        <span className="text-[9px] font-mono text-[#4488ff]/40 tracking-widest uppercase">INTERACTIVE</span>
      </div>

      {/* Scrollable output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 pt-4 pb-2 space-y-[2px]"
        style={{ fontFamily: 'var(--font-jetbrains, monospace)', maxHeight: 'min(420px, 40vh)', minHeight: '200px' }}
      >
        {lines.map(line => (
          <div key={line.id} className="flex items-start text-[12px] leading-[1.7]">
            {line.isInput && (
              <span style={{ color: '#4488ff', marginRight: '8px', flexShrink: 0 }}>$</span>
            )}
            <span style={{ color: line.color ?? 'var(--dim)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {line.text}
            </span>
          </div>
        ))}

        {/* Input row */}
        <div className="flex items-center text-[12px] mt-1">
          <span style={{ color: '#4488ff', marginRight: '8px', flexShrink: 0 }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none"
            style={{
              color: 'var(--fg)',
              caretColor: '#4488ff',
              fontFamily: 'var(--font-jetbrains, monospace)',
              fontSize: '12px',
              cursor: 'text',
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder=""
          />
        </div>

        {/* Scroll anchor */}
        <div style={{ height: '8px' }} />
      </div>

      {/* Footer hint */}
      <div className="px-5 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--dim-soft)' }}>
          TAB: tamamla &nbsp;·&nbsp; ↑↓: geçmiş &nbsp;·&nbsp; help: komutlar
        </span>
      </div>
    </div>
  );
}

// ─── QUOTES ───────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: 'Başarısız olsak bile çabalarımız boşa değildir.', author: 'Nikola Tesla' },
  { text: 'Hayal gücü bilgiden daha önemlidir.', author: 'Albert Einstein' },
  { text: 'Kod yazmak şiir yazmak gibidir; kısa, güzel ve anlamlı olmalıdır.', author: 'Anonim' },
  { text: 'Önce çöz, sonra optimize et.', author: 'Kent Beck' },
  { text: 'Her uzman, bir zamanlar acemiydi.', author: 'Helen Hayes' },
];

function QuoteCarousel() {
  const [idx, setIdx]       = useState(0);
  const [dir, setDir]       = useState(1);
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (next: number, d: number) => {
    setDir(d);
    setIdx((next + QUOTES.length) % QUOTES.length);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(idx + 1, 1), 3000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx((p) => (p + 1) % QUOTES.length), 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const prev = () => { setDir(-1); setIdx((p) => (p - 1 + QUOTES.length) % QUOTES.length); reset(); };
  const next = () => { setDir(1);  setIdx((p) => (p + 1) % QUOTES.length); reset(); };

  return (
    <div className="w-full max-w-[1300px] mx-auto mt-10 mb-2 px-2">
      <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/20 mb-4 text-center">// İLHAM</p>
      <div className="relative flex items-center gap-3">
        <button
          onClick={prev}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--dim)' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
        </button>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={idx}
              initial={{ x: dir > 0 ? 60 : -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir > 0 ? -60 : 60, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="text-center px-4"
            >
              <p className="text-sm md:text-base text-white/55 leading-relaxed italic mb-2">
                &ldquo;{QUOTES[idx].text}&rdquo;
              </p>
              <p className="text-[10px] font-mono tracking-widest" style={{ color: 'var(--dim)' }}>
                — {QUOTES[idx].author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={next}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--dim)' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </button>
      </div>

      {/* Nokta göstergesi */}
      <div className="flex justify-center gap-1.5 mt-4">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); reset(); }}
            className="rounded-full transition-all duration-300"
            style={{
              width:  i === idx ? '16px' : '5px',
              height: '5px',
              background: i === idx ? 'var(--fg)' : 'var(--dim-soft)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HeroPage() {
  const [mounted, setMounted] = useState(false);
  const [saat, setSaat]       = useState('');

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setSaat(new Date().toLocaleTimeString('tr-TR')), 1000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen cyber-grid pt-20 md:pt-28 pb-12 md:pb-16 px-5 md:px-14 lg:px-24">
      <div className="max-w-[1300px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

        {/* ── LEFT: Name + API Endpoints ── */}
        <div className="space-y-7 flex flex-col justify-between">

          {/* Photo + name row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6"
          >
            <div className="flex-shrink-0">
              <ProfileStack mainSize={90} smallSize={36} />
            </div>

            <div className="pt-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight text-white heading-primary">
                Ömer Faruk <span className="text-white">Yıldız</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] font-mono text-white/30 mt-0.5 tracking-wide text-premium">
                Yazılım Uzmanı · Barsan Global Lojistik
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5"
                   style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
                <span className="status-dot" style={{ width: 5, height: 5 }} />
                <span className="text-[9px] text-white/25 uppercase tracking-[0.3em]">API_SERVER_ONLINE</span>
                <span className="text-[9px] text-white/12 ml-1">// {saat}</span>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="h-[1px] origin-left rounded-full"
            style={{ background: 'linear-gradient(90deg, #4488ff, rgba(68,136,255,0.08))' }}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="text-sm font-light text-white/40 max-w-sm leading-relaxed"
          >
            Backend mimarilerini tasarlar, süreçleri otonomlaştırırım.{' '}
            <span className="accent font-medium">Mantık her şeyin üstündedir.</span>
          </motion.p>

          {/* API Endpoints */}
          <div className="space-y-3">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-4"
            >
              // API ROTALARI
            </motion.p>
            <EndpointCard method="GET"  path="/api/experience" desc="kariyer & sertifikalar"           href="/experience" delay={1.05} />
            <EndpointCard method="GET"  path="/api/skills"      desc="teknoloji stack & kütüphaneler"  href="/skills"      delay={1.15} />
            <EndpointCard method="GET"  path="/api/projects"   desc="github repo dizini"               href="/projects"   delay={1.2} />
            <EndpointCard method="POST" path="/api/contact"    desc="iletişim isteği gönder"          href="/contact"    delay={1.25} />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.35, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="flex items-center gap-5 p-5 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden cursor-default"
                style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
              >
                <div className="flex-shrink-0 w-1 h-10 rounded-full" style={{ background: 'var(--dim-soft)' }} />
                <span className="text-[11px] font-black uppercase tracking-widest flex-shrink-0 w-12" style={{ color: 'var(--dim-soft)' }}>GET</span>
                <span className="text-sm font-bold flex-shrink-0 line-through" style={{ color: 'var(--dim)' }}>/cv.pdf</span>
                <span className="text-[11px] font-mono flex-1 truncate hidden md:block" style={{ color: 'var(--dim-soft)' }}>// henüz hazır değil</span>
                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-full animate-pulse"
                      style={{ background: 'rgba(255,140,66,0.08)', color: '#ff8c42', border: '1px solid rgba(255,140,66,0.2)' }}>
                  yakında
                </span>
              </div>
            </motion.div>
          </div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex flex-wrap gap-2 justify-center sm:justify-start"
          >
            {['Backend Dev', 'Python', 'C# / .NET', 'RPA', 'Web API', 'Barsan Global Lojistik'].map((t) => (
              <span key={t} className="accent-tag">{t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Interactive Terminal (masaüstü) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col h-full"
        >
          <InteractiveTerminal />
        </motion.div>
      </div>

      {/* Bottom stats bar (masaüstü) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7 }}
        className="max-w-[1300px] mx-auto w-full mt-8 pt-6 border-t grid grid-cols-3 md:grid-cols-6 gap-4 text-center"
        style={{ borderColor: 'rgba(68,136,255,0.07)' }}
      >
        {[
          { label: 'HTTP Status', value: '200',  sub: 'OK' },
          { label: 'Yıl Deneyim', value: '3+',   sub: 'years' },
          { label: 'Proje',       value: '15+',  sub: 'repos' },
          { label: 'Tech Stack',  value: '8+',   sub: 'tools' },
          { label: 'Uptime',      value: '99%',  sub: 'reliability' },
          { label: 'Response',    value: '<1ms', sub: 'latency' },
        ].map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--dim-soft)' }}>{s.label}</div>
            <div className="text-2xl font-black accent">{s.value}</div>
            <div className="text-[9px] font-mono" style={{ color: 'var(--dim-soft)' }}>{s.sub}</div>
          </div>
        ))}
      </motion.div>

      <QuoteCarousel />
    </main>
  );
}
