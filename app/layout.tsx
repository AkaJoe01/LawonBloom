import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Lawon Bloom Fertility Centre | IVF & Fertility Clinic in Ibadan",
  description:
    "Lawon Bloom Fertility Centre offers IVF, IUI, egg freezing, and fertility testing in Ibadan. Personalized care with advanced technology. Book a consultation.",
  icons: [{ rel: "icon", url: "/logo/logo.png" }],
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
