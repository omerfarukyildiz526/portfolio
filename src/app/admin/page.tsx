'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Post, ContentBlock } from '@/lib/posts';
import type { SkillsContent, SkillsLang } from '@/lib/skills-content';
import type { SiteContent, PageKey, HomeLang, ExperienceLang, ContactLang, ProjectsLang } from '@/lib/site-content';
import { MD } from '@/components/Markdown';
import Loader from '@/components/Loader';

type Status = 'loading' | 'setup' | 'login' | 'ready' | 'dberror';
type View = 'list' | 'editor';
type Tab = 'edit' | 'preview';
type Section = 'overview' | 'home' | 'experience' | 'skills' | 'projects' | 'posts' | 'contact' | 'messages' | 'security';

// Tek satırda birleşik sekmeler — istenen sıra.
const SECTIONS: [Section, string][] = [
  ['overview',   'Özet'],
  ['home',       'Ana Sayfa'],
  ['experience', 'Deneyim'],
  ['skills',     'Donanım'],
  ['projects',   'Projeler'],
  ['posts',      'Yazılar'],
  ['contact',    'İletişim'],
  ['messages',   'Mesajlar'],
  ['security',   'Güvenlik'],
];
// Sayfa editörü kullanan bölümler.
const PAGE_SECTIONS: Section[] = ['home', 'experience', 'contact', 'projects'];

interface Message { id: string; name: string; email: string; message: string; createdAt: string; read: boolean; }

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

