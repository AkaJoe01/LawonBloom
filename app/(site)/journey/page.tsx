import type { Metadata } from "next";
import Timeline from "@/components/journey/Timeline";


export const metadata: Metadata = {
  alternates: { canonical: "/journey" },
};

export default function JourneyPage() {
    return (
        <main className="bg-surface text-foreground">
            <Timeline />
        </main>
    );
}