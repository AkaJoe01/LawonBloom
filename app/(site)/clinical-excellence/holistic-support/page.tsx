import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/clinicalExcellence/holisticSupport/Hero";
import ServicesSection from "@/components/clinicalExcellence/holisticSupport/ServicesSection";


export const metadata = pageMetadata("/clinical-excellence/holistic-support");

export default function HolisticSupportPage() {
  return (
    <div className="bg-surface text-foreground">
      <Hero />
      <ServicesSection />
    </div>
  );
}