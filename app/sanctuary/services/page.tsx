import Hero from "@/components/sanctuary/services/Hero";
import ServicesGrid from "@/components/sanctuary/services/ServicesGrid";

export default function SanctuaryServicesPage() {
    return (
        <main className="bg-surface text-foreground">
            <Hero />
            <ServicesGrid />
        </main>
    );
}