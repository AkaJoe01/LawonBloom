import Hero from "@/components/concierge/Hero";
import Services from "@/components/concierge/Services";

export default function ConciergePage(){
    return(
        <main className="bg-[#f5f2ee] text-[#2b2b2b]">
            <Hero />
            <Services />
        </main>
    );
}