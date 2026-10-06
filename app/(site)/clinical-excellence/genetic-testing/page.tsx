import type { Metadata } from "next";
import Hero from "@/components/clinicalExcellence/geneticTesting/Hero";
import ServicesSection from "@/components/clinicalExcellence/geneticTesting/ServicesSection";


export const metadata: Metadata = {
  alternates: { canonical: "/clinical-excellence/genetic-testing" },
};

export default function GeneticTestingPage() {
  return (
    <div className="bg-surface text-foreground">
      <Hero />
      <ServicesSection />
    </div>
  );
}