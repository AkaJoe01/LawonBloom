import Hero from "@/components/fertilityPreservation/Hero";
import PrecisionSection from "@/components/fertilityPreservation/PrecisionSection";
import TimelineSection from "@/components/fertilityPreservation/TimelineSection";

export default function FertilityPreservationPage() {
    return(
        <main className="bg-[f5f2ee] text-[#2b2b2b] overflow-hidden">
            <Hero />
            <PrecisionSection />
            <TimelineSection />
        </main>
    );
}