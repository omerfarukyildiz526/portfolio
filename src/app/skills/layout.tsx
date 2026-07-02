import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yetenekler & Teknolojiler — Python, C# / .NET, RPA",
  description:
    "Backend developer Ömer Faruk Yıldız'ın teknoloji yığını: Python, C# / .NET, REST API, SQL Server, PostgreSQL, MongoDB, Docker, SAP RFC, Selenium ve Playwright. İşe alım ve proje eşleştirmesi yapan firmalar için net yetkinlik listesi.",
  keywords: [
    "backend developer yetenekleri", "Python", "C#", ".NET", "REST API",
    "SQL Server", "PostgreSQL", "MongoDB", "Docker", "SAP RFC", "Selenium",
    "Playwright", "RPA", "teknoloji yığını", "backend tech stack",
  ],
  alternates: { canonical: "/skills" },
  openGraph: {
    title: "Yetenekler & Teknolojiler | Ömer Faruk Yıldız — Backend Developer",
    description:
      "Python, C# / .NET, REST API, veritabanları, Docker, SAP RFC ve RPA — backend, veri ve otomasyon teknolojileri.",
    url: "https://omerfarukyildiz.tech/skills",
    type: "website",
  },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
