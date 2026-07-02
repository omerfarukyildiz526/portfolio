// Liste kartlarının yüklenme yer tutucusu: gerçek kart düzenini (ikon karesi +
// başlık + açıklama + tarih) taklit eden shimmer'lı iskelet satırlar.
// Salt CSS animasyonu (globals: .skeleton) — reduced-motion global olarak durur.
export default function JsonSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-5 p-5 rounded-xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="skeleton h-3.5 rounded" style={{ width: `${52 + (i % 3) * 12}%` }} />
            <div className="skeleton h-3 rounded" style={{ width: `${78 - (i % 2) * 14}%` }} />
          </div>
          <div className="skeleton h-3 w-16 rounded hidden sm:block flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
