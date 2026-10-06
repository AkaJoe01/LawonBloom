import type { Metadata } from "next";
import Hero from "@/components/clinicalExcellence/ivf/Hero";
import ProcessSection from "@/components/clinicalExcellence/ivf/ProcessSection";


export const metadata: Metadata = {
  alternates: { canonical: "/clinical-excellence/ivf" },
};

export default function IVFPage() {
  return (
    <div className="bg-surface text-foreground">
      <Hero />
      <ProcessSection />
    </div>
  );
}