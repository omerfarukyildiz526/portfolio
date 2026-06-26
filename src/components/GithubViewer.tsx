'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import Loader from './Loader';

// ─── Resolve relative image/link paths to raw GitHub URLs ─────────────────────
function resolveGithubUrl(src: string | undefined, branch: string, repoPath: string): string {
  if (!src) return '';
  if (/^https?:\/\//.test(src)) return src; // already absolute
  if (src.startsWith('data:'))              return src; // data URI
  const clean = src.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/${repoPath}/${branch}/${clean}`;
}

// ─── Syntax-highlight token colours (dark theme, GitHub-inspired) ─────────────
const CODE_COLORS: Record<string, string> = {
  keyword:  '#ff7b72',
  string:   '#a5d6ff',
  comment:  '#8b949e',
  number:   '#79c0ff',
  function: '#d2a8ff',
  default:  '#e6edf3',
};

/** Very lightweight tokeniser – good enough for display */
function tokenise(code: string, lang: string) {
  const KW_MAP: Record<string, RegExp> = {
    python:     /\b(def|class|import|from|return|if|elif|else|for|while|with|as|in|not|and|or|True|False|None|async|await|try|except|finally|pass|lambda|yield)\b/g,
    javascript: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|new|this|typeof|instanceof|null|undefined|true|false|try|catch|finally|throw|of|in|from)\b/g,
    typescript: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|new|this|typeof|instanceof|null|undefined|true|false|try|catch|finally|throw|of|in|from|interface|type|enum|namespace|declare|readonly|public|private|protected)\b/g,
    csharp:     /\b(using|namespace|class|public|private|protected|static|void|return|if|else|for|foreach|while|new|this|base|true|false|null|async|await|var|string|int|bool|List|Dictionary|Task)\b/g,
    bash:       /\b(echo|cd|ls|mkdir|rm|cp|mv|cat|grep|find|export|source|if|then|else|fi|for|do|done|while|function)\b/g,
  };
  const langKey = lang.toLowerCase().replace('js', 'javascript').replace('ts', 'typescript').replace('cs', 'csharp').replace('sh', 'bash').replace('shell', 'bash');
  const kwReg = KW_MAP[langKey];

  // Split into lines, then into tokens
  return code.split('\n').map((line, li) => {
    const tokens: { text: string; color: string }[] = [];
    // comments first
    const commentIdx = line.indexOf('//');
    const hashIdx    = ['python', 'bash'].includes(langKey) ? line.indexOf('#') : -1;
    const commentAt  = [commentIdx, hashIdx].filter(i => i >= 0).reduce((a, b) => Math.min(a, b), Infinity);

    const codePart    = commentAt === Infinity ? line : line.slice(0, commentAt);
    const commentPart = commentAt === Infinity ? '' : line.slice(commentAt);

    // tokenise codePart: strings, numbers, keywords
    let rest = codePart;
    // string literals
    const parts = rest.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
    parts.forEach(part => {
      if ((part.startsWith('"') || part.startsWith("'") || part.startsWith('`')) && part.length > 1) {
        tokens.push({ text: part, color: CODE_COLORS.string });
      } else {
        // numbers
        const numParts = part.split(/(\b\d+(?:\.\d+)?\b)/g);
        numParts.forEach(np => {
          if (/^\d+(?:\.\d+)?$/.test(np)) {
            tokens.push({ text: np, color: CODE_COLORS.number });
          } else if (kwReg) {
            kwReg.lastIndex = 0;
            let last = 0;
            let m: RegExpExecArray | null;
            while ((m = kwReg.exec(np)) !== null) {
              if (m.index > last) tokens.push({ text: np.slice(last, m.index), color: CODE_COLORS.default });
              tokens.push({ text: m[0], color: CODE_COLORS.keyword });
              last = m.index + m[0].length;
            }
            if (last < np.length) tokens.push({ text: np.slice(last), color: CODE_COLORS.default });
          } else {
            tokens.push({ text: np, color: CODE_COLORS.default });
          }
        });
      }
    });

    if (commentPart) tokens.push({ text: commentPart, color: CODE_COLORS.comment });

    return { tokens, key: li };
  });
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const lines = tokenise(code.trimEnd(), lang);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(48,54,61,1)', background: '#161b22' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'rgba(48,54,61,1)', background: '#0d1117' }}>
        <span className="text-[10px] font-mono tracking-widest" style={{ color: '#8b949e' }}>
          {lang || 'text'}
        </span>
        <button
          onClick={copy}
          className="text-[10px] font-mono px-2 py-0.5 rounded transition-all"
          style={{ color: copied ? '#3fb950' : '#8b949e', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {copied ? '✓ kopyalandı' : 'kopyala'}
        </button>
      </div>

      {/* Code lines */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: '13px', lineHeight: '1.6' }}>
          <tbody>
            {lines.map(({ tokens, key }) => (
              <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                <td className="select-none text-right pr-4 pl-3 w-8" style={{ color: '#484f58', userSelect: 'none', minWidth: '2.5rem' }}>
                  {key + 1}
                </td>
                <td className="pr-6 pl-2 whitespace-pre">
                  {tokens.map((t, ti) => (
                    <span key={ti} style={{ color: t.color }}>{t.text}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GithubViewer({ repoPath }: { repoPath: string }) {
  const [content, setContent] = useState('');
  const [branch,  setBranch]  = useState('main');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setContent('');

    const tryFetch = async () => {
      for (const br of ['main', 'master']) {
        const res = await fetch(`https://raw.githubusercontent.com/${repoPath}/${br}/README.md`);
        if (res.ok) {
          const text = await res.text();
          setBranch(br);
          setContent(text);
          setLoading(false);
          return;
        }
      }
      setNotFound(true);
      setLoading(false);
    };

    tryFetch().catch(() => { setNotFound(true); setLoading(false); });
  }, [repoPath]);

  // ── Markdown component overrides ───────────────────────────────────────────
  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1 style={{ fontSize: '2em', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.3em', marginTop: '1.2em', marginBottom: '0.8em', color: 'var(--fg)' }}>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontSize: '1.5em', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.3em', marginTop: '1.2em', marginBottom: '0.6em', color: 'var(--fg)' }}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: '1.25em', fontWeight: 700, marginTop: '1em', marginBottom: '0.5em', color: 'var(--fg)' }}>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ fontSize: '1em', fontWeight: 700, marginTop: '0.8em', marginBottom: '0.4em', color: 'var(--fg)' }}>{children}</h4>
    ),

    // Paragraphs
    p: ({ children }) => (
      <p style={{ marginTop: '0', marginBottom: '1em', lineHeight: 1.7, color: 'var(--fg-3)' }}>{children}</p>
    ),

    // Links
    a: ({ href, children }) => {
      const abs = href?.startsWith('http') ? href : `https://github.com/${repoPath}`;
      return (
        <a href={abs} target="_blank" rel="noopener noreferrer"
           style={{ color: '#4493f8', textDecoration: 'none' }}
           onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
           onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
          {children}
        </a>
      );
    },

    // Images — fix relative paths
    img: ({ src, alt }) => {
      const resolvedSrc = resolveGithubUrl(typeof src === 'string' ? src : undefined, branch, repoPath);
      return (
        <img
          src={resolvedSrc}
          alt={alt ?? ''}
          style={{ maxWidth: '100%', maxHeight: '220px', height: 'auto', borderRadius: '6px', margin: '0.5em 0', display: 'inline-block', verticalAlign: 'middle' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      );
    },

    // Inline code
    code: ({ children, className }) => {
      const lang = (className ?? '').replace('language-', '');
      const text = String(children ?? '').replace(/\n$/, '');

      // Block code is handled by `pre`
      if (!className && !text.includes('\n')) {
        return (
          <code style={{ background: 'rgba(110,118,129,0.15)', padding: '0.1em 0.4em', borderRadius: '4px', fontSize: '85%', color: '#e6edf3', fontFamily: 'var(--font-jetbrains, monospace)' }}>
            {children}
          </code>
        );
      }

      return <CodeBlock lang={lang} code={text} />;
    },

    // Pre — delegate to CodeBlock
    pre: ({ children }) => {
      const child = React.Children.only(children) as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      const lang = (child?.props?.className ?? '').replace('language-', '');
      const text = String(child?.props?.children ?? '').replace(/\n$/, '');
      return <CodeBlock lang={lang} code={text} />;
    },

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: '4px solid var(--border)', paddingLeft: '1em', margin: '0 0 1em', color: 'var(--fg-3)' }}>
        {children}
      </blockquote>
    ),

    // Unordered list
    ul: ({ children }) => (
      <ul style={{ paddingLeft: '2em', marginBottom: '1em', listStyleType: 'disc', color: 'var(--fg-3)' }}>{children}</ul>
    ),

    // Ordered list
    ol: ({ children }) => (
      <ol style={{ paddingLeft: '2em', marginBottom: '1em', listStyleType: 'decimal', color: 'var(--fg-3)' }}>{children}</ol>
    ),

    li: ({ children, ...props }) => {
      // @ts-expect-error remark-gfm passes checked
      const checked = props.checked as boolean | null | undefined;
      if (checked !== null && checked !== undefined) {
        return (
          <li style={{ listStyle: 'none', marginLeft: '-1.5em', marginBottom: '0.25em', display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
            <span style={{ marginTop: '0.2em', flexShrink: 0, width: '14px', height: '14px', border: '1px solid rgba(110,118,129,0.6)', borderRadius: '3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: checked ? '#238636' : 'transparent' }}>
              {checked && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
            </span>
            <span style={{ opacity: checked ? 0.5 : 1 }}>{children}</span>
          </li>
        );
      }
      return <li style={{ marginBottom: '0.25em', lineHeight: 1.7 }}>{children}</li>;
    },

    // Tables
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', marginBottom: '1em' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead style={{ background: 'var(--bg-raised)' }}>{children}</thead>,
    th: ({ children }) => (
      <th style={{ padding: '8px 13px', border: '1px solid var(--border)', fontWeight: 600, textAlign: 'left', color: 'var(--fg)' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ padding: '8px 13px', border: '1px solid var(--border)', color: 'var(--fg-3)' }}>
        {children}
      </td>
    ),
    tr: ({ children }) => (
      <tr style={{ borderTop: '1px solid var(--border)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        {children}
      </tr>
    ),

    // Horizontal rule
    hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5em 0' }} />,

    // Strong / Em
    strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--fg)' }}>{children}</strong>,
    em:     ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,

    // Strikethrough (GFM)
    del: ({ children }) => <del style={{ color: '#8b949e' }}>{children}</del>,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <Loader route="README.md" className="h-full py-20" />;

  if (notFound) return (
    <div className="flex flex-col items-center justify-center h-full gap-3" style={{ opacity: 0.4 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.621 9.879a3 3 0 1 1 0-4.243M15 17.25H9m0 0H6m3 0v3m0-3V12M3 3l18 18" />
      </svg>
      <p className="text-sm font-mono">README bulunamadı</p>
      <p className="text-[10px] font-mono" style={{ color: '#8b949e' }}>{repoPath}</p>
    </div>
  );

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: 'var(--fg)', fontSize: '14px', lineHeight: 1.6 }}>
      {/* GitHub-style README header */}
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--fg-3)', flexShrink: 0 }}>
          <path d="M14.414 0 14 .586V4h-2V2H4v2H2V.586L1.586 0H0v2h.586L2 .586V4H0v2h2v6H0v2h2v2h2v-2h8v2h2v-2h2v-2h-2V6h2V4h-2V.586L15.414 0zM4 4h8v2H4zm0 4h8v4H4z"/>
        </svg>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--fg)' }}>README.md</span>
        <span className="text-[10px] font-mono ml-auto" style={{ color: 'var(--fg-3)' }}>
          {repoPath} / {branch}
        </span>
      </div>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
