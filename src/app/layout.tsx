import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://omerfarukyildiz.tech"),
  title: {
    default: "Ömer Faruk Yıldız | Backend Developer Portfolio",
    template: "%s | Ömer Faruk Yıldız",
  },
  description:
    "Python, C# / .NET ve RPA teknolojileriyle geliştirilmiş backend servisleri ve süreç otomasyonu projeleri. Ömer Faruk Yıldız — Barsan Global Lojistik'te yazılım uzmanı.",
  keywords: [
    "Ömer Faruk Yıldız", "backend developer", "yazılım uzmanı", "Python",
    "C#", ".NET", "RPA", "Selenium", "SAP RFC", "otomasyon", "REST API", "portföy",
  ],
  authors: [{ name: "Ömer Faruk Yıldız" }],
  creator: "Ömer Faruk Yıldız",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Ömer Faruk Yıldız | Backend Developer Portfolio",
    description:
      "Python, C# / .NET ve RPA ile backend servisleri ve süreç otomasyonu. Projeler, deneyim ve teknik notlar.",
    url: "https://omerfarukyildiz.tech",
    type: "website",
    locale: "tr_TR",
    siteName: "Ömer Faruk Yıldız",
  },
  twitter: {
    card: "summary",
    title: "Ömer Faruk Yıldız | Backend Developer Portfolio",
    description:
      "Python, C# / .NET ve RPA ile backend servisleri ve süreç otomasyonu projeleri.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
