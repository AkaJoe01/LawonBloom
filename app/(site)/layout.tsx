import type { Metadata } from "next";
import { connection } from "next/server";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  APEX,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  ORG_NAME,
  TITLE_TEMPLATE,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(APEX),
  title: { default: DEFAULT_TITLE, template: TITLE_TEMPLATE },
  description: DEFAULT_DESCRIPTION,
  icons: [{ rel: "icon", url: "/logo/logo.png" }],
  alternates: {
    types: { "application/rss+xml": "https://lawonbloomfertilitycentre.com/blog/rss.xml" },
  },
  openGraph: {
    type: "website",
    url: APEX,
    siteName: ORG_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: OG_IMAGE_PATH, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }],
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
