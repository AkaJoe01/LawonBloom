import type { Metadata } from "next";
import Hero from "@/components/sanctuary/services/surrogacy/Hero";
import ServicesSection from "@/components/sanctuary/services/surrogacy/ServicesSection";


export const metadata: Metadata = {
  alternates: { canonical: "/sanctuary/services/surrogacy" },
};

export default function SurrogacyPage() {
  return (
    <div className="bg-surface text-foreground">
      <Hero />
      <ServicesSection />
    </div>
  );
}