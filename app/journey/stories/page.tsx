import Hero from "@/components/journey/stories/Hero";
import Cinematic from "@/components/journey/stories/Cinematic";
import Families from "@/components/journey/stories/Families";

export default function JourneyStoriesPage() {
    return (
        <main className="bg-[#f5f2ee] text-[#2b2b2b]">
            <Hero />
            <Cinematic />
            <Families />
        </main>
    );
}
