'use client';

import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="w-full">
      {/* 1. Hero Section: Cinematic Split */}
      <section className="relative min-h-screen flex items-stretch overflow-hidden bg-surface-container-lowest">
        <div className="grain-overlay"></div>
        <div className="w-full md:w-1/2 flex items-center justify-center px-20 z-20">
          <div className="max-w-xl">
            <span className="font-label-caps text-tertiary tracking-widest mb-8 block">
              The Architecture of Hope
            </span>
            <h1 className="font-display-hero text-primary mb-8 leading-none">
              Where Hope Blossoms into Life
            </h1>
            <p className="font-body-large text-on-surface-variant leading-relaxed opacity-90">
              Lawonbloom was born from a singular, quiet belief: that the journey to parenthood should be as beautiful as the destination itself. We have redefined reproductive care, transforming clinical anxiety into a serene, supportive sanctuary.
            </p>
            <div className="mt-12 flex gap-6 items-center">
              <div className="h-px w-24 bg-primary/30"></div>
              <span className="italic text-primary/60 text-lg">Founded on Grace & Precision</span>
            </div>
          </div>
        </div>
        <div className="hidden md:block w-1/2 relative hero-split-image overflow-hidden">
          <Image
            alt="Sanctuary Interior"
            src="/images/corridor.jpg"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
        </div>
      </section>

      {/* 2. Our Story: Asymmetrical Editorial */}
      <section className="py-40 px-20 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 md:col-span-6 mb-24 md:mb-0">
              <div className="md:sticky md:top-32">
                <h2 className="font-h1-editorial text-primary mb-12">
                  Our Founding Narrative
                </h2>
                <div className="space-y-8 max-w-lg">
                  <p className="font-body-large text-on-surface-variant">
                    In 1998, Lawonbloom was established with a singular vision: to marry the cold precision of high-science with the warmth of human sanctuary. What began as a boutique clinic has evolved into a global benchmark for reproductive excellence.
                  </p>
                  <p className="font-body-large text-on-surface-variant">
                    We believe that the environment is as vital as the embryology. Every curved corridor, every filtered ray of light, and every botanical element in our space is curated to lower cortisol and nurture the soul during the most delicate journey of your life.
                  </p>
                </div>
                <div className="mt-20 p-10 border border-primary/10 bg-surface-container-low rounded-2xl">
                  <h3 className="font-h2-subheading text-primary mb-4 italic">
                    The Visionary
                  </h3>
                  <p className="font-body-main text-on-surface-variant mb-6">
                    Dr. Olugbenga's philosophy stems from decades of international practice, recognizing that the missing element in modern fertility care was 'serenity'.
                  </p>
                  <span className="font-label-caps text-xs tracking-widest text-primary">
                    Chief Clinical Architect
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 md:col-start-8 space-y-32">
              <div className="relative">
                <Image
                  alt="Laboratory precision"
                  src="/images/microscope.jpg"
                  width={500}
                  height={400}
                  className="rounded-2xl shadow-2xl object-cover w-full"
                />
                <div className="absolute -bottom-10 -left-10 bg-white p-6 shadow-2xl max-w-xs">
                  <span className="block font-label-caps text-xs text-tertiary mb-2">
                    CHAPTER I
                  </span>
                  <p className="italic text-sm">
                    The first successful embryo transfer in the new sanctuary.
                  </p>
                </div>
              </div>

              <div className="relative translate-x-12">
                <Image
                  alt="Consultation room"
                  src="/images/lab.jpg"
                  width={500}
                  height={400}
                  className="rounded-2xl shadow-2xl object-cover w-full"
                />
                <div className="absolute -top-10 -right-10 bg-white p-6 shadow-2xl max-w-xs">
                  <span className="block font-label-caps text-xs text-tertiary mb-2">
                    CHAPTER II
                  </span>
                  <p className="italic text-sm">
                    Designing spaces where clinical anxiety dissolves into peace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clinical Philosophy: Scientific Serenity */}
      <section className="py-40 px-20 bg-surface-container-low relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <span className="font-label-caps text-primary/60 tracking-widest block mb-4">
              Our Methodology
            </span>
            <h2 className="font-h1-editorial text-primary mb-6">
              Scientific Serenity
            </h2>
            <p className="font-body-large text-on-surface-variant max-w-2xl mx-auto">
              Where advanced embryology meets an atmosphere of absolute calm.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Pioneering Precision */}
            <div className="col-span-12 md:col-span-4 group">
              <div className="h-full p-12 rounded-2xl glass-panel transition-all duration-500 hover:shadow-xl hover:bg-white/60 hover:-translate-y-2">
                <div className="w-12 h-12 flex items-center justify-center border border-primary/20 rounded-full mb-10 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="font-h2-subheading text-primary mb-6">
                  Pioneering Precision
                </h3>
                <p className="font-body-main text-on-surface-variant leading-relaxed opacity-80 mb-6">
                  Our class-10,000 cleanroom laboratories utilize next-generation AI-assisted embryology. By monitoring embryo development with Time-Lapse technology, we ensure the most stable environment possible.
                </p>
                <ul className="text-xs font-label-caps tracking-widest text-primary/60 space-y-2">
                  <li>• NEXT-GEN GENETICS</li>
                  <li>• AI MORPHOLOGY</li>
                  <li>• CRYOPRESERVATION</li>
                </ul>
              </div>
            </div>

            {/* Holistic Harmony */}
            <div className="col-span-12 md:col-span-4 group md:-translate-y-12">
              <div className="h-full p-12 rounded-2xl glass-panel transition-all duration-500 hover:shadow-xl hover:bg-white/60 hover:-translate-y-2">
                <div className="w-12 h-12 flex items-center justify-center border border-primary/20 rounded-full mb-10 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <span className="text-2xl">🧘</span>
                </div>
                <h3 className="font-h2-subheading text-primary mb-6">
                  Holistic Harmony
                </h3>
                <p className="font-body-main text-on-surface-variant leading-relaxed opacity-80 mb-6">
                  We treat the whole person, not just the diagnosis. Our integration of acupuncture, nutritional counseling, and mindfulness protocols is scientifically designed to optimize the uterine environment.
                </p>
                <ul className="text-xs font-label-caps tracking-widest text-primary/60 space-y-2">
                  <li>• NUTRITIONAL ALIGNMENT</li>
                  <li>• STRESS MITIGATION</li>
                  <li>• CIRCADIAN OPTIMIZATION</li>
                </ul>
              </div>
            </div>

            {/* Absolute Discretion */}
            <div className="col-span-12 md:col-span-4 group">
              <div className="h-full p-12 rounded-2xl glass-panel transition-all duration-500 hover:shadow-xl hover:bg-white/60 hover:-translate-y-2">
                <div className="w-12 h-12 flex items-center justify-center border border-primary/20 rounded-full mb-10 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="font-h2-subheading text-primary mb-6">
                  Absolute Discretion
                </h3>
                <p className="font-body-main text-on-surface-variant leading-relaxed opacity-80 mb-6">
                  For our global clientele, privacy is paramount. Our sanctuary features private entry protocols, encrypted communications, and personalized concierge services that manage every logistical detail of your stay.
                </p>
                <ul className="text-xs font-label-caps tracking-widest text-primary/60 space-y-2">
                  <li>• PRIVATE LOGISTICS</li>
                  <li>• ENCRYPTED PORTALS</li>
                  <li>• ANONYMOUS PROTOCOLS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Milestones: Decades of Mastery */}
      <section className="py-40 px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 md:col-span-4 mb-16 md:mb-0">
              <h2 className="font-h1-editorial text-primary mb-8 leading-tight">
                Decades of Mastery
              </h2>
              <p className="font-body-large text-on-surface-variant opacity-80">
                A legacy of clinical breakthroughs and thousands of families begun in our care.
              </p>
            </div>

            <div className="col-span-12 md:col-span-7 md:col-start-6">
              <div className="relative border-l border-primary/10 pl-12 space-y-24">
                {/* 1998 */}
                <div className="relative">
                  <div className="absolute -left-[0.6875rem] top-2 w-2 h-2 rounded-full bg-primary ring-8 ring-background"></div>
                  <span className="font-label-caps text-primary tracking-widest block mb-2">
                    1998 — FOUNDATION
                  </span>
                  <h4 className="font-h2-subheading text-xl mb-4 italic">
                    The Seed is Sown
                  </h4>
                  <p className="text-on-surface-variant max-w-md">
                    Opening of the first boutique clinic in Lagos, focusing on personalized patient experiences that were missing in the region.
                  </p>
                </div>

                {/* 2010 */}
                <div className="relative">
                  <div className="absolute -left-[0.6875rem] top-2 w-2 h-2 rounded-full bg-primary/40 ring-8 ring-background"></div>
                  <span className="font-label-caps text-primary tracking-widest block mb-2">
                    2010 — EXPANSION
                  </span>
                  <h4 className="font-h2-subheading text-xl mb-4 italic">
                    Global Accreditation
                  </h4>
                  <p className="text-on-surface-variant max-w-md">
                    Lawonbloom achieves international laboratory certifications, becoming a primary destination for the global African diaspora.
                  </p>
                </div>

                {/* 2022 */}
                <div className="relative">
                  <div className="absolute -left-[0.6875rem] top-2 w-2 h-2 rounded-full bg-primary/40 ring-8 ring-background"></div>
                  <span className="font-label-caps text-primary tracking-widest block mb-2">
                    2022 — INNOVATION
                  </span>
                  <h4 className="font-h2-subheading text-xl mb-4 italic">
                    The Digital Sanctuary
                  </h4>
                  <p className="text-on-surface-variant max-w-md">
                    Launch of our AI-integrated embryo monitoring system, setting new benchmarks for success rates in the continent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Global Excellence: The Lawonbloom Standard */}
      <section className="py-40 px-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-h1-editorial text-primary mb-16">
            The Lawonbloom Standard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-b border-primary/10 py-20">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-display text-primary mb-4">A+</span>
              <span className="font-label-caps text-xs tracking-widest text-tertiary">
                Global Accreditation
              </span>
              <p className="mt-4 text-sm italic text-on-surface-variant">
                Adhering to strict international embryology & ethics frameworks.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-5xl font-display text-primary mb-4">Elite</span>
              <span className="font-label-caps text-xs tracking-widest text-tertiary">
                Bespoke Concierge
              </span>
              <p className="mt-4 text-sm italic text-on-surface-variant">
                White-glove logistical support from touchdown to departure.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-5xl font-display text-primary mb-4">98%</span>
              <span className="font-label-caps text-xs tracking-widest text-tertiary">
                Patient Advocacy
              </span>
              <p className="mt-4 text-sm italic text-on-surface-variant">
                A testament to our commitment to the emotional journey.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <button className="px-12 py-5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-full hover:shadow-2xl transition-all">
              Download Sanctuary Prospectus
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}