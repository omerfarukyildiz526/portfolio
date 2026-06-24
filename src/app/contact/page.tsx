'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/lib/i18n';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

const CONTACT_LINKS = [
  {
    label: 'GitHub',
    handle: 'OmerFaruk-YILDIZ',
    href: 'https://github.com/OmerFaruk-YILDIZ',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
        <path d="M9 18c-4.51 2-5-2-7-2"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    handle: 'omerfaruk-yildiz',
    href: 'https://www.linkedin.com/in/omerfaruk-yildiz/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect width="4" height="12" x="2" y="9"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'Email',
    handle: 'omerfaruk_yildiz@outlook.com',
    href: 'mailto:omerfaruk_yildiz@outlook.com',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
];

export default function ContactPage() {
  const t  = useT();
  const tc = t.contact;

  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '', company: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFormState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setFormState('sent');
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.error || 'Mesaj gönderilemedi.');
        setFormState('error');
      }
    } catch {
      setErrorMsg('Bağlantı hatası, lütfen tekrar dene.');
      setFormState('error');
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <span className="method-post">POST</span>
            <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>{tc.pageRoute}</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--accent-post)', opacity: 0.6 }}>→ 201 Created</span>
          </div>
          <h1 className="display-lg mb-3" style={{ color: 'var(--fg)' }}>{tc.pageTitle}</h1>
          <p className="body-md max-w-lg" style={{ color: 'var(--fg-2)' }}>{tc.pageDesc}</p>
        </motion.div>

        {/* ── Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16"
        >
          <AnimatePresence mode="wait">
            {formState !== 'sent' ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
              >
                {/* Name */}
                <div>
                  <label className="label block mb-2" htmlFor="name" style={{ color: 'var(--fg-3)' }}>
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label block mb-2" htmlFor="email" style={{ color: 'var(--fg-3)' }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="label block mb-2" htmlFor="message" style={{ color: 'var(--fg-3)' }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="input"
                    placeholder="What's on your mind?"
                    rows={5}
                  />
                </div>

                {/* Honeypot — botlar için görünmez tuzak alan */}
                <input
                  type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                />

                {/* Hata mesajı */}
                {formState === 'error' && errorMsg && (
                  <p className="body-sm flex items-center gap-1.5" style={{ color: '#ff5d5d' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <div className="flex items-center justify-between pt-2">
                  <p className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>
                    Replies within 24 hours.
                  </p>

                  <button
                    type="submit"
                    disabled={formState === 'sending' || !form.name || !form.email || !form.message}
                    className="btn-primary"
                  >
                    {formState === 'sending' ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--bg)', borderTopColor: 'transparent' }} />
                        Sending…
                      </>
                    ) : (
                      <>
                        <span className="method-post text-[9px]" style={{ background: 'rgba(255,255,255,0.15)', border: 'none' }}>POST</span>
                        Send message
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14m-7-7 7 7-7 7"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              /* ── 200 OK success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="card p-8 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, #30D158 12%, transparent)', border: '1px solid color-mix(in srgb, #30D158 25%, transparent)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="font-mono text-[11px] font-bold" style={{ color: '#30D158' }}>HTTP/1.1</span>
                  <span className="font-mono text-[22px] font-bold" style={{ color: 'var(--fg)' }}>201</span>
                  <span className="font-mono text-[11px] font-bold" style={{ color: '#30D158' }}>Created</span>
                </div>

                <p className="body-md mb-2" style={{ color: 'var(--fg)' }}>
                  Message received.
                </p>
                <p className="body-sm" style={{ color: 'var(--fg-3)' }}>
                  I'll reply to <span className="font-mono" style={{ color: 'var(--fg-2)' }}>{form.email}</span> within 24 hours.
                </p>

                <button
                  onClick={() => { setFormState('idle'); setErrorMsg(''); setForm({ name: '', email: '', message: '', company: '' }); }}
                  className="mt-6 font-mono text-[11px] transition-opacity hover:opacity-100"
                  style={{ color: 'var(--accent)', opacity: 0.75 }}
                >
                  Send another →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Social links ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="label mb-5">Or reach out directly</p>

          <div className="flex flex-col gap-3">
            {CONTACT_LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                whileTap={{ scale: 0.985 }}
                className="group flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ color: 'var(--fg-3)' }}>{link.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-[14px]" style={{ color: 'var(--fg)' }}>{link.label}</p>
                  <p className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{link.handle}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 flex-shrink-0"
                  style={{ color: 'var(--fg-3)' }}>
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </motion.a>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  );
}
