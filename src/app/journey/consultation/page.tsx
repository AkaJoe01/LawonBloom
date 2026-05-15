import Hero from "@/components/journey/consultation/Hero";
import Specialists from "@/components/journey/consultation/Specialists";
import VisitPrep from "@/components/journey/consultation/VisitPrep";

export default function JourneyConsultationPage() {
    return (
        <main className="bg-[#f5f2ee] text-[#2b2b2b]">
            <Hero />
            <Specialists />
            <VisitPrep />
        </main>
    );
}
