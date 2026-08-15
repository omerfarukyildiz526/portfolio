'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post, ContentBlock } from '@/lib/posts';
import { MD } from '@/components/Markdown';
import Loader from '@/components/Loader';
import Code from '@/components/Code';

function Block({ block, index }: { block: ContentBlock; index: number }) {
  const delay = 0.3 + index * 0.04;

  const wrap = (children: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );

  // Uzun-okuma tipografisi: serif gövde (Newsreader), rahat satır uzunluğu
  // ve line-height — grid'in kompakt IG hissinden bilinçli olarak ayrışır.
  switch (block.type) {
    case 'h2': return wrap(<h2 className="logs-display text-[26px] md:text-[30px] font-semibold mt-12 mb-5" style={{ color: 'var(--fg)' }}>{block.text}</h2>);
    case 'h3': return wrap(<h3 className="logs-display text-[19px] font-semibold mt-9 mb-3.5" style={{ color: 'var(--fg)' }}>{block.text}</h3>);
    case 'p':  return wrap(<p className="text-[18px] leading-[1.8] mb-5" style={{ color: 'var(--fg-2)' }}><MD>{block.text ?? ''}</MD></p>);
    case 'code': return wrap(
      <div className="code-block my-6">
        <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="logs-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{block.lang || 'code'}</span>
        </div>
        <pre className="overflow-x-auto p-5" style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 13, lineHeight: 1.65, color: 'var(--fg-2)' }}>
          <Code>{block.text ?? ''}</Code>
        </pre>
      </div>
    );
    case 'list': return wrap(
      <ul className="mb-5 space-y-3 pl-0">
        {block.items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[18px] leading-[1.7]" style={{ color: 'var(--fg-2)' }}>
            <span className="mt-3 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />{item}
          </li>
        ))}
      </ul>
    );
    case 'note': return wrap(
      <div className="my-6 p-5 rounded-xl text-[16px] leading-[1.7]"
        style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)', borderLeft: '3px solid var(--accent)', color: 'var(--fg-2)' }}>
        <span className="logs-mono text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--accent)' }}>Note</span>
        <MD>{block.text ?? ''}</MD>
      </div>
    );
    case 'quote': return wrap(
      <blockquote className="my-7 pl-5 text-[21px] leading-[1.6] italic" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--fg)' }}><MD>{block.text ?? ''}</MD></blockquote>
    );
    case 'image': return wrap(
      <figure className="my-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.url} alt={block.text || ''} className="w-full rounded-xl" style={{ border: '1px solid var(--border)' }} />
        {block.text && <figcaption className="text-[13px] text-center mt-2.5" style={{ color: 'var(--fg-3)' }}>{block.text}</figcaption>}
      </figure>
    );
    case 'divider': return wrap(
      <hr className="my-9" style={{ border: 0, borderTop: '1px solid var(--border)' }} />
    );
    default: return null;
  }
}

export default function LogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch(`/api/posts/${slug}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setPost(d?.post ?? null))
      .catch(() => setPost(null));
  }, [slug]);

  useEffect(() => {
    fetch('/api/posts', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setAllPosts(d.posts ?? []))
      .catch(() => setAllPosts([]));
  }, []);

  // Görüntülenmeyi say — aynı tarayıcıda günde en fazla bir kez.
  useEffect(() => {
    if (!slug) return;
    const key = `viewed:${slug}:${new Date().toISOString().slice(0, 10)}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch { /* gizli mod vb. */ }
    fetch('/api/views', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  // Okunan yazıyla en az bir etiketi paylaşan diğer yazılar (en çok 3);
  // yoksa en yeni 3 yazı.
  const related = useMemo(() => {
    const others = allPosts.filter(p => p.slug !== post?.slug);
    const shared = post ? others.filter(p => p.tags.some(t => post.tags.includes(t))) : [];
    return (shared.length ? shared : others).slice(0, 3);
  }, [post, allPosts]);

  if (post === undefined) {
    return <main className="min-h-screen flex items-center justify-center">
      <Loader route={`/api/logs/${slug}`} />
    </main>;
  }
  if (post === null) notFound();

  return (
    <main className="min-h-screen pt-24 pb-28 px-5 md:px-8">
      <div className="max-w-xl mx-auto">

        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }} className="mb-12">
          <Link
            href="/logs"
            className="inline-flex items-center gap-2 logs-mono text-[11px] transition-opacity hover:opacity-100"
            style={{ color: 'var(--fg-3)', opacity: 0.75 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            /logs
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }} className="mb-12">
          {post.cover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={post.cover} alt="" className="w-full rounded-2xl mb-7"
              style={{ border: '1px solid var(--border)', maxHeight: 380, objectFit: 'cover' }} />
          )}

          {post.instagramUrl && (
            <a href={post.instagramUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 logs-mono text-[11px] font-semibold px-3 py-1.5 rounded-full mb-6 transition-opacity hover:opacity-85"
              style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.02-3.58.07-4.85c.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z"/></svg>
              {'Bu içeriği Instagram\'da da paylaştım →'}
            </a>
          )}

          <div className="w-14 h-14 rounded-2xl mb-7 flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}>
            {post.symbol}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.tags.map(tag => <span key={tag} className="tag tag-accent logs-mono text-[10px]">{tag}</span>)}
          </div>
          <h1 className="logs-display text-[clamp(28px,5vw,42px)] font-bold mb-4" style={{ color: 'var(--fg)' }}>{post.title}</h1>
          <div className="flex items-center gap-2.5 logs-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
            <span>{new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readTime} min</span>
          </div>
          <p className="text-[17px] leading-[1.7] italic mt-5 pl-4 max-w-xl" style={{ color: 'var(--fg-2)', borderLeft: '2px solid var(--border)' }}>
            {post.excerpt}
          </p>
        </motion.div>

        <div className="divider mb-10" />

        <div>{post.content.map((block, i) => <Block key={i} block={block} index={i} />)}</div>

        {related.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-16 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="logs-mono text-[11px] uppercase tracking-wide mb-5" style={{ color: 'var(--fg-3)' }}>
              diğer loglara göz at
            </p>
            <div className="grid grid-cols-3 gap-2">
              {related.map(p => (
                <Link key={p.slug} href={`/logs/${p.slug}`}
                  className="group relative block aspect-square rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border)' }}>
                  {p.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.cover} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl"
                      style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}>{p.symbol}</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: 'linear-gradient(to top, rgba(10,9,8,0.9), transparent)' }}>
                    <span className="logs-display text-[11px] font-semibold leading-tight line-clamp-2 block" style={{ color: '#F3EEE4' }}>{p.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 pt-8 flex items-center justify-between"
          style={{ borderTop: related.length > 0 ? 'none' : '1px solid var(--border)' }}>
          <Link href="/logs" className="inline-flex items-center gap-2 logs-mono text-[11px] transition-opacity hover:opacity-100"
            style={{ color: 'var(--fg-3)', opacity: 0.75 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            tüm loglar
          </Link>
          <span className="logs-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>
            {new Date(post.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
          </span>
        </motion.div>

      </div>
    </main>
  );
}
