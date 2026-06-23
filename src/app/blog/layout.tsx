import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Backend, RPA ve sistem entegrasyonu üzerine teknik yazılar. Python + Selenium, C# REST API, Docker, SAP RFC ve Entity Framework Core rehberleri.",
  openGraph: {
    title: "Blog | Ömer Faruk Yıldız",
    description:
      "Backend, RPA ve sistem entegrasyonu üzerine teknik yazılar ve rehberler.",
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
