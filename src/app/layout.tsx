import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ömer Faruk Yıldız — Backend Developer",
  description: "Backend mimarilerini tasarlar, süreçleri otonomlaştırırım. Mantık her şeyin üstündedir.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${syne.variable} ${jetbrainsMono.variable} ${poppins.variable} h-full`}>
      <body className="min-h-full scanlines bg-black text-white">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
