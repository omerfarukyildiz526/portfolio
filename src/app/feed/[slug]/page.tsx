'use client';

import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post, ContentBlock } from '@/lib/posts';
import { MD } from '@/components/Markdown';
import Loader from '@/components/Loader';

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
    case 'h2': return wrap(<h2 className="display-md mt-10 mb-4" style={{ color: 'var(--fg)' }}>{block.text}</h2>);
    case 'h3': return wrap(<h3 className="font-semibold text-base mt-7 mb-3" style={{ color: 'var(--fg)' }}>{block.text}</h3>);
    case 'p':  return wrap(<p className="body-md mb-4" style={{ color: 'var(--fg-2)' }}><MD>{block.text ?? ''}</MD></p>);
    case 'code': return wrap(
      <div className="code-block my-5">
        <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-mono text-[11px]" style={{ color: 'var(--fg-3)' }}>{block.lang || 'code'}</span>
        </div>
        <pre className="overflow-x-auto p-5" style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 13, lineHeight: 1.65, color: 'var(--fg-2)' }}>
          <code>{block.text}</code>
        </pre>
      </div>
    );
    case 'list': return wrap(
      <ul className="mb-4 space-y-2.5 pl-0">
        {block.items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3 body-md" style={{ color: 'var(--fg-2)' }}>
            <span className="mt-2.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />{item}
          </li>
        ))}
      </ul>
    );
    case 'note': return wrap(
      <div className="my-5 p-5 rounded-xl body-md"
        style={{ background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderLeft: '3px solid var(--accent)', color: 'var(--fg-2)' }}>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--accent)' }}>Note</span>
        <MD>{block.text ?? ''}</MD>
      </div>
    );
    case 'quote': return wrap(
      <blockquote className="my-6 pl-5 body-lg italic" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--fg)' }}><MD>{block.text ?? ''}</MD></blockquote>
    );
    case 'image': return wrap(
      <figure className="my-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.url} alt={block.text || ''} className="w-full rounded-xl" style={{ border: '1px solid var(--border)' }} />
        {block.text && <figcaption className="body-sm text-center mt-2.5" style={{ color: 'var(--fg-3)' }}>{block.text}</figcaption>}
      </figure>
    );
    case 'divider': return wrap(
      <hr className="my-8" style={{ border: 0, borderTop: '1px solid var(--border)' }} />
    );
    default: return null;
  }
}

export default function FeedPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/posts/${slug}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setPost(d?.post ?? null))
      .catch(() => setPost(null));
  }, [slug]);

  if (post === undefined) {
    return <main className="min-h-screen flex items-center justify-center">
      <Loader route={`/api/feed/${slug}`} />
    </main>;
  }
  if (post === null) notFound();

  return (
    <main className="min-h-screen pt-24 pb-28 px-5 md:px-8">
      <div className="max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }} className="mb-12">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 font-mono text-[11px] transition-opacity hover:opacity-100"
            style={{ color: 'var(--fg-3)', opacity: 0.75 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            /feed
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }} className="mb-12">
          {post.cover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={post.cover} alt="" className="w-full rounded-2xl mb-7"
              style={{ border: '1px solid var(--border)', maxHeight: 360, objectFit: 'cover' }} />
          )}
          <div className="w-14 h-14 rounded-2xl mb-7 flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}>
            {post.symbol}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.tags.map(tag => <span key={tag} className="tag tag-accent font-mono text-[10px]">{tag}</span>)}
          </div>
          <h1 className="display-lg mb-4" style={{ color: 'var(--fg)' }}>{post.title}</h1>
          <div className="flex items-center gap-2.5 font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>
            <span>{new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readTime} min</span>
          </div>
          <p className="body-md mt-5 pl-4 max-w-xl" style={{ color: 'var(--fg-2)', borderLeft: '2px solid var(--border)' }}>
            {post.excerpt}
          </p>
        </motion.div>

        <div className="divider mb-10" />

        <div>{post.content.map((block, i) => <Block key={i} block={block} index={i} />)}</div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-20 pt-8 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/feed" className="inline-flex items-center gap-2 font-mono text-[11px] transition-opacity hover:opacity-100"
            style={{ color: 'var(--fg-3)', opacity: 0.75 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            All articles
          </Link>
          <span className="font-mono text-[10px]" style={{ color: 'var(--fg-3)' }}>
            {new Date(post.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
          </span>
        </motion.div>

      </div>
    </main>
  );
}
