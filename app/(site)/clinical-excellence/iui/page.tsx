import Hero from "@/components/iui/Hero";
import CandidateSection from "@/components/iui/CandidatesSection";
import SequenceSection from "@/components/iui/SequenceSection";

export default function IUIPage(){
    return(
        <main className="bg-surface text-foreground">
             <Hero />
             <CandidateSection />
             <SequenceSection />
        </main>
    );
}