'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { LogsProfileContent } from '@/lib/logs-profile';
import type { LogStoryDTO } from '@/lib/log-stories';
import Loader from '@/components/Loader';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>{label}</span>
      {children}
    </label>
  );
}

const EMPTY_PROFILE: LogsProfileContent = {
  avatarUrl: '', username: '', displayName: '', instagramUrl: '',
  followerCount: 0, followingCount: 0,
  bio: { tr: '', en: '' },
};

type SubTab = 'profile' | 'stories';

export default function LogsProfilePanel({ notify, onAuthError }: { notify: (m: string, t?: 'ok' | 'err') => void; onAuthError: () => void }) {
  const [sub, setSub] = useState<SubTab>('profile');
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--surface)' }}>
        {(['profile', 'stories'] as SubTab[]).map(t => (
          <button key={t} onClick={() => setSub(t)}
            className="font-mono text-[11px] px-3.5 py-1.5 rounded-md transition-colors"
            style={sub === t ? { background: 'var(--bg-card)', color: 'var(--fg)' } : { color: 'var(--fg-3)' }}>
            {t === 'profile' ? 'Profil' : 'Hikayeler'}
          </button>
        ))}
      </div>
      {sub === 'profile'
        ? <ProfileForm notify={notify} onAuthError={onAuthError} />
        : <StoriesPanel notify={notify} onAuthError={onAuthError} />}
    </div>
  );
}

function ProfileForm({ notify, onAuthError }: { notify: (m: string, t?: 'ok' | 'err') => void; onAuthError: () => void }) {
  const [profile, setProfile] = useState<LogsProfileContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/logs-profile', { cache: 'no-store' });
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    setProfile(d.profile ?? EMPTY_PROFILE);
  }, [onAuthError]);

  useEffect(() => { (async () => { await load(); })(); }, [load]);

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    setUploading(false);
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.url) {
      setProfile(p => p ? { ...p, avatarUrl: d.url } : p);
    } else {
      setError(d.error || 'Yükleme başarısız.');
    }
  }

  async function save() {
    if (!profile || saving) return;
    setSaving(true); setError('');
    const res = await fetch('/api/admin/logs-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    if (res.status === 401) return onAuthError();
    if (res.ok) notify('Profil güncellendi.');
    else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Kaydedilemedi.');
    }
  }

  if (!profile) return <Loader route="/api/admin/logs-profile" className="py-16" />;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-3xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {profile.avatarUrl
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            : '📓'}
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="font-mono text-[11px] px-3 py-1.5 rounded-lg border disabled:opacity-50"
            style={{ color: 'var(--fg-2)', borderColor: 'var(--border)' }}>
            {uploading ? 'Yükleniyor…' : 'Fotoğraf yükle'}
          </button>
          {profile.avatarUrl && (
            <button type="button" onClick={() => setProfile(p => p ? { ...p, avatarUrl: '' } : p)}
              className="font-mono text-[11px] px-3 py-1.5 rounded-lg ml-2" style={{ color: '#ff5d5d' }}>Kaldır</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Kullanıcı adı (@ olmadan)">
          <input value={profile.username} onChange={e => setProfile(p => p ? { ...p, username: e.target.value } : p)}
            placeholder="dev.omer.logs" className="input" />
        </Field>
        <Field label="Ad Soyad">
          <input value={profile.displayName} onChange={e => setProfile(p => p ? { ...p, displayName: e.target.value } : p)}
            placeholder="Ömer Faruk YILDIZ" className="input" />
        </Field>
      </div>

      <Field label="Instagram linki">
        <input value={profile.instagramUrl} onChange={e => setProfile(p => p ? { ...p, instagramUrl: e.target.value } : p)}
          placeholder="https://instagram.com/dev.omer.logs" className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Takipçi sayısı (statik, gösterim amaçlı)">
          <input type="number" min={0} value={profile.followerCount}
            onChange={e => setProfile(p => p ? { ...p, followerCount: Math.max(0, Number(e.target.value) || 0) } : p)}
            className="input" />
        </Field>
        <Field label="Takip sayısı (statik, gösterim amaçlı)">
          <input type="number" min={0} value={profile.followingCount}
            onChange={e => setProfile(p => p ? { ...p, followingCount: Math.max(0, Number(e.target.value) || 0) } : p)}
            className="input" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Field label="Bio (TR)">
          <textarea value={profile.bio.tr} onChange={e => setProfile(p => p ? { ...p, bio: { ...p.bio, tr: e.target.value } } : p)}
            rows={3} className="input" />
        </Field>
        <Field label="Bio (EN)">
          <textarea value={profile.bio.en} onChange={e => setProfile(p => p ? { ...p, bio: { ...p.bio, en: e.target.value } } : p)}
            rows={3} className="input" />
        </Field>
      </div>

      {error && <p className="body-sm" style={{ color: '#ff5d5d' }}>{error}</p>}
      <button onClick={save} disabled={saving}
        className="px-4 py-2 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: 'var(--accent)', color: '#fff' }}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
    </div>
  );
}

