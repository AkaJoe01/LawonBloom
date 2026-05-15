import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "The Path to Parenthood - Lawonbloom",
    description: "Your journey to parenthood illuminated.",
};

export default function PathPage() {
    return (
        <div className="w-full flex flex-col relative">
            {/* Ambient shadow utility for the Luminous Sanctuary aesthetic */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .ambient-shadow {
                    box-shadow: 0 40px 60px -10px rgba(82, 67, 69, 0.08);
                }
                .film-grain {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none;
                    z-index: 10;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
                }
            `}} />
            
            <div className="film-grain"></div>

            {/* Hero Section */}
            <section className="relative w-full min-h-[921px] flex items-end justify-center pb-32 px-6 lg:px-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        alt="Your Journey, Illuminated" 
                        className="w-full h-full object-cover object-center" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM4SADsE6L9rvRL0FIgw96kinwpE8lHV1PcU3EljyHJmQZK2Ad8704NHqCupdl1GCLdfKPv96D4crOalbh_k_hn7aEkx1wnDUwJnw1uHJ2WmhuYXwkwcBK3gAtngcy4QyoLObYyE822k3qpKJNn8t8GxRJF7MTwf96BaxKKoilM7J_Lq4vj84iQx2QFh-cJ3G9RswDrwAAWDRbGFwQ6yvxtJdVOxIsu9rkak9RFMtrZjm21Kk0AjfOBI92N64I1OETURM7HKS8-UJC"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                </div>
                <div className="relative z-10 w-full max-w-360 flex flex-col items-center text-center mt-32">
                    <span className="font-label-caps text-on-surface-variant uppercase tracking-widest mb-6">The Path to Parenthood</span>
                    <h1 className="font-display-hero text-on-surface max-w-4xl text-balance">Your Journey, Illuminated</h1>
                </div>
            </section>

            {/* Stage 1: Consultation */}
            <section className="w-full py-32 px-6 lg:px-16 relative z-10">
                <div className="max-w-360 mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="col-span-1 md:col-span-7 relative">
                        <div className="w-full h-[819px] overflow-hidden rounded-sm relative">
                            <img 
                                alt="Consultation Room" 
                                className="w-full h-full object-cover" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDosJHB0EGZYhduZslVOyCb7Yt9oGku-vIekc-pI3prDPMrT-YXdAgEld7-kwopXgKH1OUOky0PksLoHeJcjxXm9CqoVcrVrS7T-h1O2gBeF_sT71pzxGjRLZGduwQquN4lBPTFVNUcEQcLppRr83-wcU-iCwVAM-DXfPoqxV39WVdSWps14hCJYapSwp1IA09cKWLBYyhQsmsaH73TSy-HzVnSeyXwlHXabiifxoCR83T7P-bAAaTv0nEuPGyS6rrCR57lFxekvSJb"
                            />
                            <div className="absolute inset-0 border border-white/10 mix-blend-overlay pointer-events-none"></div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-5 md:-ml-16 z-10 mt-8 md:mt-0">
                        <div className="bg-surface-container-lowest/80 backdrop-blur-2xl p-10 lg:p-16 ambient-shadow border border-white/40">
                            <span className="font-label-caps text-primary uppercase block mb-4">Stage I — The Awakening</span>
                            <h2 className="font-h1-editorial text-on-surface mb-8">Quiet Consultation</h2>
                            <p className="font-body-large text-on-surface-variant mb-12 text-balance">
                                Every profound journey begins with a conversation. In our sanctuaries, dialogue replaces diagnosis. We sit together in natural light to understand the contours of your physical and emotional landscape, crafting a narrative that belongs entirely to you.
                            </p>
                            <div className="w-16 h-px bg-outline-variant"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stage 2: Diagnosis */}
            <section className="w-full py-32 px-6 lg:px-16 bg-surface-container-low relative z-10">
                <div className="max-w-360 mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="col-span-1 md:col-start-2 md:col-span-4 flex flex-col justify-center pt-24 md:pt-0 z-10 order-2 md:order-1 mt-12 md:mt-0">
                        <span className="font-label-caps text-primary uppercase block mb-4">Stage II — Clarity</span>
                        <h2 className="font-h1-editorial text-on-surface mb-8">Architectural Precision</h2>
                        <p className="font-body-large text-on-surface-variant text-balance">
                            Clarity is brought forth not just through state-of-the-art medical insight, but through a lens of profound empathy. We map the unseen, translating clinical data into clear, humanized understanding, ensuring every step forward is grounded in illumination.
                        </p>
                    </div>
                    <div className="col-span-1 md:col-start-7 md:col-span-6 relative order-1 md:order-2 mt-16 md:mt-0 md:-mt-24">
                        <div className="w-full aspect-4/5 overflow-hidden rounded-sm relative">
                            <img 
                                alt="Abstract medical detail" 
                                className="w-full h-full object-cover" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcfOnN2k3hUvTUE1CHNEdrua0ZeY0B9d25cPTKcNtyR7K0SfhwAHZmBjauE0bqk-tS9WOl3GFmitjs08hgneviGghUHfuk9wNLstmFUvQi-k6xC3B2eaVLchkKav3Vb3WFXy0AOk5CVbW75Ja2cOSYmGVCnwcvqiAcU2k6GnhY43wHJOQ8Usc3UzqZL5kUMaNywOYckJ6rL9dA1uNRhKGxb7VBDXGdAhviNBCZGxGchPbcArCN4pd8p3frdo13qoO_VXJQ19i8G59o"
                            />
                            {/* Soft vignette overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-surface-container-low/60 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stage 3: Treatment */}
            <section className="w-full py-48 px-6 lg:px-16 relative z-10">
                <div className="max-w-360 mx-auto flex flex-col items-center text-center">
                    <span className="font-label-caps text-primary uppercase block mb-6">Stage III — The Luminous Path</span>
                    <h2 className="font-display-hero text-on-surface max-w-3xl mb-24">Guided Healing</h2>
                    
                    <div className="w-full h-[614px] md:h-[819px] relative rounded-sm overflow-hidden ambient-shadow">
                        <img 
                            alt="Sanctuary recovery space" 
                            className="w-full h-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTU7dHC6CI6lexSjJbLJp0Z7ucG9tuJe56JsZalGSLpzC07S7Rx_N8rRB0j6NKhsRm-6cy295huEcguf_usCvKPd23Ypf3eI07M8ZrQ030wYA2O81OHLQj6zA6YF0s9-wrhtPqnnrRkXjX1KxD-abXxccTqCa2rG-goncOz84alZkavkaJdX0jq7REs_ieHUz6T47_OsulajUMwnrKPMcNy-TrsZ6hYgP_dUxYvmP2hDGBA5235bSKZ12EPQNHe2r1TQQPCIBqW8vX"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex justify-center">
                            <p className="font-body-large text-on-surface max-w-2xl text-center bg-surface-container-lowest/40 backdrop-blur-md p-8 border border-white/20">
                                The treatment phase is a masterclass in quiet resilience. Surrounded by an atmosphere designed to lower heart rates and elevate spirits, you are supported by clinical excellence seamlessly woven into the fabric of a luxury sanctuary.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="w-full py-32 px-6 lg:px-16 flex justify-center items-center relative z-10">
                <div className="text-center">
                    <h3 className="font-h2-subheading text-on-surface mb-8">Ready to illuminate your path?</h3>
                    <button className="bg-primary text-on-primary font-h2-subheading px-12 py-4 rounded-sm hover:bg-primary/90 transition-colors duration-500 flex items-center justify-center gap-4 mx-auto group text-[24px]">
                        Begin Journey
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
                    </button>
                </div>
            </section>
        </div>
    );
}
