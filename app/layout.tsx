import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Lawonbloom Fertility Centre",
  description: "A cinematic fertility centre experience focused on privacy, clinical precision, and calm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
