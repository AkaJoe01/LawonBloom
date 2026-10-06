import type { Metadata } from "next";
import { connection } from "next/server";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://lawonbloomfertilitycentre.com"),
  title: "Lawon Bloom Fertility Centre | IVF & Fertility Clinic in Ibadan",
  description:
    "Lawon Bloom Fertility Centre offers IVF, IUI, egg freezing, and fertility testing in Ibadan. Personalized care with advanced technology. Book a consultation.",
  icons: [{ rel: "icon", url: "/logo/logo.png" }],
  alternates: {
    types: { "application/rss+xml": "https://lawonbloomfertilitycentre.com/blog/rss.xml" },
  },
  twitter: { card: "summary_large_image" },
};

export default async function SiteRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[var(--surface)] text-[var(--foreground)]">
        <Header />
        <main className="grow pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
