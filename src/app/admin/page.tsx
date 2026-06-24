'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Post, ContentBlock } from '@/lib/posts';
import { MD } from '@/components/Markdown';

type Status = 'loading' | 'login' | 'ready';
type View = 'list' | 'editor';
type Tab = 'edit' | 'preview';

const EMPTY_DRAFT: Post = {
  slug: '', title: '', excerpt: '', gradient: ['#0d1433', '#1a2a6c'],
  symbol: '📝', tags: [], date: new Date().toISOString().slice(0, 10),
  readTime: 5, content: [{ type: 'p', text: '' }], published: true,
};

const BLOCK_LABELS: Record<ContentBlock['type'], string> = {
  p: 'Paragraf', h2: 'Başlık (H2)', h3: 'Alt Başlık (H3)',
  code: 'Kod', list: 'Liste', note: 'Not',
  quote: 'Alıntı', image: 'Görsel', divider: 'Ayraç',
};

// Etiketli emoji seti — popover'daki arama bu anahtar kelimelerle eşleşir.
const EMOJI_OPTIONS: { e: string; k: string }[] = [
  { e: '🛢', k: 'veritabanı database db sql silindir varil' },
  { e: '🗄', k: 'veritabanı database dolap arşiv dosya' },
  { e: '🗃', k: 'veritabanı database kutu kart arşiv' },
  { e: '💽', k: 'veritabanı database disk minidisc depolama' },
  { e: '💾', k: 'kaydet save disket floppy depolama database' },
  { e: '💿', k: 'disk cd depolama' },
  { e: '🖥', k: 'sunucu server bilgisayar masaüstü' },
  { e: '🖧', k: 'ağ network sunucu' },
  { e: '📝', k: 'not yazı kalem makale post' },
  { e: '🐍', k: 'python yılan' },
  { e: '⚡', k: 'hız enerji api şimşek dotnet csharp' },
  { e: '🐳', k: 'docker balina container konteyner' },
  { e: '🔗', k: 'bağlantı link entegrasyon rfc api' },
  { e: '⚙', k: 'ayar dişli otomasyon süreç sistem' },
  { e: '🚀', k: 'roket hız launch deploy başlat' },
  { e: '💡', k: 'fikir ipucu öneri ampul' },
  { e: '🔥', k: 'ateş popüler trend hot' },
  { e: '✨', k: 'yeni parıltı özellik' },
  { e: '📦', k: 'paket kutu modül npm package' },
  { e: '🛠', k: 'araç tamir geliştirme tool' },
  { e: '🧩', k: 'parça modül eklenti puzzle' },
  { e: '🔒', k: 'güvenlik kilit auth şifre security' },
  { e: '🌐', k: 'web internet ağ global www' },
  { e: '📊', k: 'grafik istatistik analiz veri rapor' },
  { e: '🤖', k: 'bot yapay zeka ai otomasyon robot' },
  { e: '☁', k: 'bulut cloud aws azure' },
  { e: '🧠', k: 'beyin yapay zeka ai akıl' },
  { e: '⚛', k: 'react atom frontend' },
  { e: '📡', k: 'sinyal api iletişim uydu' },
  { e: '🎯', k: 'hedef amaç odak' },
  { e: '🧪', k: 'test deney laboratuvar' },
  { e: '🔧', k: 'anahtar tamir ayar tool' },
  { e: '📈', k: 'artış büyüme grafik performans' },
  { e: '🎨', k: 'tasarım renk ui sanat design' },
  { e: '🧱', k: 'tuğla yapı mimari blok' },
  { e: '⏱', k: 'süre zaman performans kronometre' },
  { e: '📁', k: 'klasör dosya proje' },
  { e: '🔑', k: 'anahtar şifre key token auth' },
  { e: '🧰', k: 'araç kutusu toolbox geliştirme' },
  { e: '🌀', k: 'döngü asenkron süreç' },
];

const GRADIENTS: [string, string][] = [
  ['#0d1433', '#1a2a6c'], ['#1a0533', '#3d0f6b'], ['#001a2d', '#003d6b'],
  ['#0d2d00', '#1a5200'], ['#1a0a00', '#3d1a00'], ['#00152d', '#002d5e'],
  ['#2d0015', '#5e0030'], ['#2d2a00', '#5e5200'], ['#15002d', '#30005e'],
  ['#002d2a', '#005e52'],
];

