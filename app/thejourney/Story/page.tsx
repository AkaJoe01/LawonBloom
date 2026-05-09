import Hero from "../../components/JourneyStories/Hero";
import Cinematic from "../../components/JourneyStories/Cinematic";
import Families from "../../components/JourneyStories/Families";

export default function JourneyStoriesPage() {
  return (
    <main className="bg-[#f5f2ee] text-[#2b2b2b]">
      <Hero />
      <Cinematic />
      <Families />
    </main>
  );
}