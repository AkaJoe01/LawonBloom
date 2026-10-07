import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/sanctuary/Hero";
import VisionMission from "@/components/sanctuary/VisionMission";
import Serenity from "@/components/sanctuary/Serenity";


export const metadata = pageMetadata("/sanctuary");

export default function SanctuaryPage() {
    return(
        <main className="bg-surface text-foreground">
            <Hero />
            <VisionMission />
            <Serenity />
        </main>
    );
}