function slugify(title: string): string {
  return title.toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const LS_KEY = 'admin-draft-v1';

function countWords(p: Post): number {
  let n = 0;
  for (const b of p.content) {
    if (b.text) n += b.text.trim().split(/\s+/).filter(Boolean).length;
    if (b.items) n += b.items.join(' ').trim().split(/\s+/).filter(Boolean).length;
  }
  return n;
}

export default function AdminPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');
  const [tab, setTab] = useState<Tab>('edit');
  const [draft, setDraft] = useState<Post>(EMPTY_DRAFT);
  const [tagsInput, setTagsInput] = useState('');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [recovered, setRecovered] = useState<{ draft: Post; tagsInput: string; editingSlug: string | null } | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [confirmState, setConfirmState] = useState<{ msg: string; action: () => void } | null>(null);

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const loadPosts = useCallback(async () => {
    const res = await fetch('/api/admin/posts', { cache: 'no-store' });
    if (res.status === 401) { setStatus('login'); return; }
    const data = await res.json();
    setPosts(data.posts ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/session', { cache: 'no-store' });
      const { authed } = await res.json();
      if (authed) { await loadPosts(); setStatus('ready'); }
      else setStatus('login');
    })();
  }, [loadPosts]);

  // ---- Auth ----
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setPassword(''); await loadPosts(); setStatus('ready'); }
    else { const d = await res.json().catch(() => ({})); setLoginError(d.error || 'Giriş başarısız.'); }
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setStatus('login');
  }

  // ---- List actions ----
  function newPost() {
    setDraft({ ...EMPTY_DRAFT, content: [{ type: 'p', text: '' }] });
    setTagsInput(''); setEditingSlug(null); setFormError(''); setTab('edit'); setView('editor');
  }
  function editPost(p: Post) {
    setDraft(structuredClone(p)); setTagsInput(p.tags.join(', '));
    setEditingSlug(p.slug); setFormError(''); setTab('edit'); setView('editor');
  }
  function duplicatePost(p: Post) {
    const copy = structuredClone(p);
    copy.slug = `${p.slug}-kopya`;
    copy.title = `${p.title} (kopya)`;
    copy.published = false;
    setDraft(copy); setTagsInput(p.tags.join(', '));
    setEditingSlug(null); setFormError(''); setTab('edit'); setView('editor');
    notify('Kopya editöre yüklendi — slug/başlığı düzenleyip kaydet.');
  }
  function confirmDelete(slug: string) {
    setConfirmState({
      msg: `"${slug}" yazısı kalıcı olarak silinecek. Emin misin?`,
      action: async () => {
        const res = await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
        if (res.status === 401) return setStatus('login');
        if (res.ok) { await loadPosts(); notify('Yazı silindi.'); }
        else notify('Silinemedi.', 'err');
      },
    });
  }
  async function togglePublish(p: Post) {
    const next = { ...p, published: p.published === false };
    const res = await fetch(`/api/admin/posts/${p.slug}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
    });
    if (res.status === 401) return setStatus('login');
    if (res.ok) { await loadPosts(); notify(next.published ? 'Yayına alındı.' : 'Taslağa alındı.'); }
    else notify('Güncellenemedi.', 'err');
  }

  function setField<K extends keyof Post>(key: K, value: Post[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  // ---- Blocks ----
  function addBlock(type: ContentBlock['type']) {
    const block: ContentBlock =
      type === 'list' ? { type, items: [''] } :
      type === 'code' ? { type, text: '', lang: 'bash' } :
      type === 'image' ? { type, url: '', text: '' } :
      type === 'divider' ? { type } :
      { type, text: '' };
    setDraft(d => ({ ...d, content: [...d.content, block] }));
  }
  function updateBlock(i: number, patch: Partial<ContentBlock>) {
    setDraft(d => ({ ...d, content: d.content.map((b, idx) => idx === i ? { ...b, ...patch } : b) }));
  }
  function removeBlock(i: number) {
    setDraft(d => ({ ...d, content: d.content.filter((_, idx) => idx !== i) }));
  }
  function duplicateBlock(i: number) {
    setDraft(d => {
      const c = [...d.content];
      c.splice(i + 1, 0, structuredClone(d.content[i]));
      return { ...d, content: c };
    });
  }
  function moveBlock(i: number, dir: -1 | 1) {
    setDraft(d => {
      const j = i + dir;
      if (j < 0 || j >= d.content.length) return d;
      const c = [...d.content];
      [c[i], c[j]] = [c[j], c[i]];
      return { ...d, content: c };
    });
  }
  function moveBlockTo(from: number, to: number) {
    setDraft(d => {
      if (from === to || from < 0 || to < 0 || from >= d.content.length || to >= d.content.length) return d;
      const c = [...d.content];
      const [item] = c.splice(from, 1);
      c.splice(to, 0, item);
      return { ...d, content: c };
    });
  }

  // ---- Görsel yükleme ----
  async function uploadFile(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.status === 401) { setStatus('login'); return null; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { notify(data.error || 'Yükleme başarısız.', 'err'); return null; }
      notify('Görsel yüklendi.');
      return data.url as string;
    } catch {
      notify('Yükleme başarısız.', 'err');
      return null;
    } finally {
      setUploading(false);
    }
  }

  // ---- Save ----
  const doSave = useCallback(async () => {
    if (saving) return;
    setSaving(true); setFormError('');
    const payload = { ...draft, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) };
    const url = editingSlug ? `/api/admin/posts/${editingSlug}` : '/api/admin/posts';
    const method = editingSlug ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.status === 401) return setStatus('login');
    if (res.ok) {
      try { localStorage.removeItem(LS_KEY); } catch {}
      setRecovered(null);
      await loadPosts(); setView('list'); notify(editingSlug ? 'Güncellendi.' : 'Yayınlandı.');
    }
    else { const d = await res.json().catch(() => ({})); setFormError(d.error || 'Kaydedilemedi.'); notify(d.error || 'Kaydedilemedi.', 'err'); }
  }, [saving, draft, tagsInput, editingSlug, loadPosts, notify]);

  // Ctrl+S kısayolu
  useEffect(() => {
    if (view !== 'editor') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, doSave]);

  // Editördeyken değişiklikleri otomatik olarak tarayıcıya yedekle.
  useEffect(() => {
    if (view !== 'editor') return;
    const t = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify({ draft, tagsInput, editingSlug })); } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [view, draft, tagsInput, editingSlug]);

  // Açılışta yarım kalmış bir taslak var mı diye bak.
  useEffect(() => {
    if (status !== 'ready') return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const d = parsed?.draft;
      const hasContent = d && (d.title?.trim() || (d.content ?? []).some((b: ContentBlock) => b.text?.trim() || b.items?.length || b.url));
      if (hasContent) setRecovered(parsed);
    } catch {}
  }, [status]);

  function clearSavedDraft() {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setRecovered(null);
  }
  function leaveEditor() { clearSavedDraft(); setView('list'); }

  // ---- Derived ----
  const allTags = useMemo(() => Array.from(new Set(posts.flatMap(p => p.tags))).sort(), [posts]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) || p.slug.includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)));
  }, [posts, search]);
  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.published !== false).length,
    drafts: posts.filter(p => p.published === false).length,
    words: posts.reduce((s, p) => s + countWords(p), 0),
  }), [posts]);
  const draftWords = useMemo(() => countWords(draft), [draft]);
  const suggestedReadTime = Math.max(1, Math.round(draftWords / 200));

  // ════════════════════════ RENDER ════════════════════════
  if (status === 'loading') {
    return <main className="min-h-screen flex items-center justify-center" style={{ color: 'var(--fg-3)' }}>
      <span className="font-mono text-sm">yükleniyor…</span>
    </main>;
  }

  if (status === 'login') {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[420px] h-[420px] rounded-full opacity-[0.18] blur-[90px]"
            style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />
        </div>

        <div className="absolute left-0 right-0 top-24 z-10 px-5 md:px-8 pointer-events-none">
          <div className="max-w-3xl mx-auto relative">
            <motion.div initial={{ opacity: 0, rotateY: -90 }} animate={{ opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-0 right-0 pointer-events-auto" style={{ transformPerspective: 700 }}>
              <Link href="/feed"
                className="group flex items-center gap-2 font-mono text-[11px] px-3.5 py-2 rounded-full border transition-all duration-200"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg-2)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Geri dön
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.form onSubmit={login}
          initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full max-w-sm p-8 rounded-3xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 24px 60px -20px rgba(0,0,0,0.45)' }}>
          <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), #0a5fff)', boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--accent) 60%, transparent)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="display-md mb-1.5" style={{ color: 'var(--fg)' }}>Yönetici Girişi</h1>
          <p className="body-sm mb-7" style={{ color: 'var(--fg-3)' }}>Paneli açmak için şifreni gir.</p>
          <div className="relative mb-3">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoFocus className="input" style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPw(s => !s)} aria-label="Şifreyi göster/gizle"
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-3)', opacity: 0.7 }}>
              {showPw ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {loginError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="body-sm mb-3 flex items-center gap-1.5" style={{ color: '#ff5d5d' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {loginError}
            </motion.p>
          )}
          <button type="submit"
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--accent) 70%, transparent)' }}>
            Giriş yap
          </button>
        </motion.form>
      </main>
    );
  }

  // ─────────── READY ───────────
  return (
    <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="method-get">ADMIN</span>
              <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>/admin</span>
            </div>
            <h1 className="display-lg" style={{ color: 'var(--fg)' }}>PANEL.</h1>
          </div>
          <motion.button onClick={logout}
            initial={{ opacity: 0, rotateY: -90 }} animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="group flex items-center gap-2 font-mono text-[11px] px-3.5 py-2 rounded-full border transition-all duration-200"
            style={{ transformPerspective: 700, background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg-2)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="transition-transform duration-200 group-hover:translate-x-0.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Çıkış
          </motion.button>
        </div>

        {view === 'list' ? (
          <>
            {/* Kurtarma: yarım kalmış taslak */}
            {recovered && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl border flex items-center gap-3"
                style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Yarım kalmış bir yazı var</p>
                  <p className="body-sm truncate" style={{ color: 'var(--fg-3)' }}>
                    {recovered.draft.title || 'Başlıksız taslak'} — kaldığın yerden devam edebilirsin.
                  </p>
                </div>
                <button onClick={() => {
                  setDraft(recovered.draft); setTagsInput(recovered.tagsInput);
                  setEditingSlug(recovered.editingSlug); setRecovered(null); setTab('edit'); setView('editor');
                }} className="flex-shrink-0 px-3.5 py-2 rounded-lg font-semibold text-[12px]" style={{ background: 'var(--accent)', color: '#fff' }}>Devam et</button>
                <button onClick={clearSavedDraft} className="flex-shrink-0 px-3 py-2 rounded-lg font-mono text-[11px] border"
                  style={{ color: 'var(--fg-3)', borderColor: 'var(--border)' }}>At</button>
              </motion.div>
            )}

            {/* İstatistik */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <Stat label="Toplam" value={stats.total} />
              <Stat label="Yayında" value={stats.published} accent />
              <Stat label="Taslak" value={stats.drafts} />
              <Stat label="Kelime" value={stats.words} />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-3)' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Yazılarda ara…"
                  className="input" style={{ paddingLeft: 38 }} />
              </div>
              <button onClick={newPost}
                className="flex-shrink-0 px-4 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}>+ Yeni</button>
            </div>

            <div className="space-y-3">
              {filtered.map(p => {
                const pub = p.published !== false;
                return (
                  <div key={p.slug} className="flex items-center gap-4 p-4 rounded-xl border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}>{p.symbol}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[14px] truncate" style={{ color: 'var(--fg)' }}>{p.title}</p>
                        <span className="flex-shrink-0 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                          style={pub
                            ? { color: '#30D158', background: 'color-mix(in srgb, #30D158 12%, transparent)' }
                            : { color: 'var(--fg-3)', background: 'var(--surface)' }}>
                          {pub ? 'yayında' : 'taslak'}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] truncate" style={{ color: 'var(--fg-3)' }}>{p.slug} · {p.date} · {p.readTime}dk</p>
                    </div>
                    <button onClick={() => togglePublish(p)} title={pub ? 'Taslağa al' : 'Yayına al'} className={miniBtn}>
                      {pub
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                    <button onClick={() => duplicatePost(p)} title="Çoğalt" className={miniBtn}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                    <button onClick={() => editPost(p)} className="font-mono text-[11px] px-2.5 py-1 rounded-lg border"
                      style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>Düzenle</button>
                    <button onClick={() => confirmDelete(p.slug)} className="font-mono text-[11px] px-2.5 py-1 rounded-lg border"
                      style={{ color: '#ff5d5d', borderColor: 'var(--border)' }}>Sil</button>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="body-sm" style={{ color: 'var(--fg-3)' }}>
                {search ? 'Aramayla eşleşen yazı yok.' : 'Henüz yazı yok.'}</p>}
            </div>
          </>
        ) : (
          <form onSubmit={e => { e.preventDefault(); doSave(); }} className="space-y-5">
            {/* Editör üst bar */}
            <div className="flex items-center justify-between">
              <button type="button" onClick={leaveEditor} className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>← listeye dön</button>
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
                {(['edit', 'preview'] as Tab[]).map(t => (
                  <button key={t} type="button" onClick={() => setTab(t)}
                    className="font-mono text-[11px] px-3 py-1.5 rounded-md transition-colors"
                    style={tab === t ? { background: 'var(--bg-card)', color: 'var(--fg)' } : { color: 'var(--fg-3)' }}>
                    {t === 'edit' ? 'Yaz' : 'Önizle'}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'preview' ? (
              <Preview draft={draft} tags={tagsInput.split(',').map(t => t.trim()).filter(Boolean)} />
            ) : (
              <>
                {/* Durum */}
                <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Yayın durumu</p>
                    <p className="body-sm" style={{ color: 'var(--fg-3)' }}>{draft.published !== false ? 'Sitede herkese görünür' : 'Yalnızca panelde görünür (taslak)'}</p>
                  </div>
                  <Switch on={draft.published !== false} onClick={() => setField('published', !(draft.published !== false))} />
                </div>

                <Field label="Başlık">
                  <input value={draft.title} onChange={e => setField('title', e.target.value)} className="input" required />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Slug (URL) — boşsa başlıktan üretilir">
                    <input value={draft.slug} onChange={e => setField('slug', e.target.value)} placeholder="ornek-yazi" disabled={!!editingSlug} className="input" />
                    <span className="block font-mono text-[10px] mt-1.5 truncate" style={{ color: 'var(--fg-3)' }}>
                      /feed/{editingSlug ?? (draft.slug.trim() || slugify(draft.title) || 'yazi')}
                    </span>
                  </Field>
                  <Field label="Tarih">
                    <input type="date" value={draft.date} onChange={e => setField('date', e.target.value)} className="input" />
                  </Field>
                </div>

                <Field label="Özet (listede görünen kısa açıklama)">
                  <textarea value={draft.excerpt} onChange={e => setField('excerpt', e.target.value)} rows={2} className="input" />
                </Field>

                <Field label="Kapak görseli (opsiyonel)">
                  <div className="flex gap-2">
                    <input value={draft.cover ?? ''} onChange={e => setField('cover', e.target.value || undefined)} placeholder="https://… veya yükle" className="input" />
                    <UploadButton uploading={uploading} onPick={async f => { const url = await uploadFile(f); if (url) setField('cover', url); }} />
                    {draft.cover && <button type="button" onClick={() => setField('cover', undefined)} className={miniBtn} title="Kaldır" style={{ color: '#ff5d5d' }}>✕</button>}
                  </div>
                  {draft.cover && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={draft.cover} alt="" className="mt-2 w-full rounded-lg" style={{ maxHeight: 160, objectFit: 'cover', border: '1px solid var(--border)' }} />
                  )}
                </Field>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Emoji">
                    <div className="relative">
                      <button type="button" onClick={() => setEmojiOpen(o => !o)} className="input text-left" style={{ cursor: 'pointer' }}>
                        <span className="text-lg">{draft.symbol}</span>
                      </button>
                      {emojiOpen && (
                        <div className="absolute z-20 mt-2 p-2 rounded-xl border w-[236px]"
                          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 16px 40px -12px rgba(0,0,0,0.4)' }}>
                          <input value={emojiSearch} onChange={e => setEmojiSearch(e.target.value)} autoFocus
                            placeholder="ara: veritabanı, docker…"
                            className="w-full mb-2 px-2.5 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)' }} />
                          <div className="grid grid-cols-6 gap-1 max-h-[176px] overflow-y-auto">
                            {EMOJI_OPTIONS.filter(o => { const q = emojiSearch.trim().toLowerCase(); return !q || o.k.includes(q); }).map(o => (
                              <button key={o.e} type="button" title={o.k.split(' ')[0]}
                                onClick={() => { setField('symbol', o.e); setEmojiOpen(false); setEmojiSearch(''); }}
                                className="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors hover:bg-[var(--surface)]">{o.e}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Field>
                  <Field label={`Okuma (dk) · ${draftWords} kelime`}>
                    <div className="flex gap-2">
                      <input type="number" min={1} value={draft.readTime} onChange={e => setField('readTime', Number(e.target.value))} className="input" />
                      <button type="button" onClick={() => setField('readTime', suggestedReadTime)} title="Otomatik hesapla"
                        className="flex-shrink-0 px-3 rounded-lg border font-mono text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--fg-3)' }}>auto</button>
                    </div>
                  </Field>
                  <Field label="Renk">
                    <div className="flex gap-2">
                      <input type="color" value={draft.gradient[0]} onChange={e => setField('gradient', [e.target.value, draft.gradient[1]])}
                        className="h-10 w-full rounded-lg cursor-pointer" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                      <input type="color" value={draft.gradient[1]} onChange={e => setField('gradient', [draft.gradient[0], e.target.value])}
                        className="h-10 w-full rounded-lg cursor-pointer" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                    </div>
                  </Field>
                </div>

                {/* Gradyan hazır paletler */}
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map((g, i) => (
                    <button key={i} type="button" onClick={() => setField('gradient', g)} title="Bu rengi kullan"
                      className="w-8 h-8 rounded-lg border transition-transform hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, borderColor: 'var(--border)' }} />
                  ))}
                </div>

                <Field label="Etiketler (virgülle ayır)">
                  <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Python, Docker, RPA" className="input" list="tag-suggestions" />
                  <datalist id="tag-suggestions">{allTags.map(t => <option key={t} value={t} />)}</datalist>
                </Field>

                {/* İçerik blokları */}
                <div className="pt-2">
                  <p className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--fg-3)' }}>İçerik</p>
                  <div className="space-y-3">
                    {draft.content.map((block, i) => (
                      <div key={i}
                        onDragOver={e => { if (dragIndex !== null) e.preventDefault(); }}
                        onDrop={() => { if (dragIndex !== null) moveBlockTo(dragIndex, i); setDragIndex(null); }}
                        className="p-4 rounded-xl border transition-colors"
                        style={{ background: 'var(--bg-card)', borderColor: dragIndex === i ? 'var(--accent)' : 'var(--border)', opacity: dragIndex === i ? 0.6 : 1 }}>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span draggable onDragStart={() => setDragIndex(i)} onDragEnd={() => setDragIndex(null)}
                              className={miniBtn + ' cursor-grab active:cursor-grabbing select-none'} title="Sürükleyerek taşı"
                              style={{ color: 'var(--fg-3)' }}>⠿</span>
                            <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded"
                              style={{ background: 'var(--surface)', color: 'var(--accent)' }}>{BLOCK_LABELS[block.type]}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => moveBlock(i, -1)} className={miniBtn} title="Yukarı">↑</button>
                            <button type="button" onClick={() => moveBlock(i, 1)} className={miniBtn} title="Aşağı">↓</button>
                            <button type="button" onClick={() => duplicateBlock(i)} className={miniBtn} title="Çoğalt">⧉</button>
                            <button type="button" onClick={() => removeBlock(i)} className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
                          </div>
                        </div>
                        {block.type === 'divider' ? (
                          <p className="body-sm" style={{ color: 'var(--fg-3)' }}>— görsel ayraç çizgisi —</p>
                        ) : block.type === 'list' ? (
                          <textarea value={(block.items ?? []).join('\n')} onChange={e => updateBlock(i, { items: e.target.value.split('\n') })}
                            rows={4} placeholder="Her satır bir madde" className="input" />
                        ) : block.type === 'code' ? (
                          <>
                            <input value={block.lang ?? ''} onChange={e => updateBlock(i, { lang: e.target.value })} placeholder="dil (örn. python)" className="input mb-2" />
                            <textarea value={block.text ?? ''} onChange={e => updateBlock(i, { text: e.target.value })} rows={5} placeholder="kod…" className="input"
                              style={{ fontFamily: 'var(--font-jetbrains, monospace)' }} />
                          </>
                        ) : block.type === 'image' ? (
                          <>
                            <div className="flex gap-2 mb-2">
                              <input value={block.url ?? ''} onChange={e => updateBlock(i, { url: e.target.value })} placeholder="https://… görsel adresi" className="input" />
                              <UploadButton uploading={uploading} onPick={async f => { const url = await uploadFile(f); if (url) updateBlock(i, { url }); }} />
                            </div>
                            {block.url && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={block.url} alt="" className="mb-2 w-full rounded-lg" style={{ maxHeight: 160, objectFit: 'cover', border: '1px solid var(--border)' }} />
                            )}
                            <input value={block.text ?? ''} onChange={e => updateBlock(i, { text: e.target.value })} placeholder="açıklama (opsiyonel)" className="input" />
                          </>
                        ) : (
                          <textarea value={block.text ?? ''} onChange={e => updateBlock(i, { text: e.target.value })}
                            rows={block.type === 'p' || block.type === 'note' || block.type === 'quote' ? 3 : 1} placeholder="metin…" className="input" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {(Object.keys(BLOCK_LABELS) as ContentBlock['type'][]).map(t => (
                      <button key={t} type="button" onClick={() => addBlock(t)}
                        className="font-mono text-[11px] px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                        style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ {BLOCK_LABELS[t]}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {formError && <p className="body-sm" style={{ color: '#ff5d5d' }}>{formError}</p>}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="px-5 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {saving ? 'Kaydediliyor…' : editingSlug ? 'Güncelle' : 'Yayınla'}
              </button>
              <button type="button" onClick={leaveEditor} className="px-5 py-3 rounded-xl font-semibold text-sm border"
                style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>İptal</button>
              <span className="font-mono text-[10px] ml-auto" style={{ color: 'var(--fg-3)' }}>Ctrl+S ile kaydet</span>
            </div>
          </form>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full font-mono text-[12px] flex items-center gap-2"
            style={{ background: 'var(--bg-card)', border: `1px solid ${toast.type === 'ok' ? '#30D158' : '#ff5d5d'}`, color: 'var(--fg)', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.4)' }}>
            <span style={{ color: toast.type === 'ok' ? '#30D158' : '#ff5d5d' }}>{toast.type === 'ok' ? '✓' : '✕'}</span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onay penceresi */}
      <AnimatePresence>
        {confirmState && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center px-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={() => setConfirmState(null)}>
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-sm p-6 rounded-2xl border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <p className="body-md mb-6" style={{ color: 'var(--fg)' }}>{confirmState.msg}</p>
              <div className="flex gap-3">
                <button onClick={() => { confirmState.action(); setConfirmState(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: '#ff5d5d', color: '#fff' }}>Sil</button>
                <button onClick={() => setConfirmState(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm border"
                  style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>Vazgeç</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

const miniBtn = 'w-7 h-7 rounded-lg border flex items-center justify-center text-xs flex-shrink-0';

function UploadButton({ onPick, uploading, label = 'Yükle' }: { onPick: (f: File) => void; uploading: boolean; label?: string }) {
  return (
    <label className="flex-shrink-0 px-3 rounded-lg border font-mono text-[11px] flex items-center cursor-pointer transition-colors hover:opacity-80"
      style={{ borderColor: 'var(--border)', color: 'var(--fg-3)' }} title="Bilgisayardan görsel yükle">
      {uploading ? '…' : label}
      <input type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }} />
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="display-md" style={{ color: accent ? 'var(--accent)' : 'var(--fg)', fontSize: 22 }}>{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--fg-3)' }}>{label}</p>
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} role="switch" aria-checked={on}
      className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
      style={{ background: on ? 'var(--accent)' : 'var(--bg-raised)' }}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 24 : 4 }} />
    </button>
  );
}

// ── Önizleme: feed okuyucusuyla aynı görünümü taklit eder ──
function Preview({ draft, tags }: { draft: Post; tags: string[] }) {
  return (
    <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      {draft.cover && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={draft.cover} alt="" className="w-full rounded-xl mb-6" style={{ maxHeight: 280, objectFit: 'cover', border: '1px solid var(--border)' }} />
      )}
      <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-2xl"
        style={{ background: `linear-gradient(135deg, ${draft.gradient[0]}, ${draft.gradient[1]})` }}>{draft.symbol}</div>
      <div className="flex flex-wrap gap-1.5 mb-4">{tags.map(t => <span key={t} className="tag tag-accent font-mono text-[10px]">{t}</span>)}</div>
      <h1 className="display-lg mb-3" style={{ color: 'var(--fg)' }}>{draft.title || 'Başlık'}</h1>
      <div className="flex items-center gap-2.5 font-mono text-[12px] mb-5" style={{ color: 'var(--fg-3)' }}>
        <span>{draft.date}</span><span>·</span><span>{draft.readTime} min</span>
        {draft.published === false && <><span>·</span><span style={{ color: 'var(--fg-3)' }}>TASLAK</span></>}
      </div>
      {draft.excerpt && <p className="body-md mb-6 pl-4" style={{ color: 'var(--fg-2)', borderLeft: '2px solid var(--border)' }}>{draft.excerpt}</p>}
      <div className="divider mb-8" />
      <div>{draft.content.map((b, i) => <PreviewBlock key={i} block={b} />)}</div>
    </div>
  );
}

function PreviewBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'h2': return <h2 className="display-md mt-8 mb-3" style={{ color: 'var(--fg)' }}>{block.text}</h2>;
    case 'h3': return <h3 className="font-semibold text-base mt-6 mb-2.5" style={{ color: 'var(--fg)' }}>{block.text}</h3>;
    case 'p': return <p className="body-md mb-4" style={{ color: 'var(--fg-2)' }}><MD>{block.text ?? ''}</MD></p>;
    case 'code': return (
      <div className="code-block my-4">
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{block.lang || 'code'}</span>
        </div>
        <pre className="overflow-x-auto p-4" style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 13, color: 'var(--fg-2)' }}><code>{block.text}</code></pre>
      </div>
    );
    case 'list': return (
      <ul className="mb-4 space-y-2 pl-0">{(block.items ?? []).map((it, i) => (
        <li key={i} className="flex items-start gap-3 body-md" style={{ color: 'var(--fg-2)' }}>
          <span className="mt-2.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />{it}</li>))}</ul>
    );
    case 'note': return (
      <div className="my-4 p-4 rounded-xl body-md" style={{ background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderLeft: '3px solid var(--accent)', color: 'var(--fg-2)' }}>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--accent)' }}>Note</span><MD>{block.text ?? ''}</MD></div>
    );
    case 'quote': return <blockquote className="my-5 pl-5 body-lg italic" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--fg)' }}><MD>{block.text ?? ''}</MD></blockquote>;
    case 'image': return block.url ? (
      <figure className="my-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.url} alt={block.text || ''} className="w-full rounded-xl" style={{ border: '1px solid var(--border)' }} />
        {block.text && <figcaption className="body-sm text-center mt-2" style={{ color: 'var(--fg-3)' }}>{block.text}</figcaption>}
      </figure>
    ) : <p className="body-sm" style={{ color: 'var(--fg-3)' }}>[görsel adresi yok]</p>;
    case 'divider': return <hr className="my-6" style={{ border: 0, borderTop: '1px solid var(--border)' }} />;
    default: return null;
  }
}
