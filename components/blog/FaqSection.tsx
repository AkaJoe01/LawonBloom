export interface Faq {
  question: string;
  answer: string;
}

export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-serif text-2xl text-foreground md:text-3xl">
        Frequently asked questions
      </h2>
      <dl className="mt-5 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-xl border border-outline-variant bg-background p-5">
            <dt className="font-semibold text-foreground">{faq.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-on-surface-variant">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
