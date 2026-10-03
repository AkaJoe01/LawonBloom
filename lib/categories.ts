export interface CategorySeed {
  slug: string;
  name: string;
  description: string;
}

export const CATEGORIES: readonly CategorySeed[] = [
  {
    slug: "ivf",
    name: "IVF",
    description: "In-vitro fertilization cycles, protocols, and patient guidance.",
  },
  {
    slug: "iui",
    name: "IUI",
    description: "Intrauterine insemination: indications, process, and outcomes.",
  },
  {
    slug: "fertility-preservation",
    name: "Fertility Preservation",
    description: "Egg, sperm, and embryo freezing for medical or personal readiness.",
  },
  {
    slug: "genetic-testing",
    name: "Genetic Testing",
    description: "PGT-A, PGT-M, and PGT-SR counseling and laboratory insight.",
  },
  {
    slug: "holistic-support",
    name: "Holistic Support",
    description: "Wellness, nutrition, and mind-body support during treatment.",
  },
  {
    slug: "patient-stories",
    name: "Patient Stories",
    description: "Journeys, milestones, and perspectives from our community.",
  },
] as const;
