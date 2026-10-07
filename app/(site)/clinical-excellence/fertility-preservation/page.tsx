import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/fertilityPreservation/Hero";
import PrecisionSection from "@/components/fertilityPreservation/PrecisionSection";
import TimelineSection from "@/components/fertilityPreservation/TimelineSection";


export const metadata = pageMetadata("/clinical-excellence/fertility-preservation");

export default function FertilityPreservationPage() {
    return(
        <main className="bg-surface text-foreground">
            <Hero />
            <PrecisionSection />
            <TimelineSection />
        </main>
    );
}