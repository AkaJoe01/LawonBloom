/**
 * Single source of truth for the public FAQ page (M8b, plan Q14).
 *
 * - `faq-view.tsx` renders ALL entries (unconfirmed copy stays visible in the UI).
 * - FAQPage JSON-LD (app/(site)/faq/page.tsx) ships ONLY `confirmed` entries.
 *   An entry is flipped to `confirmed: true` by owner sign-off (H1 in
 *   ops/launch-checklist.md) — a flag flip is a data-only diff, no code change.
 */
export interface SiteFaq {
  category: string;
  question: string;
  answer: string;
  confirmed: boolean;
}

export const faqs: SiteFaq[] = [
  {
    category: "The First Step",
    question: "What should I expect during my initial consultation at the Sanctuary?",
    answer:
      "Your initial consultation is designed to be a profound listening session rather than a standard clinical appointment. Conducted in one of our private, sunlit suites, you will meet with a Senior Fertility Specialist and a dedicated Wellness Concierge. We review your complete medical history, discuss your emotional and physical readiness, and begin drafting a personalized roadmap. The focus is entirely on your unique story, ensuring you feel heard, understood, and enveloped in our care from the very first moment.",
    confirmed: false,
  },
  {
    category: "Concierge Services",
    question: "How does Lawonbloom ensure privacy for high-profile clientele?",
    answer:
      "Discretion is woven into every layer of our sanctuary. From private entry protocols and unmarked suites to encrypted communications and biometric-secured medical records, every detail is engineered for absolute confidentiality. Our concierge team coordinates all logistics — from discreet transportation to private accommodation — ensuring your journey remains profoundly private. Staff are bound by stringent NDAs, and our facilities are designed to eliminate any unwanted encounters.",
    confirmed: false,
  },
  {
    category: "Clinical Pathways",
    question: "What holistic therapies are integrated into the clinical pathways?",
    answer:
      "We believe the body responds best to treatment when the mind is at peace. Our integrated holistic therapies include acupuncture sessions timed to optimize uterine receptivity, nutritional counseling tailored to fertility, mindfulness and meditation protocols, and gentle yoga designed for reproductive health. Each therapy is scientifically evaluated and coordinated with your clinical timeline to ensure seamless integration.",
    confirmed: false,
  },
  {
    category: "Holistic Support",
    question: "How is the psychological well-being of intended parents supported?",
    answer:
      "Our dedicated psychological support team includes licensed therapists specializing in reproductive mental health. We offer private counselling sessions, support groups, and stress-management protocols throughout your journey. From the initial consultation through post-treatment, our wellness concierge monitors your emotional wellbeing, providing resources and support tailored to your unique needs. We also offer partner and family counselling to ensure your entire support system is nurtured.",
    confirmed: false,
  },
  {
    category: "Concierge Services",
    question: "What travel and accommodation support is available for international patients?",
    answer:
      "Our global concierge team provides end-to-end travel coordination including visa assistance, airport transfers, luxury accommodation booking, and local transportation. We partner with exclusive hotels and serviced apartments that understand the need for privacy and comfort. For longer stays, we can arrange fully equipped private residences with kitchen facilities and dedicated workspaces, ensuring you feel at home throughout your treatment journey.",
    confirmed: false,
  },
  {
    category: "Clinical Pathways",
    question: "What is the typical timeline for an IVF cycle at Lawonbloom?",
    answer:
      "A complete IVF cycle at our sanctuary typically spans 4 to 6 weeks from initial stimulation to embryo transfer. This includes ovarian stimulation (10-14 days), egg retrieval (a single-day procedure), fertilization and embryo culture (5-6 days), and embryo transfer. The exact timeline is personalized based on your individual protocol, diagnostic results, and response to medications. Your dedicated care coordinator will provide a detailed calendar at the start of your journey.",
    confirmed: false,
  },
];

export function confirmedFaqs(): SiteFaq[] {
  return faqs.filter((entry) => entry.confirmed);
}
