import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projeler",
  description:
    "Ömer Faruk Yıldız'ın açık kaynak ve kişisel projeleri — backend servisleri, REST API'ler ve otomasyon çalışmaları. GitHub repoları ve README'leri.",
  openGraph: {
    title: "Projeler | Ömer Faruk Yıldız",
    description:
      "Backend, API ve otomasyon projeleri — GitHub repoları ve README'leri.",
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
