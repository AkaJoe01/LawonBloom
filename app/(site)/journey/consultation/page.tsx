import type { Metadata } from "next";
import Hero from "@/components/journey/consultation/Hero";
import BookingFlow from "@/components/journey/consultation/BookingFlow";
import VisitPrep from "@/components/journey/consultation/VisitPrep";


export const metadata: Metadata = {
  alternates: { canonical: "/journey/consultation" },
};

export default function JourneyConsultationPage() {
  return (
    <div className="bg-surface">
      <Hero />
      <BookingFlow />
      <VisitPrep />
    </div>
  );
}