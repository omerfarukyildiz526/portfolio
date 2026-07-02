import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Backend, RPA & Sistem Entegrasyonu Rehberleri",
  description:
    "Backend developer Ömer Faruk Yıldız'ın teknik yazıları: Python + Playwright/Selenium, C# REST API, Docker, SAP RFC ve Entity Framework Core rehberleri. Gerçek problemlerden çıkan, uygulanabilir çözümler.",
  keywords: [
    "backend blog", "Python rehber", "C# REST API rehber", "RPA otomasyon rehber",
    "SAP RFC entegrasyonu", "Docker rehber", "Entity Framework Core",
    "Playwright web scraping", "sistem entegrasyonu yazıları", "yazılım teknik blog",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Ömer Faruk Yıldız — Backend Developer",
    description:
      "Backend, RPA ve sistem entegrasyonu üzerine teknik yazılar ve uygulanabilir rehberler.",
    url: "https://omerfarukyildiz.tech/blog",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
