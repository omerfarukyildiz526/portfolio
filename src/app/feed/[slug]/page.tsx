'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPost, ContentBlock } from '@/lib/posts';

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

  switch (block.type) {
    case 'h2':
      return wrap(
        <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-white mt-10 mb-3">
          {block.text}
        </h2>
      );
    case 'h3':
      return wrap(
        <h3 className="text-base font-bold uppercase tracking-tight text-white/90 mt-7 mb-2">
          {block.text}
        </h3>
      );
    case 'p':
      return wrap(
        <p className="text-sm leading-loose text-white/55 mb-4">
          {block.text}
        </p>
      );
    case 'code':
      return wrap(
        <div
          className="my-5 rounded-lg overflow-hidden border"
          style={{ borderColor: 'rgba(48,54,61,1)', background: '#0d1117' }}
        >
          <div
            className="flex items-center px-4 py-2 border-b"
            style={{ borderColor: 'rgba(48,54,61,1)', background: '#090d12' }}
          >
            <span className="text-[10px] font-mono tracking-widest" style={{ color: '#8b949e' }}>
              {block.lang || 'code'}
            </span>
          </div>
          <pre
            className="overflow-x-auto p-4 text-[12px] leading-relaxed"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)', color: '#e6edf3' }}
          >
            <code>{block.text}</code>
          </pre>
        </div>
      );
    case 'list':
      return wrap(
        <ul className="mb-4 space-y-2 pl-0">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/55">
              <span
                className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: '#4488ff' }}
              />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'note':
      return wrap(
        <div
          className="my-5 p-4 rounded-lg text-sm text-white/60 leading-loose"
          style={{
            background: 'rgba(68,136,255,0.05)',
            border: '1px solid rgba(68,136,255,0.15)',
            borderLeft: '3px solid rgba(68,136,255,0.5)',
          }}
        >
          <span
            className="text-[9px] font-mono font-bold uppercase tracking-widest block mb-2"
            style={{ color: '#4488ff' }}
          >
            Not
          </span>
          {block.text}
        </div>
      );
    default:
      return null;
  }
}

export default function FeedPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen pt-24 pb-24 px-6 md:px-14 lg:px-0 cyber-grid">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 transition-colors"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim-soft)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--dim)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim-soft)')}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            /feed
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-10"
        >
          {/* Icon tile */}
          <div
            className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
          >
            <span className="text-2xl">{post.symbol}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded"
                style={{
                  background: 'rgba(68,136,255,0.08)',
                  color: '#4488ff',
                  border: '1px solid rgba(68,136,255,0.18)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="font-black uppercase tracking-tight text-white leading-none mb-3"
            style={{ fontSize: 'clamp(22px, 4vw, 40px)' }}
          >
            {post.title}
          </h1>

          {/* Meta */}
          <div
            className="flex items-center gap-2.5"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
          >
            <span className="text-[10px] text-white/30">
              {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-white/15">·</span>
            <span className="text-[10px] text-white/30">{post.readTime} dakika okuma</span>
          </div>

          {/* Excerpt */}
          <p className="text-sm text-white/35 mt-4 leading-loose max-w-xl pl-4" style={{ borderLeft: '2px solid var(--border)' }}>
            {post.excerpt}
          </p>
        </motion.div>

        {/* Divider */}
        <div className="h-px mb-10" style={{ background: 'var(--border)' }} />

        {/* Content blocks */}
        <div>
          {post.content.map((block, i) => (
            <Block key={i} block={block} index={i} />
          ))}
        </div>

        {/* Footer nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-20 pt-8 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 transition-colors"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim-soft)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--dim)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim-soft)')}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Tüm yazılar
          </Link>
          <span className="text-[9px] font-mono text-white/20">
            {new Date(post.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
          </span>
        </motion.div>

      </div>
    </main>
  );
}
