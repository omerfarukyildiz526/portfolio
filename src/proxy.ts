import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * "?format=json" numarası — bir sayfa yoluna eklenince aynı verinin ham
 * JSON'unu döndürür. Backend kimliğine özgü: sayfayı gerçek bir API gibi
 * gösterir. İstek, ilgili API rotasına rewrite edilir (URL çubuğu değişmez).
 */
const ROUTES: { re: RegExp; to: (m: RegExpMatchArray) => string }[] = [
  { re: /^\/logs\/([^/]+)$/, to: m => `/api/posts/${m[1]}` },
  { re: /^\/logs$/,          to: () => '/api/posts' },
  { re: /^\/skills$/,        to: () => '/api/skills' },
];

export function proxy(req: NextRequest) {
  if (req.nextUrl.searchParams.get('format') !== 'json') return NextResponse.next();

  for (const { re, to } of ROUTES) {
    const m = req.nextUrl.pathname.match(re);
    if (m) {
      const url = req.nextUrl.clone();
      url.pathname = to(m);
      url.searchParams.delete('format');
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/logs', '/logs/:slug', '/skills'],
};
