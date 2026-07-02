import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs — Programcı Notları & Teknik Yazılar",
  description:
    "Backend developer Ömer Faruk Yıldız'ın programcı notları: Python, C# / .NET, SAP RFC, Docker, Playwright ve Entity Framework Core üzerine kısa teknik yazılar ve gerçek dünyadan çözümler.",
  keywords: [
    "programcı notları", "backend notları", "Python notları", "C# .NET notları",
    "SAP RFC", "Docker", "Playwright", "Entity Framework Core", "teknik yazılar",
    "yazılım günlüğü",
  ],
  alternates: { canonical: "/logs" },
  openGraph: {
    title: "Logs | Ömer Faruk Yıldız — Backend Developer",
    description:
      "Backend, RPA ve sistem entegrasyonu üzerine programcı notları ve teknik yazılar.",
    url: "https://omerfarukyildiz.tech/logs",
    type: "website",
  },
};

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
