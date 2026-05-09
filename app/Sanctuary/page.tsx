import Hero from "@/app/components/Sanctuary/Hero";
import VisionMission from "@/app/components/Sanctuary/VisionMission";
import Serenity from "@/app/components/Sanctuary/Serenity";

export default function SanctuaryPage() {
    return(
        <main className="bg-[f5f2ee] text-[#2b2b2b]">
            <Hero />
            <VisionMission />
            <Serenity />
        </main>
    );
}