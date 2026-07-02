import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs",
  description:
    "Backend, RPA ve sistem entegrasyonu üzerine programcı notları ve teknik yazılar. Python, C# / .NET, SAP RFC, Docker ve Entity Framework Core.",
  openGraph: {
    title: "Logs | Ömer Faruk Yıldız",
    description:
      "Backend, RPA ve sistem entegrasyonu üzerine programcı notları ve teknik yazılar.",
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
