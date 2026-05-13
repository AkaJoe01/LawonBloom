import Hero from "@/components/clinicalExcellence/Hero";
import Services from "@/components/clinicalExcellence/Services";

export default function ClinicalExcellencePage() {
    return(
        <main className="bg-[f5f2ee] text-[#2b2b2b] overflow-hidden">
            <Hero />
            <Services />
        </main>
    );
}