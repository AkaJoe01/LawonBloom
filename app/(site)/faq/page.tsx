import type { Metadata } from "next";
import FaqView from "./faq-view";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return <FaqView />;
}
