import JsonLd from "@/components/seo/JsonLd";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { confirmedFaqs } from "./faqs";
import FaqView from "./faq-view";

export const metadata = pageMetadata("/faq");

export default function FAQPage() {
  const entries = confirmedFaqs().map(({ question, answer }) => ({ question, answer }));
  const schema = faqJsonLd(entries);
  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      <FaqView />
    </>
  );
}
