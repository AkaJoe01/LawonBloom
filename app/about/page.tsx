import Hero from "@/components/about/Hero";
import Sanctum from "@/components/about/Sanctum";
import Technology from "@/components/about/Technology";

export default function AboutPage() {
    return (
        <main className="bg-[#f5f2ee] text-[#2b2b2b]">
            <Hero />
            <Sanctum />
            <Technology />
        </main>
    );
}