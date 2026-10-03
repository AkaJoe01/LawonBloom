import Hero from "@/components/concierge/Hero";
import Services from "@/components/concierge/Services";

export default function ConciergePage(){
    return(
        <main className="bg-surface text-foreground">
            <Hero />
            <Services />
        </main>
    );
}