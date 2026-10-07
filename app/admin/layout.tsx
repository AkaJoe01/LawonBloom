import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin | Lawon Bloom", template: "%s | Admin — Lawon Bloom" },
  description: "Lawon Bloom editorial admin.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--surface)] text-[var(--foreground)]">{children}</body>
    </html>
  );
}
