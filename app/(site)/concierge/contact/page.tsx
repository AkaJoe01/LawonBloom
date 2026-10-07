import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/conciergeContact/Hero";
import Location from "@/components/conciergeContact/Location";


export const metadata = pageMetadata("/concierge/contact");

export default function ConciergeContactPage(){
    return(
        <main className="bg-surface text-foreground">
            <Hero />
            <Location />
        </main>
    );
}