function StoriesPanel({ notify, onAuthError }: { notify: (m: string, t?: 'ok' | 'err') => void; onAuthError: () => void }) {
  const [stories, setStories] = useState<LogStoryDTO[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [expiry, setExpiry] = useState<'24h' | 'forever'>('24h');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/log-stories', { cache: 'no-store' });
    if (res.status === 401) return onAuthError();
    const d = await res.json().catch(() => ({}));
    setStories(d.stories ?? []);
  }, [onAuthError]);

  useEffect(() => { (async () => { await load(); })(); }, [load]);

  async function addStory(file: File) {
    setUploading(true); setError('');
    const form = new FormData();
    form.append('file', file);
    const upRes = await fetch('/api/admin/upload', { method: 'POST', body: form });
    if (upRes.status === 401) { setUploading(false); return onAuthError(); }
    const upD = await upRes.json().catch(() => ({}));
    if (!upRes.ok || !upD.url) {
      setUploading(false);
      setError(upD.error || 'Yükleme başarısız.');
      return;
    }
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    const res = await fetch('/api/admin/log-stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaUrl: upD.url,
        mediaType,
        caption: caption.trim() || undefined,
        expiresAt: expiry === '24h' ? '+24h' : 'null',
      }),
    });
    setUploading(false);
    if (res.status === 401) return onAuthError();
    if (res.ok) {
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      await load();
      notify('Hikaye eklendi.');
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Kaydedilemedi.');
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/log-stories/${id}`, { method: 'DELETE' });
    if (res.status === 401) return onAuthError();
    if (res.ok) { await load(); notify('Hikaye silindi.'); }
    else notify('Silinemedi.', 'err');
  }

  if (!stories) return <Loader route="/api/admin/log-stories" className="py-16" />;

  return (
    <div className="space-y-5 max-w-xl">
      <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="font-mono text-[11px] uppercase tracking-wide" style={{ color: 'var(--fg-3)' }}>Yeni hikaye ekle</p>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="input"
          onChange={e => { const f = e.target.files?.[0]; if (f) addStory(f); }} disabled={uploading} />
        <Field label="Başlık / not (opsiyonel)">
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="kısa not…" className="input" />
        </Field>
        <div className="flex items-center gap-4 font-mono text-[12px]" style={{ color: 'var(--fg-2)' }}>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={expiry === '24h'} onChange={() => setExpiry('24h')} /> 24 saat sonra kaybolsun
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={expiry === 'forever'} onChange={() => setExpiry('forever')} /> kalıcı kalsın
          </label>
        </div>
        {uploading && <p className="body-sm" style={{ color: 'var(--fg-3)' }}>Yükleniyor…</p>}
        {error && <p className="body-sm" style={{ color: '#ff5d5d' }}>{error}</p>}
      </div>

      {stories.length === 0 ? (
        <p className="body-sm" style={{ color: 'var(--fg-3)' }}>Henüz hikaye yok.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stories.map(s => (
            <div key={s.id} className="relative rounded-xl overflow-hidden border aspect-[9/16]"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              {s.mediaType === 'video'
                ? <video src={s.mediaUrl} className="w-full h-full object-cover" muted />
                /* eslint-disable-next-line @next/next/no-img-element */
                : <img src={s.mediaUrl} alt="" className="w-full h-full object-cover" />}
              <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{
                  color: '#fff',
                  background: s.expired ? '#ff5d5d' : s.expiresAt ? '#E8703B' : '#30D158',
                }}>
                  {s.expired ? 'süresi doldu' : s.expiresAt ? '24s' : 'kalıcı'}
                </span>
                <button onClick={() => remove(s.id)} className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: '#fff', background: 'rgba(0,0,0,0.5)' }}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
