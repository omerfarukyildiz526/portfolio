'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { POSTS } from '@/lib/posts';

export default function FeedPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">

      {/* Minimal header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="px-8 md:px-14 lg:px-24 xl:px-32 mb-8 flex items-center justify-between"
        style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black text-[#4488ff] uppercase tracking-widest">GET</span>
          <span className="text-[11px] text-white/25">/api/feed</span>
          <span className="ml-2 text-[10px] text-[#4488ff]/50">→ 200 OK</span>
        </div>
        <span className="text-[10px] text-white/20">{POSTS.length} yazı</span>
      </motion.div>

      {/* Instagram grid */}
      <div className="px-8 md:px-14 lg:px-24 xl:px-32">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {POSTS.map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          >
            <Link href={`/feed/${post.slug}`}>
              <div className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer">

                {/* Gradient bg */}
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${post.gradient[0]} 0%, ${post.gradient[1]} 100%)` }}
                />

                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.035]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                  }}
                />

                {/* Symbol */}
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-10 group-hover:scale-125">
                  <span
                    className="text-3xl md:text-4xl select-none"
                    style={{ filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.12))' }}
                  >
                    {post.symbol}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-3 md:p-4 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[7px] md:text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(68,136,255,0.2)', color: '#4488ff', border: '1px solid rgba(68,136,255,0.25)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title + meta */}
                  <div>
                    <h3 className="text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-tight text-white leading-snug mb-1.5">
                      {post.title}
                    </h3>
                    <div
                      className="flex items-center gap-1.5"
                      style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
                    >
                      <span className="text-[8px] text-white/35">{post.readTime} dk</span>
                      <span className="text-white/15">·</span>
                      <span className="text-[8px] text-white/35">
                        {new Date(post.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Border inset */}
                <div className="absolute inset-0 border border-white/[0.04] pointer-events-none" />
              </div>
            </Link>
          </motion.div>
        ))}
        </div>
      </div>
    </main>
  );
}
