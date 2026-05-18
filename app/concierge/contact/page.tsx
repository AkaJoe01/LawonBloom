import Hero from "@/components/conciergeContact/Hero";
import ConsultationForm from "@/components/conciergeContact/ConsultationForm";
import Location from "@/components/conciergeContact/Location";

export default function ConciergeContactPage(){
    return(
        <main className="bg-surface text-foreground">
            <Hero />
            <ConsultationForm />
            <Location />
        </main>
    );
}