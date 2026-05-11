import Hero from "@/components/journeyStories/Hero";
import Cinematic from "@/components/journeyStories/Cinematic";
import Families from "@/components/journeyStories/Families";

export default function JourneyStoriesPage() {
  return (
    <main className="bg-[#f5f2ee] text-[#2b2b2b]">
      <Hero />
      <Cinematic />
      <Families />
    </main>
  );
}