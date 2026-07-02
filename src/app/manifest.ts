import type { MetadataRoute } from "next";

// PWA manifest — "yüklenebilir site" sinyali ve mobil/masaüstü ikonları.
// Next otomatik olarak /manifest.webmanifest adresinde sunar ve <head>'e bağlar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ömer Faruk Yıldız — Backend Developer Portfolio",
    short_name: "Ö. F. Yıldız",
    description:
      "İstanbul merkezli backend developer. Python, C# / .NET, REST API ve RPA ile backend servisleri, sistem entegrasyonu ve süreç otomasyonu.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "tr",
    dir: "ltr",
    categories: ["portfolio", "technology", "developer"],
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/logo.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "any", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "any", type: "image/png" },
    ],
  };
}
