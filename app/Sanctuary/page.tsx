import Hero from "@/components/sanctuary/Hero";
import VisionMission from "@/components/sanctuary/VisionMission";
import Serenity from "@/components/sanctuary/Serenity";

export default function SanctuaryPage() {
    return(
        <main className="bg-[#f5f2ee] text-[#2b2b2b]">
            <Hero />
            <VisionMission />
            <Serenity />
        </main>
    );
}