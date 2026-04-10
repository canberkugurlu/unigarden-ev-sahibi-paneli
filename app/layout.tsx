import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIGARDEN Ev Sahibi Paneli",
  description: "Ev sahibi bilgi ve yönetim portalı",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
