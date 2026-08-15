'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ContentBlock } from '@/lib/posts';

type Step = 1 | 2 | 3;

const EMPTY = {
  cover: '', title: '', excerpt: '', body: '', tags: '', instagramUrl: '',
  symbol: '📝', gradient: ['#0d1433', '#1a2a6c'] as [string, string],
};

// Serbest metni paragraf bloklarına çevirir — boş satırla ayrılmış her parça bir paragraf.
function bodyToBlocks(body: string): ContentBlock[] {
  const parts = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return [{ type: 'p', text: '' }];
  return parts.map(text => ({ type: 'p', text }));
}

export default function PostWizardModal({
  onClose, onAuthError, onPublished,
}: {
  onClose: () => void;
  onAuthError: () => void;
  onPublished: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  async function uploadCover(file: File) {
    setUploading(true); setError('');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    setUploading(false);
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.url) set('cover', d.url);
    else setError(d.error || 'Yükleme başarısız.');
  }

  async function publish() {
    if (publishing) return;
    setPublishing(true); setError('');
    const body = {
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      content: bodyToBlocks(draft.body),
      tags: draft.tags.split(',').map(t => t.trim()).filter(Boolean),
      instagramUrl: draft.instagramUrl.trim() || undefined,
      cover: draft.cover || undefined,
      symbol: draft.symbol,
      gradient: draft.gradient,
      published: true,
      date: new Date().toISOString().slice(0, 10),
      readTime: Math.max(1, Math.round(draft.body.trim().split(/\s+/).filter(Boolean).length / 200)),
    };
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setPublishing(false);
    if (res.status === 401) return onAuthError();
    if (res.ok) {
      onPublished();
      onClose();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Yayınlanamadı.');
    }
  }

  const canNextFrom1 = !!draft.cover;
  const canNextFrom2 = draft.title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

        {/* Üst bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <button onClick={step === 1 ? onClose : () => setStep(s => (s - 1) as Step)}
            className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>
            {step === 1 ? 'Vazgeç' : '← geri'}
          </button>
          <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Yeni paylaşım</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(s => (
              <span key={s} className="w-1.5 h-1.5 rounded-full"
                style={{ background: s <= step ? 'var(--accent)' : 'var(--border)' }} />
            ))}
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <p className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--fg-3)' }}>1/3 — Kapak görseli</p>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadCover(f); }}
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative"
                  style={{ borderColor: dragOver ? 'var(--accent)' : 'var(--border)', background: 'var(--surface)' }}>
                  <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
                  {draft.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={draft.cover} alt="" className="w-full h-full object-cover" />
                  ) : uploading ? (
                    <p className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>Yükleniyor…</p>
                  ) : (
                    <div className="text-center">
                      <p className="text-2xl mb-1">📷</p>
                      <p className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>Sürükle bırak ya da tıkla</p>
                    </div>
                  )}
                </div>
                {draft.cover && (
                  <button onClick={() => set('cover', '')} className="font-mono text-[11px] mt-2" style={{ color: '#ff5d5d' }}>Kaldır</button>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--fg-3)' }}>2/3 — İçerik</p>
                <label className="block">
                  <span className="block font-mono text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>Başlık</span>
                  <input value={draft.title} onChange={e => set('title', e.target.value)} className="input" autoFocus />
                </label>
                <label className="block">
                  <span className="block font-mono text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>Excerpt (kısa özet)</span>
                  <textarea value={draft.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} className="input" />
                </label>
                <label className="block">
                  <span className="block font-mono text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>İçerik (paragrafları boş satırla ayır)</span>
                  <textarea value={draft.body} onChange={e => set('body', e.target.value)} rows={7} className="input" />
                </label>
                <label className="block">
                  <span className="block font-mono text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>Etiketler (virgülle ayır)</span>
                  <input value={draft.tags} onChange={e => set('tags', e.target.value)} placeholder="Python, Docker" className="input" />
                </label>
                <label className="block">
                  <span className="block font-mono text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>Instagram linki (opsiyonel)</span>
                  <input value={draft.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/p/…" className="input" />
                </label>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <p className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--fg-3)' }}>3/3 — Önizleme</p>
                <div className="max-w-[220px] mx-auto mb-4">
                  <div className="relative aspect-square rounded-[2px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    {draft.cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={draft.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl"
                        style={{ background: `linear-gradient(135deg, ${draft.gradient[0]}, ${draft.gradient[1]})` }}>{draft.symbol}</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 pt-8" style={{ background: 'linear-gradient(to top, rgba(10,9,8,0.92), transparent)' }}>
                      <p className="text-[13px] font-semibold leading-tight line-clamp-2" style={{ color: '#F3EEE4' }}>{draft.title || 'Başlıksız'}</p>
                    </div>
                  </div>
                </div>
                <p className="body-sm mb-1" style={{ color: 'var(--fg-2)' }}>{draft.excerpt || '— excerpt yok —'}</p>
                {draft.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {draft.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ color: 'var(--fg-3)', borderColor: 'var(--border)' }}>{t}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="body-sm mt-3" style={{ color: '#ff5d5d' }}>{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {step < 3 ? (
            <button
              onClick={() => setStep(s => (s + 1) as Step)}
              disabled={step === 1 ? !canNextFrom1 : !canNextFrom2}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              İleri
            </button>
          ) : (
            <button onClick={publish} disabled={publishing}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {publishing ? 'Yayınlanıyor…' : 'Yayınla'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
