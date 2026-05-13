import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Manrope, Newsreader } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

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
    <html lang="en" className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--surface)] text-[var(--foreground)]">
        <Header />
        <main className="grow pt-22">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
