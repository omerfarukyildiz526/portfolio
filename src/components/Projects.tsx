'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GithubViewer from './GithubViewer';

const LANG_COLORS: Record<string, string> = {
  Python:     '#0A84FF',
  'C#':       '#30D158',
  TypeScript: '#7DD3FC',
  JavaScript: '#FFD60A',
  Java:       '#FF9F0A',
  Go:         '#5AC8FA',
  Rust:       '#FF9F0A',
  Markdown:   '#8E8E93',
};

export default function Projects() {
  const [repos, setRepos]           = useState<any[]>([]);
  const [selected, setSelected]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'viewer'>('list');

  useEffect(() => {
    fetch('https://api.github.com/users/OmerFaruk-YILDIZ/repos?sort=updated&per_page=30')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
          if (data.length > 0) setSelected(data[0].full_name);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex flex-col items-center gap-3" style={{ color: 'var(--fg-3)' }}>
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <span className="font-mono text-[11px] tracking-wide">Fetching repos…</span>
        </div>
      </div>
    );
  }

  const handleSelect = (fullName: string) => {
    setSelected(fullName);
    setMobileView('viewer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
    >
      {/* Repo list */}
      <div
        className={`lg:col-span-4 lg:max-h-[72vh] lg:overflow-y-auto scrollbar-hide space-y-2 ${
          mobileView === 'viewer' ? 'hidden lg:block' : 'block'
        }`}
      >
        {repos.map((repo, i) => {
          const isSelected = selected === repo.full_name;
          const lang       = repo.language || 'Markdown';
          const color      = LANG_COLORS[lang] ?? '#8E8E93';

          return (
            <motion.button
              key={repo.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => handleSelect(repo.full_name)}
              className="w-full text-left p-4 rounded-xl border transition-all duration-200"
              style={{
                background:   isSelected ? 'color-mix(in srgb, var(--accent) 6%, var(--bg-card))' : 'var(--bg-card)',
                borderColor:  isSelected ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border)',
                borderLeft:   isSelected ? `3px solid var(--accent)` : '1px solid var(--border)',
              }}
            >
              {/* Language indicator */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color }}>
                  {lang}
                </span>
              </div>

              <p
                className="font-semibold text-[13px] truncate mb-1"
                style={{ color: 'var(--fg)' }}
              >
                {repo.name}
              </p>

              {repo.description && (
                <p className="font-mono text-[11px] truncate" style={{ color: 'var(--fg-3)' }}>
                  {repo.description}
                </p>
              )}

              {repo.stargazers_count > 0 && (
                <p className="font-mono text-[10px] mt-2" style={{ color: 'var(--fg-3)' }}>
                  ★ {repo.stargazers_count}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* README viewer */}
      <div className={`lg:col-span-8 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>

        {/* Mobile back button */}
        <button
          onClick={() => setMobileView('list')}
          className="lg:hidden flex items-center gap-2 mb-5 font-mono text-[11px] transition-opacity hover:opacity-100"
          style={{ color: 'var(--fg-3)', opacity: 0.75 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          All repos
        </button>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="card overflow-hidden"
              style={{ height: '72vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Viewer header */}
              <div
                className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="method-get">GET</span>
                  <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
                    /{selected.split('/')[1]}/README.md
                  </span>
                </div>
                <span className="font-mono text-[10px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>
                  → 200 OK
                </span>
              </div>

              {/* README content */}
              <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-hide">
                <GithubViewer repoPath={selected} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
