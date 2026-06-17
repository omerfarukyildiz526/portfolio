'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GithubViewer from './GithubViewer';

const LANG_COLORS: Record<string, string> = {
  Python:     '#4488ff',
  'C#':       '#86efac',
  TypeScript: '#7dd3fc',
  JavaScript: '#fde68a',
  Java:       '#fca5a5',
  Go:         '#67e8f9',
  Rust:       '#fdba74',
  Markdown:   '#94a3b8',
};

export default function Projects() {
  const [repos, setRepos]           = useState<any[]>([]);
  const [selected, setSelected]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'viewer'>('list');

  useEffect(() => {
    fetch('https://api.github.com/users/OmerFaruk-YILDIZ/repos?sort=updated&per_page=30')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
          if (data.length > 0) setSelected(data[0].full_name);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4 opacity-30">
          <div className="w-7 h-7 border-2 border-[#4488ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">GitHub API isteği gönderildi…</span>
        </div>
      </div>
    );

  const handleSelect = (fullName: string) => {
    setSelected(fullName);
    setMobileView('viewer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
    >
      {/* ── REPO LIST ── */}
      <div className={`lg:col-span-4 lg:max-h-[72vh] lg:overflow-y-auto scrollbar-hide pr-1 space-y-2 ${mobileView === 'viewer' ? 'hidden lg:block' : 'block'}`}>
        {repos.map((repo, i) => {
          const isSelected = selected === repo.full_name;
          const lang  = repo.language || 'Markdown';
          const color = LANG_COLORS[lang] ?? '#94a3b8';
          return (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleSelect(repo.full_name)}
              className="p-4 md:p-5 rounded-xl border transition-all duration-250 cursor-pointer group relative overflow-hidden card"
              style={isSelected ? {
                borderColor: 'rgba(68,136,255,0.35)',
                background: 'rgba(68,136,255,0.06)',
                boxShadow: '0 0 16px rgba(68,136,255,0.08)',
              } : {}}
            >
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl bg-[#4488ff]"
                     style={{ boxShadow: '0 0 10px #4488ff' }} />
              )}

              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color }}>
                  {lang}
                </span>
              </div>

              <h3 className="text-sm font-black uppercase tracking-tight truncate transition-colors"
                  style={{ color: 'var(--fg)' }}>
                {repo.name.replace(/-/g, '_')}
              </h3>
              {repo.description && (
                <p className="text-[10px] mt-1 truncate font-mono" style={{ color: 'var(--dim)' }}>{repo.description}</p>
              )}

              <div className="flex gap-4 mt-2">
                {repo.stargazers_count > 0 && (
                  <span className="text-[9px] font-mono" style={{ color: 'var(--dim-soft)' }}>★ {repo.stargazers_count}</span>
                )}
                {repo.fork && <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--dim-soft)' }}>fork</span>}
              </div>

              {isSelected && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 accent opacity-50 text-lg">→</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── TERMINAL VIEWER ── */}
      <div className={`lg:col-span-8 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
        {/* Mobil geri butonu */}
        <button
          onClick={() => setMobileView('list')}
          className="lg:hidden flex items-center gap-2 mb-4 text-[10px] font-mono uppercase tracking-widest transition-colors"
          style={{ color: 'var(--dim)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Tüm repolar
        </button>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="terminal rounded-2xl overflow-hidden h-[60vh] md:h-[72vh] flex flex-col"
            >
              <div className="terminal-header flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4488ff] animate-blink"
                        style={{ boxShadow: '0 0 5px #4488ff' }} />
                  <span className="text-[10px] font-mono text-[#4488ff]/40 tracking-widest truncate max-w-[160px] md:max-w-none">
                    {selected.split('/')[1]} / README.md
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] hidden sm:block"
                      style={{ color: 'var(--dim-soft)' }}>github://raw</span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 scrollbar-hide">
                <GithubViewer repoPath={selected} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
