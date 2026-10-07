import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/journeyStories/Hero";
import Cinematic from "@/components/journeyStories/Cinematic";
import Families from "@/components/journeyStories/Families";


export const metadata = pageMetadata("/journey/stories");

export default function JourneyStoriesPage() {
    return (
        <main className="bg-surface text-foreground">
            <Hero />
            <Cinematic />
            <Families />
        </main>
    );
}