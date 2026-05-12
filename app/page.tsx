import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Baby,
    Dna,
    Microscope,
    Quote,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const services = [
    {
        title: "In Vitro Fertilization (IVF)",
        description:
            "Our cornerstone program, utilizing world-class embryology, state-of-the-art incubation, and highly personalized stimulation protocols.",
        image: "/images/microscope.jpg",
        icon: Microscope,
        tone: "from-primary/15 to-surface",
    },
    {
        title: "Oocyte Preservation",
        description:
            "Securing your future timeline with advanced vitrification techniques, empowering your choices on your own terms.",
        image: "/images/lab.jpg",
        icon: ShieldCheck,
        tone: "from-rose-200/20 to-surface",
    },
    {
        title: "IUI Protocols",
        description:
            "Minimally invasive beginnings. A supportive, precisely timed approach for natural conception assistance.",
        image: "/images/probe.jpg",
        icon: Baby,
        tone: "from-secondary/15 to-surface",
    },
    {
        title: "Advanced Genetic Screening",
        description:
            "Precision medicine (PGT-A/PGT-M) ensuring the highest viability and peace of mind before transfer, mapping a healthy future.",
        image: "/images/scan.jpg",
        icon: Dna,
        tone: "from-tertiary/15 to-surface",
    },
];

const milestones = [
    {
        label: "Innovation",
        title: "Pioneering Protocols",
        description:
            "Implementation of AI-assisted embryo selection, increasing success rates significantly across demographics.",
        accent: "bg-primary",
    },
    {
        label: "Facilities",
        title: "Next-Gen Laboratory",
        description:
            "Establishment of a Class 100 cleanroom embryology lab, setting new standards for environmental purity.",
        accent: "bg-outline-variant",
    },
    {
        label: "Global Reach",
        title: "International Concierge",
        description:
            "Launch of our global patient program, seamlessly coordinating cross-border care and legal logistics.",
        accent: "bg-outline-variant",
    },
];