// Giriş ekranı kilidi (istemci tarafı caydırıcı): bu kadar hatalı denemeden
// sonra giriş kısa süreli kilitlenir. Gerçek brute-force koruması ayrıca
// sunucu tarafında yapılmalı.
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;

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
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [code, setCode] = useState('');           // "şifre" gibi görünen e-posta kodu
  const [verifying, setVerifying] = useState(false);
  const [pushPending, setPushPending] = useState(false); // telefon onayı bekleniyor
  const [pushMsg, setPushMsg] = useState('');
  const [sessionLeft, setSessionLeft] = useState(10 * 60); // oturum geri sayımı (saniye)
  const [attempts, setAttempts] = useState(0);    // arka arkaya hatalı kod denemesi
  const [lockUntil, setLockUntil] = useState(0);  // bu ms zamanına kadar giriş kilitli
  const [nowTs, setNowTs] = useState(() => Date.now()); // kilit geri sayımı için tikler

  const [posts, setPosts] = useState<Post[]>([]);
  const [section, setSection] = useState<Section>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [openMsg, setOpenMsg] = useState<string | null>(null);
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

  // Kararlı referans: panellere geçince her render'da yeni fonksiyon oluşmasın
  // (yoksa çocukların useEffect([onAuthError])'i her saniye yeniden çekip
  // düzenlenen içeriği eski haline ezerdi).
  const goLogin = useCallback(() => setStatus('login'), []);

  const loadPosts = useCallback(async () => {
    const res = await fetch('/api/admin/posts', { cache: 'no-store' });
    if (res.status === 401) { setStatus('login'); return; }
    const data = await res.json();
    setPosts(data.posts ?? []);
  }, []);

  const loadMessages = useCallback(async () => {
    const res = await fetch('/api/admin/messages', { cache: 'no-store' });
    if (res.status === 401) { setStatus('login'); return; }
    const data = await res.json();
    setMessages(data.messages ?? []);
    setUnread(data.unread ?? 0);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/session', { cache: 'no-store' });
        const d = await res.json();
        if (d.dbError) { setStatus('dberror'); return; }
        if (d.authed) { await Promise.all([loadPosts(), loadMessages()]); setStatus('ready'); }
        else if (d.needsSetup) setStatus('setup');
        else {
          setStatus('login');
          // Kandırma: "şifre" ekranı açılır açılmaz arka planda e-posta kodu gönder.
          const lr = await fetch('/api/admin/login', { method: 'POST' });
          const ld = await lr.json().catch(() => ({}));
          if (lr.ok && !ld.codeRequired) {
            // SMTP yok → doğrudan giriş (geliştirme).
            await Promise.all([loadPosts(), loadMessages()]);
            setStatus('ready');
          }
        }
      } catch {
        setStatus('dberror');
      }
    })();
  }, [loadPosts, loadMessages]);

  // ---- Auth ----
  // "Şifre" gibi görünen alan aslında e-posta doğrulama kodudur (kandırma).
  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (verifying || !code) return;
    if (lockUntil > Date.now()) return; // kilitliyken denemeyi engelle
    setLoginError('');
    setVerifying(true);
    const res = await fetch('/api/admin/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    setVerifying(false);
    if (res.ok) {
      setCode(''); setAttempts(0); setLockUntil(0);
      await Promise.all([loadPosts(), loadMessages()]);
      setStatus('ready');
    } else {
      // Gerçekte kod hatalı — ama kandırma için "şifre" diyoruz.
      const next = attempts + 1;
      setCode('');
      if (next >= MAX_ATTEMPTS) {
        setAttempts(0);
        setLockUntil(Date.now() + LOCK_SECONDS * 1000);
        setNowTs(Date.now());
        setLoginError(`Çok fazla hatalı deneme. ${LOCK_SECONDS} sn bekle.`);
      } else {
        setAttempts(next);
        setLoginError(`Şifre hatalı. ${MAX_ATTEMPTS - next} hakkın kaldı.`);
      }
    }
  }

  // Telefon onaylı giriş: onay isteği gönder, onay gelene kadar yokla.
  // endpoint hem Web Push (/push/login) hem Telegram (/telegram/login) için kullanılır.
  async function runApproval(endpoint: string, sentMsg: string) {
    if (pushPending || lockUntil > Date.now()) return;
    setLoginError(''); setPushMsg('');
    setPushPending(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.id) { setPushMsg(d.error || 'Başlatılamadı.'); setPushPending(false); return; }
      setPushMsg(sentMsg);
      const id = d.id as string;
      const started = Date.now();
      const poll = async () => {
        if (Date.now() - started > 5 * 60 * 1000) { setPushMsg('Süre doldu, tekrar dene.'); setPushPending(false); return; }
        try {
          const r = await fetch(`${endpoint}?id=${id}`, { cache: 'no-store' });
          const s = await r.json().catch(() => ({}));
          if (s.status === 'approved' && s.ok) {
            setPushPending(false); setPushMsg('');
            await Promise.all([loadPosts(), loadMessages()]);
            setStatus('ready');
            return;
          }
          if (s.status === 'denied') { setPushMsg('Giriş telefonda reddedildi.'); setPushPending(false); return; }
          if (s.status === 'expired' || s.status === 'unknown') { setPushMsg('İstek geçersiz/süresi doldu, tekrar dene.'); setPushPending(false); return; }
        } catch {}
        setTimeout(poll, 2000);
      };
      setTimeout(poll, 2000);
    } catch {
      setPushMsg('Bağlantı hatası.'); setPushPending(false);
    }
  }

  async function setupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    if (password.length < 4) { setLoginError('Şifre en az 4 karakter olmalı.'); return; }
    if (password !== password2) { setLoginError('Şifreler eşleşmiyor.'); return; }
    const res = await fetch('/api/admin/setup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setPassword(''); setPassword2(''); await Promise.all([loadPosts(), loadMessages()]); setStatus('ready'); }
    else { const d = await res.json().catch(() => ({})); setLoginError(d.error || 'Kurulum başarısız.'); }
  }

  // Giriş ekranını göster ve arka planda yeni e-posta kodunu gönder
  // (mount'taki ilk akışla aynı — kandırma: "şifre" alanı aslında koddur).
  const showLogin = useCallback(async () => {
    setStatus('login');
    try {
      const lr = await fetch('/api/admin/login', { method: 'POST' });
      const ld = await lr.json().catch(() => ({}));
      if (lr.ok && !ld.codeRequired) {
        // SMTP yok → doğrudan giriş (geliştirme).
        await Promise.all([loadPosts(), loadMessages()]);
        setStatus('ready');
      }
    } catch {}
  }, [loadPosts, loadMessages]);

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    await showLogin();
  }

  // Oturum 10 dk sonra kapanır — sabit geri sayım (harekete bakmaz).
  // Saniyede bir kalan süreyi günceller (geri sayım header'da gösterilir).
  // Süre bitince çıkış yap + kod iste; ayrıca dakikada bir /api/admin/session'a
  // ping atıp sunucu tarafı oturum düşmüşse giriş ekranına dön.
  useEffect(() => {
    if (status !== 'ready') return;
    const IDLE_MS = 10 * 60 * 1000;
    const expiry = Date.now() + IDLE_MS;
    setSessionLeft(IDLE_MS / 1000);
    let lastPing = Date.now();
    const id = setInterval(() => {
      const leftMs = expiry - Date.now();
      if (leftMs <= 0) { setSessionLeft(0); logout(); return; }
      setSessionLeft(Math.ceil(leftMs / 1000));
      if (Date.now() - lastPing >= 60 * 1000) {
        lastPing = Date.now();
        fetch('/api/admin/session', { cache: 'no-store' })
          .then(r => r.json())
          .then(d => { if (d && d.authed === false) showLogin(); })
          .catch(() => {});
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Giriş kilitliyken saniyede bir geri sayımı güncelle; süre dolunca dur.
  useEffect(() => {
    if (lockUntil <= Date.now()) return;
    const id = setInterval(() => {
      setNowTs(Date.now());
      if (Date.now() >= lockUntil) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

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

  // ---- Mesaj aksiyonları ----
  async function markRead(id: string, read: boolean) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read }),
    });
    if (res.status === 401) return setStatus('login');
    if (res.ok) loadMessages();
  }
  function openMessage(m: Message) {
    if (openMsg === m.id) { setOpenMsg(null); return; }
    setOpenMsg(m.id);
    if (!m.read) markRead(m.id, true); // açınca okundu say
  }
  function confirmDeleteMessage(id: string) {
    setConfirmState({
      msg: 'Bu mesaj silinsin mi?',
      action: async () => {
        const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
        if (res.status === 401) return setStatus('login');
        if (res.ok) { await loadMessages(); notify('Mesaj silindi.'); }
        else notify('Silinemedi.', 'err');
      },
    });
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
    return <main className="min-h-screen flex items-center justify-center">
      <Loader route="/admin" />
    </main>;
  }

  if (status === 'dberror') {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-md p-8 rounded-3xl border text-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl mb-6 mx-auto flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, #ff5d5d 14%, transparent)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5d5d" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <h1 className="display-md mb-2" style={{ color: 'var(--fg)' }}>Veritabanına bağlanılamadı</h1>
          <p className="body-sm mb-5" style={{ color: 'var(--fg-3)' }}>
            <code style={{ color: 'var(--fg-2)' }}>MONGODB_URI</code> tanımlı değil ya da yanlış. Atlas bağlantı adresini (gerçek şifreyle)
            ortam değişkenlerine ekleyip yeniden dene.
          </p>
          <Link href="/feed" className="font-mono text-[12px]" style={{ color: 'var(--accent)' }}>← /feed</Link>
        </div>
      </main>
    );
  }

  if (status === 'setup') {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[420px] h-[420px] rounded-full opacity-[0.18] blur-[90px]"
            style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />
        </div>
        <motion.form onSubmit={setupSubmit}
          initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full max-w-sm p-8 rounded-3xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 24px 60px -20px rgba(0,0,0,0.45)' }}>
          <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), #0a5fff)', boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--accent) 60%, transparent)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </div>
          <h1 className="display-md mb-1.5" style={{ color: 'var(--fg)' }}>İlk kurulum</h1>
          <p className="body-sm mb-7" style={{ color: 'var(--fg-3)' }}>Yönetici şifreni belirle — veritabanında güvenle saklanır.</p>
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Yeni şifre" autoFocus className="input mb-3" />
          <input type={showPw ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)}
            placeholder="Şifre (tekrar)" className="input mb-3" />
          <label className="flex items-center gap-2 mb-4 font-mono text-[11px] cursor-pointer" style={{ color: 'var(--fg-3)' }}>
            <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} /> Şifreyi göster
          </label>
          {loginError && <p className="body-sm mb-3" style={{ color: '#ff5d5d' }}>{loginError}</p>}
          <button type="submit"
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--accent)', color: '#fff' }}>Şifreyi belirle ve gir</button>
        </motion.form>
      </main>
    );
  }

  if (status === 'login') {
    const lockLeft = Math.max(0, Math.ceil((lockUntil - nowTs) / 1000));
    const locked = lockLeft > 0;
    const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
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

        <motion.form onSubmit={submitCode}
          initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full max-w-sm p-8 rounded-3xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 24px 60px -20px rgba(0,0,0,0.45)' }}>
          <motion.button type="button" title="Telegram'dan giriş onayı gönder"
            aria-label="Telegram'dan giriş onayı gönder"
            onClick={() => { if (!pushPending && !locked) runApproval('/api/admin/telegram/login', '📨 Telegram\'a onay gönderildi, bekleniyor…'); }}
            disabled={pushPending || locked}
            className="w-28 h-28 rounded-full mb-6 mx-auto flex items-center justify-center overflow-hidden relative disabled:opacity-60"
            style={{ border: '1px solid var(--border)', cursor: pushPending || locked ? 'default' : 'pointer' }}
            whileHover={pushPending || locked ? undefined : { scale: 1.05 }}
            whileTap={pushPending || locked ? undefined : { scale: 0.96 }}
            animate={{ boxShadow: [
              '0 0 0 0 color-mix(in srgb, var(--accent) 55%, transparent)',
              '0 0 34px 9px color-mix(in srgb, var(--accent) 55%, transparent)',
              '0 0 0 0 color-mix(in srgb, var(--accent) 55%, transparent)',
            ] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ÖFY" className="w-full h-full object-cover" />
            {pushPending && (
              <span className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                <span className="inline-block w-7 h-7 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </span>
            )}
          </motion.button>
          <h1 className="display-md mb-1.5 text-center" style={{ color: 'var(--fg)' }}>Merhaba Admin 👋</h1>
          <p className="body-sm mb-7 text-center" style={{ color: 'var(--fg-3)' }}>Kontrol Merkezi&apos;ne hoş geldin. Giriş için şifreni gir lütfen.</p>
          <div className="relative mb-3">
            <input type={showPw ? 'text' : 'password'} value={code}
              onChange={e => { setCode(e.target.value); if (loginError) setLoginError(''); }}
              placeholder="••••••••" autoFocus autoComplete="off" className="input"
              disabled={locked} enterKeyHint="go" aria-label="Giriş şifresi"
              aria-invalid={!!loginError} style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPw(s => !s)} aria-label="Göster/gizle"
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-3)', opacity: 0.7 }}>
              {showPw ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          <div role="alert" aria-live="assertive">
            {loginError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="body-sm mb-3 flex items-center gap-1.5" style={{ color: '#ff5d5d' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                {locked ? `Çok fazla hatalı deneme. ${lockLeft} sn sonra tekrar dene.` : loginError}
              </motion.p>
            )}
          </div>
          {/* Kalan deneme göstergesi — hata yokken ama deneme tükenmeye başlamışken */}
          {!locked && attempts > 0 && (
            <div className="flex items-center gap-1.5 mb-3" aria-hidden="true">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <span key={i} className="inline-block w-1.5 h-1.5 rounded-full transition-colors"
                  style={{ background: i < remaining ? 'var(--accent)' : 'color-mix(in srgb, #ff5d5d 60%, transparent)' }} />
              ))}
              <span className="font-mono text-[10px] ml-1" style={{ color: 'var(--fg-3)' }}>{remaining} hak kaldı</span>
            </div>
          )}
          <button type="submit" disabled={verifying || !code || locked}
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: locked ? 'var(--surface)' : 'var(--accent)', color: locked ? 'var(--fg-3)' : '#fff', boxShadow: locked ? 'none' : '0 8px 24px -8px color-mix(in srgb, var(--accent) 70%, transparent)' }}>
            {locked ? `Kilitli — ${lockLeft}s` : verifying ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>

          {/* Telegram onay durumu (logoya dokununca tetiklenir) */}
          {pushMsg && <p className="body-sm mt-3 text-center" style={{ color: 'var(--fg-3)' }}>{pushMsg}</p>}

          {/* Görsel imza / durum çubuğu */}
          <div className="mt-5 pt-4 flex items-center justify-center gap-1.5 font-mono text-[10px]"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-3)' }}>
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: locked ? '#ff5d5d' : '#30D158' }}
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
            {locked ? 'erişim geçici olarak kilitli' : 'güvenli bağlantı · yalnızca yetkili'}
          </div>
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
            <h1 className="display-lg" style={{ color: 'var(--fg)' }}>CONTROL.</h1>
            <p className="font-mono text-[12px] mt-2" style={{ color: 'var(--fg-3)' }}>
              Selam patron.{' '}
              <span style={{ color: 'var(--accent)' }}>// bir şeyi bozarsan, onu da yine sen düzeltirsin 🫡</span>
            </p>
          </div>
          <motion.div className="flex items-center gap-2"
            initial={{ opacity: 0, rotateY: -90 }} animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformPerspective: 700 }}>
            {(() => {
              const warn = sessionLeft <= 60; // son 1 dk → dikkat çekmek için nabız
              const mm = String(Math.floor(sessionLeft / 60)).padStart(2, '0');
              const ss = String(sessionLeft % 60).padStart(2, '0');
              return (
                <motion.span title="Oturum bu süre sonunda kapanır"
                  className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-2 rounded-full border tabular-nums"
                  style={{ background: 'color-mix(in srgb, #ff5d5d 8%, var(--bg-card))', borderColor: 'color-mix(in srgb, #ff5d5d 45%, transparent)', color: '#ff5d5d' }}
                  animate={warn ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
                  transition={warn ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  {mm}:{ss}
                </motion.span>
              );
            })()}
            <button onClick={logout}
              className="group flex items-center gap-2 font-mono text-[11px] px-3.5 py-2 rounded-full border transition-all duration-200"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg-2)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Çıkış
            </button>
          </motion.div>
        </div>

        {view === 'list' ? (
          <>
            {/* Bölüm sekmeleri — tek satırda birleşik */}
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--surface)' }}>
              {SECTIONS.map(([s, label]) => (
                <button key={s} onClick={() => setSection(s)}
                  className="font-mono text-[12px] px-3.5 py-2 rounded-lg transition-colors"
                  style={section === s ? { background: 'var(--bg-card)', color: 'var(--fg)' } : { color: 'var(--fg-3)' }}>
                  {label}
                  {s === 'messages' && unread > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold align-middle"
                      style={{ background: 'var(--accent)', color: '#fff' }}>{unread}</span>
                  )}
                </button>
              ))}
            </div>

            {section === 'overview' ? (
              <OverviewPanel posts={posts} messages={messages} unread={unread}
                onAuthError={goLogin} onGo={setSection} />
            ) : section === 'messages' ? (
              <MessagesPanel messages={messages} openMsg={openMsg} onOpen={openMessage} onToggleRead={markRead} onDelete={confirmDeleteMessage} />
            ) : section === 'security' ? (
              <SecurityPanel notify={notify} onAuthError={goLogin} />
            ) : section === 'skills' ? (
              <SkillsPanel notify={notify} onAuthError={goLogin} />
            ) : PAGE_SECTIONS.includes(section) ? (
              <PagesPanel page={section as PageKey} notify={notify} onAuthError={goLogin} />
            ) : (
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
            )}
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

function MessagesPanel({ messages, openMsg, onOpen, onToggleRead, onDelete }: {
  messages: Message[]; openMsg: string | null;
  onOpen: (m: Message) => void; onToggleRead: (id: string, read: boolean) => void; onDelete: (id: string) => void;
}) {
  if (messages.length === 0) {
    return <p className="body-sm" style={{ color: 'var(--fg-3)' }}>Henüz mesaj yok. İletişim formundan gelenler burada görünecek.</p>;
  }
  return (
    <div className="space-y-3">
      {messages.map(m => {
        const open = openMsg === m.id;
        return (
          <div key={m.id} className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--bg-card)', borderColor: m.read ? 'var(--border)' : 'color-mix(in srgb, var(--accent) 35%, transparent)' }}>
            <button onClick={() => onOpen(m)} className="w-full text-left flex items-center gap-3 p-4">
              {!m.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] truncate" style={{ color: 'var(--fg)', fontWeight: m.read ? 500 : 700 }}>{m.name}</p>
                  <span className="font-mono text-[11px] truncate" style={{ color: 'var(--fg-3)' }}>{m.email}</span>
                </div>
                {!open && <p className="body-sm truncate" style={{ color: 'var(--fg-3)' }}>{m.message}</p>}
              </div>
              <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'var(--fg-3)' }}>
                {new Date(m.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </span>
            </button>
            {open && (
              <div className="px-4 pb-4">
                <p className="body-md whitespace-pre-wrap mb-4" style={{ color: 'var(--fg-2)' }}>{m.message}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: Portföy mesajın')}`}
                    className="font-mono text-[11px] px-3 py-1.5 rounded-lg" style={{ background: 'var(--accent)', color: '#fff' }}>Yanıtla</a>
                  <button onClick={() => onToggleRead(m.id, !m.read)} className="font-mono text-[11px] px-3 py-1.5 rounded-lg border"
                    style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>{m.read ? 'Okunmadı yap' : 'Okundu yap'}</button>
                  <button onClick={() => onDelete(m.id)} className="font-mono text-[11px] px-3 py-1.5 rounded-lg border"
                    style={{ color: '#ff5d5d', borderColor: 'var(--border)' }}>Sil</button>
                  <span className="font-mono text-[10px] ml-auto" style={{ color: 'var(--fg-3)' }}>{new Date(m.createdAt).toLocaleString('tr-TR')}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Özet (/overview) — panel giriş panosu ──
function OverviewPanel({ posts, messages, unread, onAuthError, onGo }: {
  posts: Post[]; messages: Message[]; unread: number;
  onAuthError: () => void; onGo: (s: Section) => void;
}) {
  const [views, setViews] = useState<Record<string, number> | null>(null);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
      if (res.status === 401) return onAuthError();
      const d = await res.json().catch(() => ({}));
      setViews(d.views ?? {});
      setTotalViews(d.total ?? 0);
    })();
  }, [onAuthError]);

  const published = posts.filter(p => p.published !== false).length;
  const drafts = posts.length - published;
  const words = posts.reduce((s, p) => s + countWords(p), 0);
  const ranked = [...posts]
    .map(p => ({ p, v: views?.[p.slug] ?? 0 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);
  const recent = [...messages]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Görüntülenme" value={totalViews} accent />
        <Stat label="Yazı" value={posts.length} />
        <Stat label="Taslak" value={drafts} />
        <Stat label="Kelime" value={words} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* En çok okunanlar */}
        <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[11px] uppercase tracking-wide" style={{ color: 'var(--fg-3)' }}>En çok okunan</p>
            <button onClick={() => onGo('posts')} className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>tümü →</button>
          </div>
          {ranked.length === 0 || ranked.every(r => r.v === 0) ? (
            <p className="body-sm" style={{ color: 'var(--fg-3)' }}>{views === null ? 'Yükleniyor…' : 'Henüz görüntülenme yok.'}</p>
          ) : (
            <div className="space-y-2">
              {ranked.map(({ p, v }) => (
                <div key={p.slug} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}>{p.symbol}</div>
                  <span className="flex-1 min-w-0 truncate text-sm" style={{ color: 'var(--fg)' }}>{p.title}</span>
                  <span className="font-mono text-[12px] tabular-nums flex-shrink-0" style={{ color: 'var(--fg-2)' }}>{v.toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son mesajlar */}
        <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[11px] uppercase tracking-wide" style={{ color: 'var(--fg-3)' }}>
              Son mesajlar{unread > 0 && <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold align-middle" style={{ background: 'var(--accent)', color: '#fff' }}>{unread}</span>}
            </p>
            <button onClick={() => onGo('messages')} className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>tümü →</button>
          </div>
          {recent.length === 0 ? (
            <p className="body-sm" style={{ color: 'var(--fg-3)' }}>Henüz mesaj yok.</p>
          ) : (
            <div className="space-y-2.5">
              {recent.map(m => (
                <div key={m.id} className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />}
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--fg)' }}>{m.name}</span>
                  </div>
                  <p className="body-sm truncate" style={{ color: 'var(--fg-3)' }}>{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Güvenlik (/security) — Authenticator (QR/TOTP) + Telegram onayı ──
function SecurityPanel({ notify, onAuthError }: { notify: (m: string, t?: 'ok' | 'err') => void; onAuthError: () => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  // Telegram
  const [tgConfigured, setTgConfigured] = useState<boolean | null>(null);
  const [tgChatId, setTgChatId] = useState<string | undefined>(undefined);
  const [tgToken, setTgToken] = useState('');
  const [tgChatInput, setTgChatInput] = useState('');
  const [tgBusy, setTgBusy] = useState(false);

  const loadTg = useCallback(async () => {
    const res = await fetch('/api/admin/telegram', { cache: 'no-store' });
    if (res.status === 401) return;
    const d = await res.json().catch(() => ({}));
    setTgConfigured(!!d.configured);
    setTgChatId(d.chatId);
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/totp', { cache: 'no-store' });
      if (res.status === 401) return onAuthError();
      const d = await res.json().catch(() => ({}));
      setEnabled(!!d.enabled);
    })();
    (async () => { await loadTg(); })();
  }, [onAuthError, loadTg]);

  async function tgDiscover() {
    if (tgBusy || !tgToken.trim()) return;
    setTgBusy(true);
    const res = await fetch('/api/admin/telegram', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tgToken.trim() }),
    });
    setTgBusy(false);
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.chatId) { setTgChatInput(d.chatId); notify('Chat ID bulundu: ' + d.chatId); }
    else notify(d.error || 'Chat ID bulunamadı.', 'err');
  }

  async function tgActivate() {
    if (tgBusy || !tgToken.trim() || !tgChatInput.trim()) return;
    setTgBusy(true);
    const res = await fetch('/api/admin/telegram', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tgToken.trim(), chatId: tgChatInput.trim() }),
    });
    setTgBusy(false);
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setTgToken(''); await loadTg(); notify('Telegram etkinleştirildi 📨'); }
    else notify(d.error || 'Etkinleştirilemedi.', 'err');
  }

  async function tgDisable() {
    setTgBusy(true);
    const res = await fetch('/api/admin/telegram', { method: 'DELETE' });
    setTgBusy(false);
    if (res.status === 401) return onAuthError();
    if (res.ok) { setTgConfigured(false); setTgChatId(undefined); notify('Telegram kaldırıldı.'); }
    else notify('Kaldırılamadı.', 'err');
  }

  async function begin() {
    setBusy(true);
    const res = await fetch('/api/admin/totp', { method: 'POST' });
    setBusy(false);
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setQr(d.qr); setSecret(d.secret); setCode(''); }
    else notify(d.error || 'Başlatılamadı.', 'err');
  }

  async function confirm() {
    if (busy || !code) return;
    setBusy(true);
    const res = await fetch('/api/admin/totp', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setEnabled(true); setQr(null); setSecret(null); setCode(''); notify('Authenticator etkinleştirildi 📱'); }
    else notify(d.error || 'Doğrulanamadı.', 'err');
  }

  async function remove() {
    setBusy(true);
    const res = await fetch('/api/admin/totp', { method: 'DELETE' });
    setBusy(false);
    if (res.status === 401) return onAuthError();
    if (res.ok) { setEnabled(false); setQr(null); setSecret(null); notify('Authenticator kaldırıldı.'); }
    else notify('Kaldırılamadı.', 'err');
  }

  if (enabled === null) return <Loader route="/api/admin/totp" className="py-16" />;

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--surface)' }}>📱</div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Telefonla giriş (Authenticator)</p>
            <p className="font-mono text-[11px]" style={{ color: enabled ? '#30D158' : 'var(--fg-3)' }}>
              {enabled ? '● Etkin — uygulama kodu ile giriş yapabilirsin' : '○ Kurulu değil'}
            </p>
          </div>
        </div>
        <p className="body-sm" style={{ color: 'var(--fg-3)' }}>
          Google Authenticator, Microsoft Authenticator veya Authy ile QR&apos;ı okut; girişte e-posta kodu yerine
          uygulamanın ürettiği 6 haneli kodu da kullanabilirsin. (İkisi de geçerli.)
        </p>
      </div>

      {/* Kurulum akışı */}
      {!enabled && !qr && (
        <button onClick={begin} disabled={busy}
          className="px-4 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff' }}>{busy ? 'Hazırlanıyor…' : '📷 QR oluştur ve kur'}</button>
      )}

      {qr && (
        <div className="p-5 rounded-2xl border space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>1) Uygulamayla bu QR&apos;ı okut</p>
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Authenticator QR" width={220} height={220} className="rounded-xl" style={{ background: '#fff', padding: 8 }} />
          </div>
          {secret && (
            <p className="font-mono text-[11px] text-center break-all" style={{ color: 'var(--fg-3)' }}>
              QR okutamıyorsan elle gir:{' '}
              <span style={{ color: 'var(--fg)' }}>{secret}</span>
            </p>
          )}
          <div>
            <p className="font-semibold text-sm mb-2" style={{ color: 'var(--fg)' }}>2) Uygulamadaki 6 haneli kodu yaz</p>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric" placeholder="123456" autoFocus className="input tabular-nums" style={{ letterSpacing: 4 }} />
              <button onClick={confirm} disabled={busy || code.length < 6}
                className="flex-shrink-0 px-4 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}>{busy ? 'Doğrulanıyor…' : 'Etkinleştir'}</button>
            </div>
          </div>
          <button onClick={() => { setQr(null); setSecret(null); setCode(''); }}
            className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>← Vazgeç</button>
        </div>
      )}

      {enabled && (
        <div className="flex items-center gap-2">
          <button onClick={begin} disabled={busy}
            className="font-mono text-[12px] px-3.5 py-2 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>
            Yeniden kur (yeni QR)
          </button>
          <button onClick={remove} disabled={busy}
            className="font-mono text-[12px] px-3.5 py-2 rounded-lg border" style={{ color: '#ff5d5d', borderColor: 'var(--border)' }}>
            Kaldır
          </button>
        </div>
      )}

      {/* ── Telegram onayı ── */}
      <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--surface)' }}>📨</div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Telegram ile onay</p>
            <p className="font-mono text-[11px]" style={{ color: tgConfigured ? '#30D158' : 'var(--fg-3)' }}>
              {tgConfigured === null ? '…' : (tgConfigured ? `● Etkin${tgChatId ? ` · chat ${tgChatId}` : ''}` : '○ Kurulu değil')}
            </p>
          </div>
        </div>

        {tgConfigured ? (
          <>
            <p className="body-sm mb-4" style={{ color: 'var(--fg-3)' }}>
              Girişte &quot;Telegram&quot; butonuna basınca botuna onay/ret mesajı gelir. Chrome bildirim iznine takılmaz.
            </p>
            <button onClick={tgDisable} disabled={tgBusy}
              className="font-mono text-[12px] px-3.5 py-2 rounded-lg border" style={{ color: '#ff5d5d', borderColor: 'var(--border)' }}>
              Telegram&apos;ı kaldır
            </button>
          </>
        ) : (
          <>
            <p className="body-sm mb-3" style={{ color: 'var(--fg-3)' }}>
              1) Telegram&apos;da <b style={{ color: 'var(--fg-2)' }}>@BotFather</b>&apos;a <code>/newbot</code> yazıp bot oluştur, sana verdiği
              <b style={{ color: 'var(--fg-2)' }}> token</b>&apos;ı aşağıya yapıştır. 2) Botuna Telegram&apos;dan <code>/start</code> (ya da herhangi bir mesaj) gönder.
              3) &quot;Chat ID&apos;mi bul&quot;a bas, sonra &quot;Etkinleştir&quot;.
            </p>
            <input value={tgToken} onChange={e => setTgToken(e.target.value)} placeholder="Bot token (123456:ABC-...)"
              className="input mb-2" autoComplete="off" />
            <div className="flex gap-2 mb-3">
              <input value={tgChatInput} onChange={e => setTgChatInput(e.target.value)} placeholder="Chat ID"
                className="input tabular-nums" inputMode="numeric" />
              <button onClick={tgDiscover} disabled={tgBusy || !tgToken.trim()}
                className="flex-shrink-0 font-mono text-[12px] px-3.5 py-2 rounded-lg border disabled:opacity-50"
                style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>Chat ID&apos;mi bul</button>
            </div>
            <button onClick={tgActivate} disabled={tgBusy || !tgToken.trim() || !tgChatInput.trim()}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {tgBusy ? 'İşleniyor…' : 'Etkinleştir'}
            </button>
            <p className="font-mono text-[10px] mt-3" style={{ color: 'var(--fg-3)' }}>
              Not: Webhook için canlı (HTTPS) site gerekir; localhost&apos;ta etkinleştirilemez.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Donanım (/skills) içerik editörü ──
function SkillsPanel({ notify, onAuthError }: { notify: (m: string, t?: 'ok' | 'err') => void; onAuthError: () => void }) {
  const [content, setContent] = useState<SkillsContent | null>(null);
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/skills', { cache: 'no-store' });
      if (res.status === 401) return onAuthError();
      const d = await res.json().catch(() => ({}));
      if (d.content) setContent(d.content);
    })();
  }, [onAuthError]);

  // Aktif dilin içeriğini kısmen günceller.
  function patchLang(patch: Partial<SkillsLang>) {
    setContent(c => c && ({ ...c, [lang]: { ...c[lang], ...patch } }));
  }

  async function save() {
    if (!content || saving) return;
    setSaving(true);
    const res = await fetch('/api/admin/skills', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content),
    });
    setSaving(false);
    if (res.status === 401) return onAuthError();
    if (res.ok) notify('Donanım içeriği güncellendi.');
    else { const d = await res.json().catch(() => ({})); notify(d.error || 'Kaydedilemedi.', 'err'); }
  }

  if (!content) return <Loader route="/api/admin/skills" className="py-16" />;
  const c = content[lang];

  // ── responsibilities (üstlendiklerim) yardımcıları ──
  const setResp = (rs: SkillsLang['responsibilities']) => patchLang({ responsibilities: rs });
  const updateResp = (i: number, p: Partial<SkillsLang['responsibilities'][number]>) =>
    setResp(c.responsibilities.map((r, idx) => idx === i ? { ...r, ...p } : r));

  // ── techCards (alanlara göre) yardımcıları ──
  const setCards = (cards: SkillsLang['techCards']) => patchLang({ techCards: cards });
  const updateCard = (i: number, p: Partial<SkillsLang['techCards'][number]>) =>
    setCards(c.techCards.map((card, idx) => idx === i ? { ...card, ...p } : card));
  const updateLib = (ci: number, li: number, p: Partial<SkillsLang['techCards'][number]['libs'][number]>) =>
    updateCard(ci, { libs: c.techCards[ci].libs.map((lib, idx) => idx === li ? { ...lib, ...p } : lib) });

  return (
    <div className="space-y-6">
      {/* Dil seçimi + kaydet */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
          {(['tr', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="font-mono text-[11px] px-3 py-1.5 rounded-md uppercase transition-colors"
              style={lang === l ? { background: 'var(--bg-card)', color: 'var(--fg)' } : { color: 'var(--fg-3)' }}>{l}</button>
          ))}
        </div>
        <button onClick={save} disabled={saving}
          className="px-4 py-2 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff' }}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
      </div>

      {/* Başlık & açıklama */}
      <div className="space-y-4 p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <Field label="Sayfa başlığı"><input value={c.pageTitle} onChange={e => patchLang({ pageTitle: e.target.value })} className="input" /></Field>
        <Field label="Açıklama"><textarea value={c.pageDesc} onChange={e => patchLang({ pageDesc: e.target.value })} rows={2} className="input" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Üstlendiklerim başlığı"><input value={c.sectionMarquee} onChange={e => patchLang({ sectionMarquee: e.target.value })} className="input" /></Field>
          <Field label="Alanlara göre başlığı"><input value={c.sectionStack} onChange={e => patchLang({ sectionStack: e.target.value })} className="input" /></Field>
        </div>
      </div>

      {/* Üstlendiklerim (responsibilities) */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--fg-3)' }}>Üstlendiklerim</p>
        <div className="space-y-3">
          {c.responsibilities.map((r, i) => (
            <div key={i} className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <input value={r.icon} onChange={e => updateResp(i, { icon: e.target.value })} placeholder="API" className="input" style={{ width: 80 }} />
                <input value={r.title} onChange={e => updateResp(i, { title: e.target.value })} placeholder="Başlık" className="input" />
                <button type="button" onClick={() => setResp(c.responsibilities.filter((_, idx) => idx !== i))}
                  className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
              </div>
              <input value={r.tags.join(', ')} onChange={e => updateResp(i, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="Etiketler (virgülle ayır)" className="input" />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setResp([...c.responsibilities, { icon: '', title: '', tags: [] }])}
          className="mt-3 font-mono text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ Üstlenilen ekle</button>
      </div>

      {/* Alanlara göre (techCards) */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--fg-3)' }}>Alanlara göre</p>
        <div className="space-y-3">
          {c.techCards.map((card, ci) => (
            <div key={ci} className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <input value={card.title} onChange={e => updateCard(ci, { title: e.target.value })} placeholder="Kart başlığı (örn. Python)" className="input" />
                <button type="button" onClick={() => setCards(c.techCards.filter((_, idx) => idx !== ci))}
                  className={miniBtn} style={{ color: '#ff5d5d' }} title="Kartı sil">✕</button>
              </div>
              <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid var(--border)' }}>
                {card.libs.map((lib, li) => (
                  <div key={li} className="flex items-center gap-2">
                    <input value={lib.name} onChange={e => updateLib(ci, li, { name: e.target.value })} placeholder="Ad" className="input" style={{ maxWidth: 160 }} />
                    <input value={lib.sub.join(', ')} onChange={e => updateLib(ci, li, { sub: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="Alt etiketler (virgülle)" className="input" />
                    <button type="button" onClick={() => updateCard(ci, { libs: card.libs.filter((_, idx) => idx !== li) })}
                      className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => updateCard(ci, { libs: [...card.libs, { name: '', sub: [] }] })}
                  className="font-mono text-[11px] px-2.5 py-1 rounded-lg border" style={{ color: 'var(--fg-3)', borderColor: 'var(--border)' }}>+ Satır</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setCards([...c.techCards, { title: '', libs: [] }])}
          className="mt-3 font-mono text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ Kart ekle</button>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={save} disabled={saving}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff' }}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
      </div>
    </div>
  );
}

// ── Sayfa içerik editörü (home / experience / contact / projects) ──
type Up = <T>(mut: (o: T) => void) => void;

function PagesPanel({ page, notify, onAuthError }: { page: PageKey; notify: (m: string, t?: 'ok' | 'err') => void; onAuthError: () => void }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/site-content', { cache: 'no-store' });
      if (res.status === 401) return onAuthError();
      const d = await res.json().catch(() => ({}));
      if (d.content) setContent(d.content);
    })();
  }, [onAuthError]);

  const up: Up = (mut) => setContent(c => {
    if (!c) return c;
    const next = structuredClone(c);
    mut((next[page] as Record<'tr' | 'en', unknown>)[lang] as never);
    return next;
  });

  // Dilden bağımsız alanlar (örn. proje repoları) için her iki dile yaz.
  const upBoth: Up = (mut) => setContent(c => {
    if (!c) return c;
    const next = structuredClone(c);
    const slice = next[page] as Record<'tr' | 'en', unknown>;
    mut(slice.tr as never);
    mut(slice.en as never);
    return next;
  });

  async function uploadFile(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.status === 401) { onAuthError(); return null; }
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { notify(d.error || 'Yükleme başarısız.', 'err'); return null; }
      notify('Yüklendi.');
      return d.url as string;
    } catch {
      notify('Yükleme başarısız.', 'err');
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!content || saving) return;
    setSaving(true);
    const res = await fetch('/api/admin/site-content', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, content: content[page] }),
    });
    setSaving(false);
    if (res.status === 401) return onAuthError();
    if (res.ok) notify('Sayfa güncellendi.');
    else { const d = await res.json().catch(() => ({})); notify(d.error || 'Kaydedilemedi.', 'err'); }
  }

  if (!content) return <Loader route="/api/admin/site-content" className="py-16" />;
  const cur = (content[page] as Record<'tr' | 'en', unknown>)[lang];

  const saveBtn = (
    <button onClick={save} disabled={saving}
      className="px-4 py-2 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ background: 'var(--accent)', color: '#fff' }}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
  );

  return (
    <div className="space-y-6">
      {/* Dil + kaydet */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
          {(['tr', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="font-mono text-[11px] px-3 py-1.5 rounded-md uppercase transition-colors"
              style={lang === l ? { background: 'var(--bg-card)', color: 'var(--fg)' } : { color: 'var(--fg-3)' }}>{l}</button>
          ))}
        </div>
        {saveBtn}
      </div>

      {page === 'home'       && <HomeEditor       v={cur as HomeLang} up={up} />}
      {page === 'experience' && <ExperienceEditor v={cur as ExperienceLang} up={up} upload={uploadFile} uploading={uploading} />}
      {page === 'contact'    && <ContactEditor    v={cur as ContactLang} up={up} />}
      {page === 'projects'   && <ProjectsEditor   v={cur as ProjectsLang} up={up} upBoth={upBoth} />}

      <div className="flex justify-end pt-1">{saveBtn}</div>
    </div>
  );
}

const card = 'space-y-4 p-4 rounded-xl border';
const cardStyle = { background: 'var(--bg-card)', borderColor: 'var(--border)' } as const;
const sectionLabel = 'font-mono text-[11px] uppercase tracking-wide mb-3';

function ProjectsEditor({ v, up, upBoth }: { v: ProjectsLang; up: Up; upBoth: Up }) {
  return (
    <div className="space-y-4">
      <div className={card} style={cardStyle}>
        <Field label="Başlık"><input value={v.pageTitle} onChange={e => up<ProjectsLang>(o => { o.pageTitle = e.target.value; })} className="input" /></Field>
        <Field label="Açıklama"><textarea value={v.pageDesc} onChange={e => up<ProjectsLang>(o => { o.pageDesc = e.target.value; })} rows={2} className="input" /></Field>
      </div>
      <div className={card} style={cardStyle}>
        <Field label="Gösterilecek repolar — her satır bir tane (kullanıcı/repo). Boş bırakırsan en son 30 repo otomatik gelir.">
          <textarea value={v.repos.join('\n')} rows={6} placeholder={'OmerFaruk-YILDIZ/omr\nOmerFaruk-YILDIZ/portfolio'}
            onChange={e => upBoth<ProjectsLang>(o => { o.repos = e.target.value.split('\n'); })}
            className="input" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }} />
        </Field>
        <p className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>Tam GitHub linki de yapıştırabilirsin; otomatik kullanıcı/repo biçimine indirilir. Bu liste her iki dilde ortaktır.</p>
      </div>
    </div>
  );
}

function HomeEditor({ v, up }: { v: HomeLang; up: Up }) {
  const set = (k: keyof HomeLang) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    up<HomeLang>(o => { (o[k] as string) = e.target.value; });
  return (
    <div className="space-y-4">
      <div className={card} style={cardStyle}>
        <Field label="Rol"><input value={v.role} onChange={set('role')} className="input" /></Field>
        <Field label="Durum (status)"><input value={v.status} onChange={set('status')} className="input" /></Field>
        <Field label="Alt başlık"><textarea value={v.subtitle} onChange={set('subtitle')} rows={2} className="input" /></Field>
        <Field label="Alt başlık — vurgulu kısım"><input value={v.subtitleAccent} onChange={set('subtitleAccent')} className="input" /></Field>
        <Field label="Rotalar bölüm etiketi"><input value={v.sectionRoutes} onChange={set('sectionRoutes')} className="input" /></Field>
        <Field label="Etiketler (virgülle ayır)">
          <input value={v.tags.join(', ')} onChange={e => up<HomeLang>(o => { o.tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean); })} className="input" />
        </Field>
      </div>
      <div className={card} style={cardStyle}>
        <p className={sectionLabel} style={{ color: 'var(--fg-3)' }}>Endpoint açıklamaları</p>
        {(['experience', 'skills', 'projects', 'feed', 'contact'] as const).map(k => (
          <Field key={k} label={`/${k}`}>
            <input value={v.endpoints[k]} onChange={e => up<HomeLang>(o => { o.endpoints[k] = e.target.value; })} className="input" />
          </Field>
        ))}
      </div>
    </div>
  );
}

