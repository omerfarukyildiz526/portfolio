import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed",
  description:
    "Backend, RPA ve sistem entegrasyonu üzerine programcı notları ve teknik yazılar. Python, C# / .NET, SAP RFC, Docker ve Entity Framework Core.",
  openGraph: {
    title: "Feed | Ömer Faruk Yıldız",
    description:
      "Backend, RPA ve sistem entegrasyonu üzerine programcı notları ve teknik yazılar.",
    type: "website",
  },
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
