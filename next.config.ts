/** @type {import('next').NextConfig} */
const nextConfig: any = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  // Eski /feed URL'lerini (yer imleri, SEO) yeni /logs rotasına taşı.
  async redirects() {
    return [
      { source: '/feed', destination: '/logs', permanent: true },
      { source: '/feed/:slug', destination: '/logs/:slug', permanent: true },
    ];
  },
};

export default nextConfig;