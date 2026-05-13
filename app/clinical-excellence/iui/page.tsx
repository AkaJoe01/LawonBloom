import Hero from "@/components/iui/Hero";
import CandidateSection from "@/components/iui/CandidatesSection";
import SequenceSection from "@/components/iui/SequenceSection";

export default function IUIPage(){
    return(
        <main className="bg-[#f5f2ee] text-[#2b2b2b] overflow-hidden">
             <Hero />
             <CandidateSection />
             <SequenceSection />
        </main>
    );
}