export default function HomePage() {
    return (
        <>
            <section className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(251,249,246,0.98)_0%,rgba(251,249,246,0.94)_45%,rgba(245,243,240,1)_100%)]">
                <div className="grain-overlay" />
                <div className="mx-auto grid max-w-360 gap-10 px-6 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-20 lg:py-16">
                    <div className="flex flex-col justify-center lg:min-h-[calc(100vh-112px)]">
                        <p className="section-label mb-6 flex items-center gap-4 text-primary">
                            <span className="h-px w-8 bg-primary" />
                            The Pinnacle of Care
                        </p>
                        <h1 className="font-display text-6xl leading-[0.98] tracking-tight text-foreground sm:text-7xl lg:text-[5.5rem]">
                            <span className="block">Restoring</span>
                            <span className="block italic text-primary">Hope.</span>
                            <span className="block">Creating</span>
                            <span className="block italic text-outline">Families.</span>
                        </h1>
                        <p className="mt-8 max-w-xl text-lg leading-8 text-on-surface-variant">
                            An elite sanctuary for reproductive health, combining clinical mastery with a profoundly private, concierge-level experience. Where science meets serenity.
                        </p>
                        <div className="mt-12 flex flex-wrap gap-4">
                            <Link href="#sanctuary" className="btn-glow-primary inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-on-primary transition-transform duration-300 hover:-translate-y-0.5">
                                Consult With Us
                            </Link>
                            <Link href="#services" className="inline-flex items-center justify-center rounded-full border border-outline-variant bg-surface/80 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary">
                                Explore Services
                            </Link>
                        </div>
                    </div>

                    <div className="relative min-h-130 overflow-hidden rounded-4xl cinematic-shadow lg:min-h-190">
                        <Image
                            src="/images/corridor.jpg"
                            alt="Serene clinic interior"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,249,246,0.94)_0%,rgba(251,249,246,0.16)_40%,rgba(251,249,246,0.08)_100%)]" />
                        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,rgba(251,249,246,0)_0%,rgba(251,249,246,0.92)_100%)]" />
                        <div className="absolute bottom-6 left-6 right-6 grid gap-4 sm:left-auto sm:right-6 sm:max-w-sm">
                            <div className="glass-panel rounded-3xl p-4 backdrop-blur-2xl">
                                <p className="section-label text-primary">Private reception</p>
                                <p className="mt-2 text-sm leading-6 text-on-surface-variant">A quiet welcome designed to remove the feeling of clinical rush and replace it with calm, deliberate care.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="sanctuary" className="relative overflow-hidden bg-surface-bright px-6 py-20 lg:px-20 lg:py-28">
                <div className="elegant-divider absolute left-0 top-0 w-full" />
                <div className="mx-auto grid max-w-360 items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
                    <div className="relative">
                        <div className="relative aspect-4/5 overflow-hidden rounded-4xl cinematic-shadow">
                            <Image
                                src="/images/bed.jpg"
                                alt="Soft sunlight in clinic room"
                                fill
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover object-center"
                            />
                        </div>
                        <div className="absolute -bottom-8 -right-6 glass-panel rounded-2xl px-5 py-4 backdrop-blur-2xl">
                            <p className="section-label text-primary">Concierge privacy</p>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-on-surface-variant">Every route, room, and handoff is designed to keep the experience discreet and reassuring.</p>
                        </div>
                    </div>

                    <div className="max-w-2xl">
                        <p className="section-label mb-4 text-primary">Our sanctuary</p>
                        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.3rem]">
                            A Sanctuary Dedicated to <span className="italic text-primary">Your Beginning.</span>
                        </h2>
                        <p className="mt-8 border-l-2 border-primary/30 pl-6 text-2xl font-light italic leading-[1.4] text-on-surface-variant">
                            &quot;We believe that the journey to parenthood should be enveloped in grace, absolute privacy, and the highest echelon of clinical precision.&quot;
                        </p>
                        <div className="mt-8 space-y-6 text-base leading-8 text-on-surface-variant lg:text-lg">
                            <p>
                                Our mission transcends traditional medical care. At Lawonbloom, we curate an environment where profound medical expertise meets a calming, luxurious aesthetic. Every detail of our sanctuary is designed to reduce the clinical burden and elevate your emotional wellbeing.
                            </p>
                            <p>
                                From world-class embryology labs hidden behind serene architectural curves, to bespoke concierge services managing your every need, we are committed to making your journey as beautiful as the destination.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="section-label text-primary">Signature care</p>
                                <p className="text-sm text-on-surface-variant">Concierge-level support from consultation through every clinical milestone.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="services" className="relative bg-surface-container-low px-6 py-20 lg:px-20 lg:py-28">
                <div className="elegant-divider absolute left-0 top-0 w-full" />
                <div className="mx-auto max-w-360">
                    <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <p className="section-label mb-4 text-primary">Core services</p>
                            <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.3rem]">Pathways to Parenthood</h2>
                            <p className="mt-5 text-lg leading-8 text-on-surface-variant">Tailored clinical excellence wrapped in an environment of absolute serenity and support. Discover our specialized programs designed for your unique journey.</p>
                        </div>
                        <Link href="#authority" className="section-label inline-flex items-center gap-2 self-start border-b border-primary pb-1 text-primary transition-colors hover:text-foreground md:self-auto">
                            View clinical authority
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 auto-rows-[320px] lg:auto-rows-[340px]">
                        {services.map((service, index) => {
                            const Icon = service.icon;

                            return (
                                <article
                                    key={service.title}
                                    className={`bento-card glass-panel group relative overflow-hidden rounded-4xl border border-outline-variant/40 p-8 shadow-[0_14px_42px_-18px_rgba(138,72,83,0.24)] ${index === 0 || index === 3 ? "md:col-span-7" : "md:col-span-5"}`}
                                >
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 45vw"
                                        className="bento-bg-reveal object-cover object-center opacity-0 transition duration-700 group-hover:opacity-20"
                                    />
                                      <div className={`absolute inset-0 bg-linear-to-t ${service.tone} via-surface-bright/70 to-transparent`} />
                                    <div className="relative z-10 flex h-full flex-col justify-end bento-content">
                                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-sm">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-display text-3xl leading-tight text-foreground transition-colors group-hover:text-primary">
                                            {service.title}
                                        </h3>
                                        <p className="mt-4 max-w-xl text-base leading-7 text-on-surface-variant">{service.description}</p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="authority" className="relative bg-surface-bright px-6 py-20 lg:px-20 lg:py-28">
                <div className="mx-auto grid max-w-360 items-start gap-14 lg:grid-cols-[0.42fr_0.58fr] lg:gap-20">
                    <div className="sticky top-28">
                        <div className="relative aspect-3/4 overflow-hidden rounded-4xl cinematic-shadow">
                            <Image
                                src="/images/maleDr.jpg"
                                alt="Medical director portrait"
                                fill
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="glass-panel absolute -bottom-6 -right-4 rounded-2xl px-6 py-5 backdrop-blur-2xl lg:-right-8">
                            <p className="font-display text-xl italic text-primary">Dr. Olugbenga</p>
                            <p className="section-label mt-2 text-on-surface-variant">Medical Director</p>
                        </div>
                    </div>

                    <div className="pt-4 lg:pt-10">
                        <p className="section-label mb-4 text-primary">Clinical authority</p>
                        <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.3rem]">
                            Decades of Mastery. <span className="italic text-outline">A Legacy of Life.</span>
                        </h2>
                        <p className="mt-8 max-w-2xl text-lg leading-8 text-on-surface-variant">
                            Led by international pioneers in reproductive endocrinology, our clinical team brings decades of rigorous academic research and practical mastery to your bespoke care plan.
                        </p>

                        <div className="relative mt-14 space-y-10 before:absolute before:left-6 before:top-0 before:h-full before:w-px before:bg-[linear-gradient(to_bottom,transparent,rgba(215,193,195,1),transparent)] md:before:left-1/2 md:before:-translate-x-px">
                            {milestones.map((milestone, index) => (
                                <div key={milestone.title} className={`relative flex items-start gap-6 md:gap-0 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                                    <div className="relative z-10 flex h-3 w-3 shrink-0 items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2 md:translate-y-6">
                                        <span className={`h-3 w-3 rounded-full ${milestone.accent} ring-4 ring-surface-bright`} />
                                    </div>
                                    <div className="w-full rounded-[1.6rem] border border-outline-variant/30 bg-surface-container-low px-6 py-6 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.28)] md:w-[calc(50%-2rem)]">
                                        <p className="section-label text-primary">{milestone.label}</p>
                                        <h3 className="mt-2 font-display text-3xl text-foreground">{milestone.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-on-surface-variant">{milestone.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="stories" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-20 lg:px-20 lg:py-32">
                <div className="absolute inset-0">
                    <Image src="/images/family.jpg" alt="Family moment" fill sizes="100vw" className="object-cover object-center" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,249,246,0.72)_0%,rgba(251,249,246,0.18)_45%,rgba(251,249,246,0.72)_100%)]" />
                    <div className="absolute inset-0 bg-surface-container-highest/35 backdrop-blur-sm mix-blend-multiply" />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl rounded-[2.5rem] border border-white/40 bg-[rgba(251,249,246,0.72)] p-8 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.25)] backdrop-blur-2xl lg:p-14">
                    <Quote className="mx-auto h-10 w-10 text-primary/70" />
                    <h2 className="mt-8 font-display text-3xl italic leading-tight text-foreground sm:text-4xl lg:text-5xl">
                        &quot;After years of clinical heartbreak, Lawonbloom didn&apos;t just offer us medical excellence; they offered us a sanctuary. They held our hands, respected our privacy, and ultimately, gave us our family.&quot;
                    </h2>
                    <p className="mt-8 section-label text-center text-primary">The S. Family — London, UK</p>
                    <div className="mt-10 flex justify-center">
                        <Link href="/journey/stories" className="inline-flex items-center gap-2 rounded-full border border-primary px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-on-primary">
                            Read Success Stories
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}