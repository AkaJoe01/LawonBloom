import Hero from "@/components/journey/consultation/Hero";
import BookingFlow from "@/components/journey/consultation/BookingFlow";
import VisitPrep from "@/components/journey/consultation/VisitPrep";

export default function JourneyConsultationPage() {
  return (
    <div className="bg-surface">
      <Hero />
      <BookingFlow />
      <VisitPrep />
    </div>
  );
}
