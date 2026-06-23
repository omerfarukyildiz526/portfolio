'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { POSTS } from '@/lib/posts';

export default function BlogPage() {
  return (
    <main className="min-h-screen pt-24 pb-32 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} className="mb-16">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="method-get">GET</span>
            <span className="font-mono text-[12px]" style={{ color: 'var(--fg-3)' }}>/api/blog</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>→ 200 OK</span>
          </div>
          <h1 className="display-lg mb-3" style={{ color: 'var(--fg)' }}>BLOG.</h1>
          <p className="body-md" style={{ color: 'var(--fg-2)' }}>
            Backend, RPA ve sistem entegrasyonu üzerine teknik yazılar.
          </p>
        </motion.div>

        <div className="space-y-3">
          {POSTS.map((post, i) => (
            <motion.div key={post.slug}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}>
              <Link href={`/blog/${post.slug}`}>
                <div className="flex items-center gap-5 p-5 rounded-xl border transition-all duration-200 group"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}>
                    {post.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] truncate mb-1" style={{ color: 'var(--fg)' }}>{post.title}</p>
                    <p className="body-sm truncate" style={{ color: 'var(--fg-3)' }}>{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-mono text-[11px] hidden sm:block" style={{ color: 'var(--fg-3)' }}>{post.date}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: 'var(--fg-3)' }}>
                      <path d="M5 12h14m-7-7 7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
