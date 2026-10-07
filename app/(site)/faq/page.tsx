import { pageMetadata } from "@/lib/seo";
import FaqView from "./faq-view";

export const metadata = pageMetadata("/faq");

export default function FAQPage() {
  return <FaqView />;
}
