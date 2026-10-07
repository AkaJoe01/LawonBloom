import { pageMetadata } from "@/lib/seo";
import Timeline from "@/components/journey/Timeline";


export const metadata = pageMetadata("/journey");

export default function JourneyPage() {
    return (
        <main className="bg-surface text-foreground">
            <Timeline />
        </main>
    );
}