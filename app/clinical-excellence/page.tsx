import { ArrowRight, Wind, Thermometer, Shield } from "lucide-react";

export const metadata = {
    title: "Clinical Excellence | Lawonbloom",
    description: "The Science of New Beginnings. Where uncompromising technological precision meets profound human empathy.",
};

export default function ClinicalExcellencePage() {
    return (
        <div className="w-full flex flex-col relative">
            <style dangerouslySetInnerHTML={{
                __html: `
                .film-grain {
                    position: relative;
                }
                .film-grain::before {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 10;
                }
                .ambient-shadow {
                    box-shadow: 0 20px 60px -10px rgba(27, 28, 26, 0.05);
                }
            `}} />
            
            <div className="film-grain"></div>

            {/* Hero Section */}
            <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-32">
                <div className="absolute inset-0 z-0">
                    <img 
                        alt="Immersive laboratory scene" 
                        className="w-full h-full object-cover filter blur-[2px] scale-105" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB29wWouNcZyo8wjoxgLjNNLz157KoG7wXNg36vuqGQIRAS_4PHC_3s2k2UXCTLA3MumBRDE91ni7qkTy8eO4vmw7PC7PRZNCmg_oLI-d77tzdBxabe1q1qgLpeeG3qUb7r1Z9-Tm9Zm36By1UqudfpwAdb3fKATtTWzylBzNmNqGhSecsgSHHcdIN8FfQiz2AMGdjMu8N2KIHZZ5MSozXJg58WSWQCVegFjZiRke8g5brKkhnZzLIu0SyV0qKcFhV9fVfQPjC84Nu4"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background"></div>
                </div>
                <div className="relative z-10 max-w-360 mx-auto px-6 lg:px-16 text-center flex flex-col items-center">
                    <span className="font-label-caps text-primary tracking-[0.2em] uppercase mb-8 opacity-80">Clinical Excellence</span>
                    <h1 className="font-display text-5xl leading-[0.95] text-on-surface sm:text-6xl md:text-7xl lg:text-[84px] lg:leading-[1.1] mb-8 max-w-4xl mx-auto drop-shadow-sm">The Science of New Beginnings</h1>
                    <p className="font-body-large text-on-surface-variant max-w-2xl mx-auto mb-12">
                        Where uncompromising technological precision meets profound human empathy. Our laboratory is designed as a sanctuary for life's most delicate origins.
                    </p>
                    <button className="bg-primary text-on-primary font-h2-subheading text-[18px] py-4 px-10 rounded-full hover:bg-surface-tint transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Explore Our Methods
                    </button>
                </div>
                
                {/* Scroll indicator */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-60">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-primary to-transparent"></div>
                </div>
            </section>

            {/* Section 1: Pioneering Technology */}
            <section className="py-20 relative bg-surface-bright z-10 lg:py-32">
                <div className="max-w-360 mx-auto px-6 lg:px-16">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 items-end">
                        <div className="col-span-1 md:col-span-5">
                            <h2 className="font-h1-editorial text-on-surface mb-6">Pioneering Technology</h2>
                        </div>
                        <div className="col-span-1 md:col-span-6 md:col-start-7">
                            <p className="font-body-large text-on-surface-variant">
                                We deploy world-class reproductive technology not as cold machinery, but as precise instruments of hope, housed within an environment designed for ultimate stability and calm.
                            </p>
                        </div>
                    </div>

                    {/* Staggered Layout */}
                    <div className="space-y-40">
                        {/* Feature 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                            <div className="col-span-1 md:col-span-5 order-2 md:order-1 relative z-10">
                                <div className="glass-panel p-12 rounded-xl md:-mr-16 mt-16 md:mt-0 relative">
                                    <span className="font-h2-subheading text-primary block mb-4 opacity-50">01</span>
                                    <h3 className="font-h2-subheading text-on-surface mb-4">Precision IVF Cultivation</h3>
                                    <div className="elegant-divider w-12 mb-6"></div>
                                    <p className="text-base text-on-surface-variant mb-8">
                                        Our bespoke culture media and highly regulated environmental controls mimic the natural womb with unprecedented accuracy, minimizing stress on developing embryos.
                                    </p>
                                    <a href="/journey" className="inline-flex items-center text-primary font-label-caps uppercase hover:text-surface-tint transition-colors">
                                        Discover the process <ArrowRight className="ml-2 w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-7 order-1 md:order-2">
                                <div className="relative w-full aspect-4/3 rounded-sm overflow-hidden ambient-shadow">
                                    <img 
                                        alt="Precision IVF Cultivation" 
                                        className="w-full h-full object-cover" 
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTDkugOfP0d8kRyq9-8EhyZwzOl6mNKCTte-eW4kuSbq-hfRJAfIa8_Q6Qs5qCQOW0gcMlqEnY4JD1pjLv2tYLA4Kc7U0-zFwxO36Ivv9V8SZNbySThr5TveXBMYZ_XCFNuu-Y_9Ri0UrQHX_uN8bpNf6wmGWKj9z69j_cuO2Yxa2Sh_LKC7nSaP2qHgp99kKurX_LNu890eWZLHRdNIK1wCYowYGY1c9VP6YV3jXMxxg8Oja1BzP16qQXR-XeEfPk5PukgDi66J3L"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                            <div className="col-span-1 md:col-span-7">
                                <div className="relative w-full aspect-4/3 rounded-sm overflow-hidden ambient-shadow">
                                    <img 
                                        alt="Time-Lapse Incubation" 
                                        className="w-full h-full object-cover" 
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBH-gqlu1myKy4N3-0rUg-pdLNqOOCI3YTOwk5MbCzOF-9uop-r0pQ7XFHjtAcmxH1qK79bWBXqI_fWacYxpUbDZmvHagrJnGsRRH7YoD0gEEaKH-VB5Eq5MdQ2ktAIUnJ34MxlZOUL44zEfPQsjiGzktWNvTXCEkKkV3OR0H4sadtvjWPTc6qKPfF5pAO1ThMtDDSuNp-pxBSFycoMwwsz9L5n9u8jTS0M9Y0h1tYaEruvXIV8nrQ62_tRfl2iVuwVALEeZyeeaq1"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-5 relative z-10">
                                <div className="glass-panel p-12 rounded-xl md:-ml-16 mt-16 md:mt-0 relative">
                                    <span className="font-h2-subheading text-primary block mb-4 opacity-50">02</span>
                                    <h3 className="font-h2-subheading text-on-surface mb-4">Time-Lapse Incubation</h3>
                                    <div className="elegant-divider w-12 mb-6"></div>
                                    <p className="text-base text-on-surface-variant mb-8">
                                        Continuous, undisturbed monitoring allows our clinical team to observe critical developmental milestones in real-time, drastically improving selection accuracy without disrupting the delicate microenvironment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: The Lab Sanctuary */}
            <section className="py-20 relative bg-surface-container-low border-t border-outline-variant/30 z-10 lg:py-32">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noiseFilter\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.85\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noiseFilter)\\'/%3E%3C/svg%3E')"}}></div>
                
                <div className="max-w-360 mx-auto px-6 lg:px-16">
                    <div className="text-center mb-24 relative z-10">
                        <h2 className="font-display-hero text-[64px] md:text-display-hero text-on-surface leading-tight tracking-tight mb-6">The Lab Sanctuary</h2>
                        <div className="elegant-divider w-24 mx-auto mb-8"></div>
                        <p className="font-body-large text-on-surface-variant max-w-3xl mx-auto">
                            Beyond standard medical safety, our environment is engineered to shield against microscopic variances in air quality, temperature, and light.
                        </p>
                    </div>

                    {/* Bento Grid / Floating Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="bg-surface p-10 rounded-lg border border-outline-variant/20 hover:border-primary/30 transition-colors duration-500 ambient-shadow flex flex-col justify-between h-full group">
                            <div>
                                <Wind className="w-8 h-8 text-primary mb-6" strokeWidth={1.5} />
                                <h4 className="font-h2-subheading text-on-surface mb-4">ISO Class 5 Air Purity</h4>
                                <p className="text-base text-on-surface-variant">
                                    Advanced HEPA and VOC filtration systems run continuously, ensuring the air inside the sanctuary is orders of magnitude cleaner than a standard operating theater.
                                </p>
                            </div>
                            <div className="mt-12 h-[1px] w-0 bg-primary group-hover:w-full transition-all duration-700 ease-in-out"></div>
                        </div>
                        
                        <div className="bg-surface p-10 rounded-lg border border-outline-variant/20 hover:border-primary/30 transition-colors duration-500 ambient-shadow flex flex-col justify-between h-full group md:translate-y-8">
                            <div>
                                <Thermometer className="w-8 h-8 text-primary mb-6" strokeWidth={1.5} />
                                <h4 className="font-h2-subheading text-on-surface mb-4">Thermal Stability</h4>
                                <p className="text-base text-on-surface-variant">
                                    Multi-redundant temperature control systems guarantee absolute thermal consistency, down to a fraction of a degree, preventing any cellular stress.
                                </p>
                            </div>
                            <div className="mt-12 h-[1px] w-0 bg-primary group-hover:w-full transition-all duration-700 ease-in-out"></div>
                        </div>
                        
                        <div className="bg-surface p-10 rounded-lg border border-outline-variant/20 hover:border-primary/30 transition-colors duration-500 ambient-shadow flex flex-col justify-between h-full group">
                            <div>
                                <Shield className="w-8 h-8 text-primary mb-6" strokeWidth={1.5} />
                                <h4 className="font-h2-subheading text-on-surface mb-4">Unwavering Security</h4>
                                <p className="text-base text-on-surface-variant">
                                    Every sample is protected by state-of-the-art RFID tracking, biometric access controls, and off-grid power backups to ensure complete safety at all times.
                                </p>
                            </div>
                            <div className="mt-12 h-[1px] w-0 bg-primary group-hover:w-full transition-all duration-700 ease-in-out"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}