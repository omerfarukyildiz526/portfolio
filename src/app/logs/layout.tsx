import type { Metadata } from "next";
import { Space_Grotesk, Newsreader } from "next/font/google";
import LogsThemeShell from "./LogsThemeShell";

// /logs'a özel yazı tipleri — ana sitedeki Inter/JetBrains'ten belirgin şekilde
// ayrışır: Space Grotesk (başlık/etiket) + Newsreader (uzun metin, serif).
// CSS variable olarak tanımlanıp yalnızca .logs-theme kapsamında kullanılır.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-logs-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-logs-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Logs — Programcı Notları & Teknik Yazılar",
  description:
    "Backend developer Ömer Faruk Yıldız'ın programcı notları: Python, C# / .NET, SAP RFC, Docker, Playwright ve Entity Framework Core üzerine kısa teknik yazılar ve gerçek dünyadan çözümler. Instagram'da @dev.omer.logs'ta paylaştıklarımın derinlemesine hali.",
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
  return (
    <LogsThemeShell fontVars={`${spaceGrotesk.variable} ${newsreader.variable}`}>
      {children}
    </LogsThemeShell>
  );
}
