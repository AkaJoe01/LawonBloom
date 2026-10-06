import type { Metadata } from "next";
import Hero from "@/components/concierge/Hero";
import Services from "@/components/concierge/Services";


export const metadata: Metadata = {
  alternates: { canonical: "/concierge" },
};

export default function ConciergePage(){
    return(
        <main className="bg-surface text-foreground">
            <Hero />
            <Services />
        </main>
    );
}