import type { Metadata } from "next";
import { buildMetadata, type BuildMetadataInput } from "./metadata";

export const SITE_PAGE_CATALOG: Record<string, BuildMetadataInput> = {
  "/about": {
    routeType: "static",
    title: "About Lawon Bloom",
    description:
      "Our story, technology and the values behind Lawon Bloom Fertility Centre — a sanctuary for fertility care in Ibadan.",
    path: "/about",
  },
  "/faq": {
    routeType: "static",
    title: "Fertility FAQs",
    description:
      "Answers to common questions about consultations, treatments, privacy and concierge services at Lawon Bloom Fertility Centre.",
    path: "/faq",
  },
  "/path": {
    routeType: "static",
    title: "The Path to Parenthood",
    description:
      "A clear overview of each step on the path to parenthood, from first consultation through treatment and follow-up care.",
    path: "/path",
  },
  "/concierge": {
    routeType: "static",
    title: "Patient Concierge",
    description:
      "Discreet, end-to-end concierge support — travel, accommodation and privacy coordination for patients of Lawon Bloom.",
    path: "/concierge",
  },
  "/concierge/contact": {
    routeType: "contact",
    title: "Contact & Appointments",
    description:
      "Contact Lawon Bloom Fertility Centre in Ibadan. Call +234 913 250 4126 or send a confidential enquiry to book an appointment.",
    path: "/concierge/contact",
  },
  "/journey": {
    routeType: "static",
    title: "Your Fertility Journey",
    description:
      "Follow the Lawon Bloom fertility journey: evaluation, personalised treatment planning, care coordination and support.",
    path: "/journey",
  },
  "/journey/consultation": {
    routeType: "contact",
    title: "Book a Consultation",
    description:
      "Request a private consultation with a Lawon Bloom fertility specialist. Share your details securely and choose a preferred time.",
    path: "/journey/consultation",
  },
  "/journey/stories": {
    routeType: "listing",
    title: "Patient Stories",
    description:
      "Stories from families who walked the fertility journey with Lawon Bloom — hope, honesty and care in Ibadan.",
    path: "/journey/stories",
  },
  "/sanctuary": {
    routeType: "static",
    title: "The Sanctuary",
    description:
      "Step inside the Sanctuary — private suites, advanced laboratory technology and a calm environment designed for your care.",
    path: "/sanctuary",
  },
  "/sanctuary/services": {
    routeType: "listing",
    title: "Clinic Services",
    description:
      "Explore fertility services at Lawon Bloom: IVF, IUI, genetic testing, fertility preservation, holistic support and surrogacy.",
    path: "/sanctuary/services",
  },
  "/sanctuary/services/surrogacy": {
    routeType: "service",
    title: "Surrogacy Services",
    description:
      "Surrogacy guidance and coordination at Lawon Bloom Fertility Centre, from initial counselling through clinical and legal steps.",
    path: "/sanctuary/services/surrogacy",
  },
  "/sanctuary/team": {
    routeType: "static",
    title: "Our Specialists",
    description:
      "Meet the specialists, nurses and wellness concierges behind Lawon Bloom Fertility Centre in Ibadan.",
    path: "/sanctuary/team",
  },
  "/clinical-excellence": {
    routeType: "static",
    title: "Clinical Excellence",
    description:
      "Clinical excellence at Lawon Bloom: evidence-led protocols, laboratory standards and multidisciplinary fertility care.",
    path: "/clinical-excellence",
  },
  "/clinical-excellence/fertility-preservation": {
    routeType: "service",
    title: "Fertility Preservation",
    description:
      "Fertility preservation options at Lawon Bloom, including counselling, retrieval pathways and personalised timelines.",
    path: "/clinical-excellence/fertility-preservation",
  },
  "/clinical-excellence/genetic-testing": {
    routeType: "service",
    title: "Genetic Testing",
    description:
      "Genetic testing at Lawon Bloom to support informed decisions before and during your fertility treatment.",
    path: "/clinical-excellence/genetic-testing",
  },
  "/clinical-excellence/holistic-support": {
    routeType: "service",
    title: "Holistic Support",
    description:
      "Holistic support at Lawon Bloom — acupuncture, nutrition, mindfulness and counselling integrated with your treatment plan.",
    path: "/clinical-excellence/holistic-support",
  },
  "/clinical-excellence/iui": {
    routeType: "service",
    title: "IUI Treatment",
    description:
      "IUI treatment at Lawon Bloom: what the procedure involves, who it may suit and what to expect at each stage.",
    path: "/clinical-excellence/iui",
  },
  "/clinical-excellence/ivf": {
    routeType: "service",
    title: "IVF Treatment",
    description:
      "IVF at Lawon Bloom: stimulation, monitoring, egg retrieval, fertilisation and embryo transfer explained step by step.",
    path: "/clinical-excellence/ivf",
  },
  "/clinical-excellence/journal": {
    routeType: "static",
    title: "Patient Education Journal",
    description:
      "Educational articles on fertility, treatment options and patient wellbeing from the Lawon Bloom clinical team.",
    path: "/clinical-excellence/journal",
  },
  "/legal/privacy": {
    routeType: "legal",
    title: "Privacy Policy",
    description:
      "Lawon Bloom Fertility Centre's commitment to protecting your privacy and personal data.",
    path: "/legal/privacy",
  },
  "/legal/terms": {
    routeType: "legal",
    title: "Terms of Service",
    description:
      "The terms and conditions governing the provision of care and services at Lawon Bloom Fertility Centre.",
    path: "/legal/terms",
  },
  "/legal/ethics": {
    routeType: "legal",
    title: "Clinical Ethics",
    description:
      "The ethical framework guiding every clinical decision at Lawon Bloom Fertility Centre.",
    path: "/legal/ethics",
  },
};

export function pageMetadata(path: string): Metadata {
  const entry = SITE_PAGE_CATALOG[path];
  if (!entry) {
    throw new Error(`No SEO catalog entry for "${path}" — add it to lib/seo/catalog.ts`);
  }
  return buildMetadata(entry);
}
