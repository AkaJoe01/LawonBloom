import type { Metadata } from "next";
import Hero from "@/components/sanctuaryServices/Hero";
import ServicesGrid from "@/components/sanctuaryServices/ServicesGrid";


export const metadata: Metadata = {
  alternates: { canonical: "/sanctuary/services" },
};

export default function SanctuaryServicesPage() {
    return (
        <main className="bg-surface text-foreground">
            <Hero />
            <ServicesGrid />
        </main>
    );
}