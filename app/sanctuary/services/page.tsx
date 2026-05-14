import Hero from "@/components/sanctuary/services/Hero";
import ServicesGrid from "@/components/sanctuary/services/ServicesGrid";

export default function SanctuaryServicesPage() {
    return (
        <main className="bg-[#f5f2ee] text-[#2b2b2b]">
            <Hero />
            <ServicesGrid />
        </main>
    );
}