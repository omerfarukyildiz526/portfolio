import { motion } from 'framer-motion';

// /logs grid'inin yükleme yer tutucusu — genel "satır" iskeletinin (JsonSkeleton)
// aksine, gerçek kart düzenini (kare, 2-3 sütun) birebir taklit ediyor ki
// yükleme bitince içerik "zıplamasın". Aynı shimmer (.skeleton, globals.css)
// kullanılıyor, sadece şekli grid'e uyarlandı.
export default function LogsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px] md:gap-1" aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.4 }}
          className="skeleton aspect-square rounded-[2px]"
          style={{ animationDelay: `${(i % 3) * 0.15}s` }}
        />
      ))}
    </div>
  );
}
