import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projeler — Backend, REST API & Otomasyon",
  description:
    "Ömer Faruk Yıldız'ın backend developer projeleri: Python & C# / .NET REST API'leri, sistem entegrasyonları ve RPA otomasyon çalışmaları. GitHub repoları ve README'leriyle gerçek kod örnekleri — işe alım ve proje değerlendirmesi yapan firmalar için.",
  keywords: [
    "backend developer projeleri", "Python projeleri", "C# .NET projeleri",
    "REST API örnekleri", "RPA otomasyon projeleri", "GitHub portföy",
    "açık kaynak backend", "sistem entegrasyonu örnekleri", "Ömer Faruk Yıldız projeler",
  ],
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projeler | Ömer Faruk Yıldız — Backend Developer",
    description:
      "Backend, REST API ve otomasyon projeleri — gerçek kod örnekleri, GitHub repoları ve README'leri.",
    url: "https://omerfarukyildiz.tech/projects",
    type: "website",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
