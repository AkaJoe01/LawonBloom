import type { Metadata } from "next";
import Hero from "@/components/conciergeContact/Hero";
import Location from "@/components/conciergeContact/Location";


export const metadata: Metadata = {
  alternates: { canonical: "/concierge/contact" },
};

export default function ConciergeContactPage(){
    return(
        <main className="bg-surface text-foreground">
            <Hero />
            <Location />
        </main>
    );
}