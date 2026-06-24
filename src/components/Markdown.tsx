'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// Satır içi markdown: **kalın**, *italik*, `kod`, [link](url).
// Paragrafı sarmalamadan (p → fragment) mevcut tipografiyi koruyarak render eder.
const components: Components = {
  p: ({ children }) => <>{children}</>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
      {children}
    </a>
  ),
  strong: ({ children }) => <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => (
    <code style={{ fontFamily: 'var(--font-jetbrains, monospace)', background: 'var(--surface)', padding: '1px 5px', borderRadius: 4, fontSize: '0.88em' }}>
      {children}
    </code>
  ),
  del: ({ children }) => <del style={{ opacity: 0.7 }}>{children}</del>,
};

export function MD({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children}</ReactMarkdown>;
}
