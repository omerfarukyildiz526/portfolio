/** @type {import('next').NextConfig} */
const nextConfig: any = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  // Eski /feed ve tekrar eden /blog URL'lerini (yer imleri, SEO) tek doğru
  // rota olan /logs'a kalıcı (308) taşı — kırık linkleri ve çift içeriği önler.
  async redirects() {
    return [
      { source: '/feed', destination: '/logs', permanent: true },
      { source: '/feed/:slug', destination: '/logs/:slug', permanent: true },
      { source: '/blog', destination: '/logs', permanent: true },
      { source: '/blog/:slug', destination: '/logs/:slug', permanent: true },
    ];
  },
};

export default nextConfig;