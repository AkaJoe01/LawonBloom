import Hero from "@/components/conciergeContact/Hero";
import ConsultationForm from "@/components/conciergeContact/ConsultationForm";
import Location from "@/components/conciergeContact/Location";

export default function ConciergeContactPage(){
    return(
        <main className="bg-[#f5f2ee] text-[#2b2b2b]">
            <Hero />
            <ConsultationForm />
            <Location />
        </main>
    );
}