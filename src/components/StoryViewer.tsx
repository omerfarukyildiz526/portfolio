'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ViewerStory {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
}

const IMAGE_DURATION_MS = 5000;

export default function StoryViewer({ stories, onClose }: { stories: ViewerStory[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1, geçerli story için
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const story = stories[index];

  const goNext = useCallback(() => {
    setIndex(i => {
      if (i >= stories.length - 1) { onClose(); return i; }
      return i + 1;
    });
  }, [stories.length, onClose]);

  const goPrev = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
  }, []);

  // İlerleme: resimlerde sabit süre, videolarda video süresine göre.
  useEffect(() => {
    setProgress(0);
    startRef.current = performance.now();
    pausedRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (story?.mediaType === 'video') return; // video kendi timeupdate'iyle ilerler

    const duration = IMAGE_DURATION_MS;
    const tick = (t: number) => {
      if (pausedRef.current) { startRef.current = t - progress * duration; }
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) { goNext(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, story?.mediaType]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goPrev]);

  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="story-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.92)' }}>

        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full h-full sm:h-[92vh] sm:max-w-[420px] sm:rounded-xl overflow-hidden">

          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
            {stories.map((s, i) => (
              <div key={s.id} className="flex-1 h-[2.5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
                <div className="h-full rounded-full" style={{
                  background: '#fff',
                  width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
                  transition: i === index ? 'none' : 'width 0.15s linear',
                }} />
              </div>
            ))}
          </div>

          {/* Close */}
          <button onClick={onClose} aria-label="kapat"
            className="absolute top-6 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.35)', color: '#fff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Media */}
          {story.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={story.mediaUrl}
              className="w-full h-full object-contain bg-black"
              autoPlay playsInline
              onTimeUpdate={e => {
                const v = e.currentTarget;
                if (v.duration) setProgress(v.currentTime / v.duration);
              }}
              onEnded={goNext}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={story.mediaUrl} alt="" className="w-full h-full object-contain bg-black" />
          )}

          {story.caption && (
            <div className="absolute inset-x-0 bottom-0 p-4 pt-10"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
              <p className="text-[13px] leading-snug" style={{ color: '#fff' }}>{story.caption}</p>
            </div>
          )}

          {/* Tap zones: sol = önceki, sağ = sonraki */}
          <button onClick={goPrev} aria-label="önceki" className="absolute inset-y-0 left-0 w-1/3" />
          <button onClick={goNext} aria-label="sonraki" className="absolute inset-y-0 right-0 w-1/3" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
