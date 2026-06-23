import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">

        {/* Status block */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="font-mono text-[11px] font-bold"
              style={{ color: 'var(--fg-3)' }}
            >
              HTTP/1.1
            </span>
            <span
              className="font-mono font-bold"
              style={{ fontSize: 'clamp(56px, 12vw, 96px)', color: 'var(--fg)', letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              404
            </span>
          </div>

          <p
            className="font-mono text-[13px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--fg-3)' }}
          >
            Not Found
          </p>

          <p
            className="font-mono text-[11px]"
            style={{ color: 'var(--fg-3)', opacity: 0.6 }}
          >
            Content-Type: text/plain
          </p>
        </div>

        {/* Divider */}
        <div className="divider max-w-[80px] mx-auto mb-8" />

        {/* Message */}
        <p
          className="body-md mb-8"
          style={{ color: 'var(--fg-2)' }}
        >
          The endpoint you requested doesn&apos;t exist or has been moved.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          GET /home
        </Link>

      </div>
    </main>
  );
}
