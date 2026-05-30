'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { POSTS } from '@/lib/posts';

export default function BlogPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-8 md:px-14 lg:px-24 xl:px-32">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-3 mb-4" style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}>
              <span className="text-[11px] font-black accent uppercase tracking-widest">GET</span>
              <span className="text-[11px] text-white/25">/api/blog</span>
              <span className="ml-2 text-[10px] text-[#4488ff]/60">→ 200 OK</span>
            </div>
            <h1
              className="font-black uppercase italic tracking-tighter leading-none text-white heading-primary accent-orange-glow"
              style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}
            >
              KONULAR.
            </h1>
            <p className="text-base text-white/35 mt-4 max-w-lg leading-relaxed">
              Backend, RPA ve sistem entegrasyonu üzerine teknik yazılar. Tıkla, oku, uygula.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
            className="terminal rounded-xl p-5"
            style={{ fontFamily: 'var(--font-jetbrains, monospace)' }}
          >
            <div className="text-[10px] text-white/25 mb-3 uppercase tracking-widest">// KONU İSTATİSTİKLERİ</div>
            <div className="text-[11px] leading-loose text-white/50">
              <span className="text-white/30">{'{'}</span><br />
              <span className="ml-4 text-white/25">&quot;toplam&quot;:&nbsp;</span>
              <span className="text-[#4488ff]">{POSTS.length},</span><br />
              <span className="ml-4 text-white/25">&quot;kategoriler&quot;:&nbsp;</span>
              <span className="text-[#86efac]">[&quot;Python&quot;, &quot;C#&quot;, &quot;SAP&quot;, &quot;DevOps&quot;],</span><br />
              <span className="ml-4 text-white/25">&quot;format&quot;:&nbsp;</span>
              <span className="text-[#fbbf24]">&quot;teknik rehber&quot;,</span><br />
              <span className="ml-4 text-white/25">&quot;dil&quot;:&nbsp;</span>
              <span className="text-[#fbbf24]">&quot;Türkçe&quot;</span><br />
              <span className="text-white/30">{'}'}</span>
            </div>
          </motion.div>
        </div>

        {/* Instagram-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {POSTS.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative aspect-square overflow-hidden rounded-md group cursor-pointer">
                  {/* Gradient background */}
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
                  />

                  {/* Grid pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Symbol */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-5xl md:text-6xl select-none transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.15))' }}
                    >
                      {post.symbol}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(68,136,255,0.25)', color: '#4488ff', border: '1px solid rgba(68,136,255,0.3)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xs md:text-sm font-black uppercase tracking-tight text-white leading-tight">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-mono text-white/40">{post.readTime} dk okuma</span>
                        <span className="text-white/20 text-[9px]">·</span>
                        <span className="text-[9px] font-mono text-white/40">
                          {new Date(post.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top-right read time badge */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span
                      className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
                    >
                      {post.readTime} dk
                    </span>
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