function ContactEditor({ v, up }: { v: ContactLang; up: Up }) {
  const textFields: [keyof ContactLang, string, boolean?][] = [
    ['pageTitle', 'Başlık'], ['pageDesc', 'Açıklama', true],
    ['formName', 'Form — İsim etiketi'], ['formNamePh', 'Form — İsim ipucu'],
    ['formEmail', 'Form — E-posta etiketi'], ['formEmailPh', 'Form — E-posta ipucu'],
    ['formMessage', 'Form — Mesaj etiketi'], ['formMessagePh', 'Form — Mesaj ipucu'],
    ['formReply', 'Yanıt notu'], ['formSend', 'Gönder butonu'], ['formSending', 'Gönderiliyor metni'],
    ['directLabel', 'Bağlantılar başlığı'], ['successTitle', 'Başarı başlığı'], ['successAnother', 'Yeni mesaj metni'],
  ];
  return (
    <div className="space-y-4">
      <div className={card} style={cardStyle}>
        {textFields.map(([k, label, multi]) => (
          <Field key={k} label={label}>
            {multi
              ? <textarea value={v[k] as string} onChange={e => up<ContactLang>(o => { (o[k] as string) = e.target.value; })} rows={2} className="input" />
              : <input value={v[k] as string} onChange={e => up<ContactLang>(o => { (o[k] as string) = e.target.value; })} className="input" />}
          </Field>
        ))}
      </div>
      <div>
        <p className={sectionLabel} style={{ color: 'var(--fg-3)' }}>Sosyal bağlantılar — etiket ikonu belirler (GitHub / LinkedIn / Email)</p>
        <div className="space-y-3">
          {v.links.map((lk, i) => (
            <div key={i} className="p-4 rounded-xl border space-y-2" style={cardStyle}>
              <div className="flex items-center gap-2">
                <input value={lk.label} placeholder="Etiket" onChange={e => up<ContactLang>(o => { o.links[i].label = e.target.value; })} className="input" style={{ maxWidth: 150 }} />
                <input value={lk.handle} placeholder="Görünen ad / kullanıcı" onChange={e => up<ContactLang>(o => { o.links[i].handle = e.target.value; })} className="input" />
                <button type="button" onClick={() => up<ContactLang>(o => { o.links.splice(i, 1); })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
              </div>
              <input value={lk.href} placeholder="https://… veya mailto:…" onChange={e => up<ContactLang>(o => { o.links[i].href = e.target.value; })} className="input" />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => up<ContactLang>(o => { o.links.push({ label: '', handle: '', href: '' }); })}
          className="mt-3 font-mono text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ Bağlantı ekle</button>
      </div>
    </div>
  );
}

function ExperienceEditor({ v, up, upload, uploading }: { v: ExperienceLang; up: Up; upload: (f: File) => Promise<string | null>; uploading: boolean }) {
  return (
    <div className="space-y-5">
      <div className={card} style={cardStyle}>
        <Field label="Başlık"><input value={v.pageTitle} onChange={e => up<ExperienceLang>(o => { o.pageTitle = e.target.value; })} className="input" /></Field>
        <Field label="Açıklama"><textarea value={v.pageDesc} onChange={e => up<ExperienceLang>(o => { o.pageDesc = e.target.value; })} rows={2} className="input" /></Field>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="İş etiketi"><input value={v.sectionWork} onChange={e => up<ExperienceLang>(o => { o.sectionWork = e.target.value; })} className="input" /></Field>
          <Field label="Eğitim etiketi"><input value={v.sectionEdu} onChange={e => up<ExperienceLang>(o => { o.sectionEdu = e.target.value; })} className="input" /></Field>
          <Field label="Referans etiketi"><input value={v.sectionRef} onChange={e => up<ExperienceLang>(o => { o.sectionRef = e.target.value; })} className="input" /></Field>
          <Field label="Sertifika etiketi"><input value={v.sectionCert} onChange={e => up<ExperienceLang>(o => { o.sectionCert = e.target.value; })} className="input" /></Field>
        </div>
      </div>

      {/* İş deneyimi */}
      <div>
        <p className={sectionLabel} style={{ color: 'var(--fg-3)' }}>İş deneyimi</p>
        <div className="space-y-3">
          {v.experience.map((job, i) => (
            <div key={i} className="p-4 rounded-xl border space-y-2" style={cardStyle}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>#{i + 1}</span>
                <button type="button" onClick={() => up<ExperienceLang>(o => { o.experience.splice(i, 1); })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={job.company} placeholder="Şirket" onChange={e => up<ExperienceLang>(o => { o.experience[i].company = e.target.value; })} className="input" />
                <input value={job.role} placeholder="Rol" onChange={e => up<ExperienceLang>(o => { o.experience[i].role = e.target.value; })} className="input" />
                <input value={job.period} placeholder="Dönem" onChange={e => up<ExperienceLang>(o => { o.experience[i].period = e.target.value; })} className="input" />
                <input value={job.location} placeholder="Konum" onChange={e => up<ExperienceLang>(o => { o.experience[i].location = e.target.value; })} className="input" />
                <input value={job.type} placeholder="Tip (Tam Zamanlı…)" onChange={e => up<ExperienceLang>(o => { o.experience[i].type = e.target.value; })} className="input" />
              </div>
              <textarea value={job.desc} placeholder="Açıklama" rows={2} onChange={e => up<ExperienceLang>(o => { o.experience[i].desc = e.target.value; })} className="input" />
              <textarea value={job.highlights.join('\n')} placeholder="Maddeler — her satır bir madde" rows={4}
                onChange={e => up<ExperienceLang>(o => { o.experience[i].highlights = e.target.value.split('\n'); })} className="input" />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => up<ExperienceLang>(o => { o.experience.push({ company: '', role: '', period: '', location: '', desc: '', type: '', highlights: [] }); })}
          className="mt-3 font-mono text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ İş ekle</button>
      </div>

      {/* Eğitim */}
      <div>
        <p className={sectionLabel} style={{ color: 'var(--fg-3)' }}>Eğitim</p>
        <div className="space-y-3">
          {v.education.map((edu, ei) => (
            <div key={ei} className="p-4 rounded-xl border space-y-2" style={cardStyle}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>#{ei + 1}</span>
                <button type="button" onClick={() => up<ExperienceLang>(o => { o.education.splice(ei, 1); })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={edu.school} placeholder="Okul" onChange={e => up<ExperienceLang>(o => { o.education[ei].school = e.target.value; })} className="input" />
                <input value={edu.dept} placeholder="Bölüm" onChange={e => up<ExperienceLang>(o => { o.education[ei].dept = e.target.value; })} className="input" />
                <input value={edu.degree} placeholder="Derece" onChange={e => up<ExperienceLang>(o => { o.education[ei].degree = e.target.value; })} className="input" />
                <input value={edu.period} placeholder="Dönem" onChange={e => up<ExperienceLang>(o => { o.education[ei].period = e.target.value; })} className="input" />
              </div>
              <div className="pl-3 space-y-2" style={{ borderLeft: '2px solid var(--border)' }}>
                <p className="font-mono text-[10px] uppercase" style={{ color: 'var(--fg-3)' }}>Konular</p>
                {edu.topics.map((tp, ti) => (
                  <div key={ti} className="flex items-center gap-2">
                    <input value={tp.label} placeholder="Başlık" onChange={e => up<ExperienceLang>(o => { o.education[ei].topics[ti].label = e.target.value; })} className="input" style={{ maxWidth: 160 }} />
                    <input value={tp.items.join(', ')} placeholder="öğeler (virgülle)" onChange={e => up<ExperienceLang>(o => { o.education[ei].topics[ti].items = e.target.value.split(',').map(s => s.trim()).filter(Boolean); })} className="input" />
                    <button type="button" onClick={() => up<ExperienceLang>(o => { o.education[ei].topics.splice(ti, 1); })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => up<ExperienceLang>(o => { o.education[ei].topics.push({ label: '', items: [] }); })}
                  className="font-mono text-[11px] px-2.5 py-1 rounded-lg border" style={{ color: 'var(--fg-3)', borderColor: 'var(--border)' }}>+ Konu</button>
              </div>
              {/* Diploma + okul logosu */}
              <div className="flex gap-2">
                <input value={edu.diploma} placeholder="Diploma adresi (PDF/görsel)" onChange={e => up<ExperienceLang>(o => { o.education[ei].diploma = e.target.value; })} className="input" />
                <UploadButton uploading={uploading} label="Belge"
                  onPick={async f => { const url = await upload(f); if (url) up<ExperienceLang>(o => { o.education[ei].diploma = url; }); }} />
                {edu.diploma && <button type="button" onClick={() => up<ExperienceLang>(o => { o.education[ei].diploma = ''; })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Kaldır">✕</button>}
              </div>
              <div className="flex gap-2">
                <input value={edu.logo} placeholder="Okul logosu adresi (opsiyonel)" onChange={e => up<ExperienceLang>(o => { o.education[ei].logo = e.target.value; })} className="input" />
                <UploadButton uploading={uploading} label="Logo"
                  onPick={async f => { const url = await upload(f); if (url) up<ExperienceLang>(o => { o.education[ei].logo = url; }); }} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => up<ExperienceLang>(o => { o.education.push({ school: '', dept: '', degree: '', period: '', topics: [], diploma: '', logo: '' }); })}
          className="mt-3 font-mono text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ Eğitim ekle</button>
      </div>

      {/* Referanslar */}
      <div>
        <p className={sectionLabel} style={{ color: 'var(--fg-3)' }}>Referanslar</p>
        <div className="space-y-3">
          {v.references.map((rf, i) => (
            <div key={i} className="p-4 rounded-xl border space-y-2" style={cardStyle}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>#{i + 1}</span>
                <button type="button" onClick={() => up<ExperienceLang>(o => { o.references.splice(i, 1); })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={rf.name} placeholder="İsim" onChange={e => up<ExperienceLang>(o => { o.references[i].name = e.target.value; })} className="input" />
                <input value={rf.title} placeholder="Ünvan" onChange={e => up<ExperienceLang>(o => { o.references[i].title = e.target.value; })} className="input" />
                <input value={rf.company} placeholder="Kurum" onChange={e => up<ExperienceLang>(o => { o.references[i].company = e.target.value; })} className="input" />
                <input value={rf.relation} placeholder="İlişki (Akademik Referans…)" onChange={e => up<ExperienceLang>(o => { o.references[i].relation = e.target.value; })} className="input" />
                <input value={rf.contact} placeholder="İletişim (e-posta)" onChange={e => up<ExperienceLang>(o => { o.references[i].contact = e.target.value; })} className="input" />
              </div>
              <input value={rf.linkedin} placeholder="LinkedIn adresi (opsiyonel)" onChange={e => up<ExperienceLang>(o => { o.references[i].linkedin = e.target.value; })} className="input" />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => up<ExperienceLang>(o => { o.references.push({ name: '', title: '', company: '', relation: '', contact: '', linkedin: '' }); })}
          className="mt-3 font-mono text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ Referans ekle</button>
      </div>

      {/* Sertifikalar */}
      <div>
        <p className={sectionLabel} style={{ color: 'var(--fg-3)' }}>Sertifikalar</p>
        <div className="space-y-3">
          {v.certifications.map((cz, i) => (
            <div key={i} className="p-4 rounded-xl border space-y-2" style={cardStyle}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>#{i + 1}</span>
                <button type="button" onClick={() => up<ExperienceLang>(o => { o.certifications.splice(i, 1); })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Sil">✕</button>
              </div>
              <input value={cz.name} placeholder="Sertifika adı" onChange={e => up<ExperienceLang>(o => { o.certifications[i].name = e.target.value; })} className="input" />
              <div className="grid grid-cols-2 gap-2">
                <input value={cz.issuer} placeholder="Kurum" onChange={e => up<ExperienceLang>(o => { o.certifications[i].issuer = e.target.value; })} className="input" />
                <input value={cz.date} placeholder="Tarih (Eyl 2025)" onChange={e => up<ExperienceLang>(o => { o.certifications[i].date = e.target.value; })} className="input" />
              </div>
              <input value={cz.url} placeholder="Doğrulama linki (opsiyonel)" onChange={e => up<ExperienceLang>(o => { o.certifications[i].url = e.target.value; })} className="input" />
              <div className="flex gap-2">
                <input value={cz.image} placeholder="Belge görseli adresi (linki yoksa)" onChange={e => up<ExperienceLang>(o => { o.certifications[i].image = e.target.value; })} className="input" />
                <UploadButton uploading={uploading} label="Belge"
                  onPick={async f => { const url = await upload(f); if (url) up<ExperienceLang>(o => { o.certifications[i].image = url; }); }} />
                {cz.image && <button type="button" onClick={() => up<ExperienceLang>(o => { o.certifications[i].image = ''; })} className={miniBtn} style={{ color: '#ff5d5d' }} title="Kaldır">✕</button>}
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => up<ExperienceLang>(o => { o.certifications.push({ name: '', issuer: '', date: '', url: '', image: '' }); })}
          className="mt-3 font-mono text-[11px] px-3 py-1.5 rounded-lg border" style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>+ Sertifika ekle</button>
      </div>
    </div>
  );
}

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
