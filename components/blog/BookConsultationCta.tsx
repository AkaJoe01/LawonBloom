import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";

export default function BookConsultationCta() {
  return (
    <section
      aria-label="Book a consultation"
      className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 text-center md:p-8"
    >
      <h2 className="font-serif text-2xl text-foreground md:text-3xl">
        Want to talk this through with a specialist?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant">
        Every journey is individual. Book a consultation with the Lawon Bloom team, or call us
        directly — whichever feels easier.
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/journey/consultation"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <CalendarDays size={16} aria-hidden="true" />
          Book a consultation
        </Link>
        <a
          href="tel:+2349132504126"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant px-6 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Phone size={16} aria-hidden="true" />
          +234 913 250 4126
        </a>
      </div>
    </section>
  );
}
