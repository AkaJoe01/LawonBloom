import { Search, ChevronDown, MessageSquare, Mail } from "lucide-react";

export const metadata = {
    title: "Lawonbloom - FAQ",
    description: "Find reassurance and detailed guidance within our sanctuary of knowledge.",
};

export default function FAQPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="pt-20 pb-24 px-6 lg:px-20 max-w-360 mx-auto relative overflow-hidden w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="col-span-1 md:col-span-8 md:col-start-3 text-center">
                        <h1 className="font-display-hero text-primary mb-6">Clarity &amp; Calm</h1>
                        <p className="font-body-large text-on-surface-variant max-w-2xl mx-auto mb-12">
                            We understand that the journey to parenthood is filled with profound questions. Find reassurance and detailed guidance within our sanctuary of knowledge.
                        </p>
                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                <Search className="text-primary/50 w-6 h-6 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                className="w-full glass-panel pl-16 pr-6 py-5 rounded-full text-base text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 placeholder:text-on-surface-variant/50 transition-all" 
                                placeholder="What are you seeking clarity on?" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Categories */}
            <section className="py-16 px-6 lg:px-20 max-w-360 mx-auto w-full">
                <div className="flex flex-wrap justify-center gap-4 mb-20">
                    <button className="px-6 py-3 rounded-full bg-surface-container text-primary font-label-caps shadow-sm">All Inquiries</button>
                    <button className="px-6 py-3 rounded-full bg-transparent border border-surface-container text-on-surface-variant hover:bg-surface-container/50 font-label-caps transition-colors">The First Step</button>
                    <button className="px-6 py-3 rounded-full bg-transparent border border-surface-container text-on-surface-variant hover:bg-surface-container/50 font-label-caps transition-colors">Clinical Pathways</button>
                    <button className="px-6 py-3 rounded-full bg-transparent border border-surface-container text-on-surface-variant hover:bg-surface-container/50 font-label-caps transition-colors">Holistic Support</button>
                    <button className="px-6 py-3 rounded-full bg-transparent border border-surface-container text-on-surface-variant hover:bg-surface-container/50 font-label-caps transition-colors">Concierge Services</button>
                </div>

                {/* FAQ Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 lg:mb-28">
                    <div className="col-span-1 md:col-span-10 md:col-start-2 flex flex-col gap-6">
                        {/* FAQ Item 1 (Expanded State) */}
                        <div className="glass-panel rounded-2xl p-8 cursor-pointer group">
                            <div className="flex justify-between items-start">
                                <h3 className="font-h2-subheading text-primary pr-12 group-hover:text-primary/80 transition-colors">What should I expect during my initial consultation at the Sanctuary?</h3>
                                <ChevronDown className="text-primary/70 transform rotate-180 transition-transform duration-500 w-6 h-6 shrink-0" />
                            </div>
                            <div className="mt-6 text-base text-on-surface-variant leading-relaxed">
                                <p className="mb-4">Your initial consultation is designed to be a profound listening session rather than a standard clinical appointment. Conducted in one of our private, sunlit suites, you will meet with a Senior Fertility Specialist and a dedicated Wellness Concierge.</p>
                                <p>We review your complete medical history, discuss your emotional and physical readiness, and begin drafting a personalized roadmap. The focus is entirely on your unique story, ensuring you feel heard, understood, and enveloped in our care from the very first moment.</p>
                            </div>
                        </div>

                        {/* FAQ Item 2 */}
                        <div className="glass-panel rounded-2xl p-8 cursor-pointer group hover:bg-surface-bright/70 transition-all">
                            <div className="flex justify-between items-center">
                                <h3 className="font-h2-subheading text-[24px] leading-tight text-on-surface pr-12 group-hover:text-primary transition-colors">How does Lawonbloom ensure privacy for high-profile clientele?</h3>
                                <ChevronDown className="text-primary/40 group-hover:text-primary/70 transition-colors w-6 h-6 shrink-0" />
                            </div>
                        </div>

                        {/* FAQ Item 3 */}
                        <div className="glass-panel rounded-2xl p-8 cursor-pointer group hover:bg-surface-bright/70 transition-all">
                            <div className="flex justify-between items-center">
                                <h3 className="font-h2-subheading text-[24px] leading-tight text-on-surface pr-12 group-hover:text-primary transition-colors">What holistic therapies are integrated into the clinical pathways?</h3>
                                <ChevronDown className="text-primary/40 group-hover:text-primary/70 transition-colors w-6 h-6 shrink-0" />
                            </div>
                        </div>

                        {/* FAQ Item 4 */}
                        <div className="glass-panel rounded-2xl p-8 cursor-pointer group hover:bg-surface-bright/70 transition-all">
                            <div className="flex justify-between items-center">
                                <h3 className="font-h2-subheading text-[24px] leading-tight text-on-surface pr-12 group-hover:text-primary transition-colors">How is the psychological well-being of intended parents supported?</h3>
                                <ChevronDown className="text-primary/40 group-hover:text-primary/70 transition-colors w-6 h-6 shrink-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28 px-6 lg:px-20 relative w-full">
                <div className="absolute inset-0 bg-surface-container-low/50 z-0"></div>
                <div className="max-w-360 mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="col-span-1 md:col-span-5 md:col-start-2">
                        <h2 className="font-h1-editorial text-primary mb-6">Still Seeking Clarity?</h2>
                        <p className="font-body-large text-on-surface-variant mb-10">Our Concierge Team is available around the clock to provide deeply personal answers to any delicate questions you may hold.</p>
                        <div className="flex flex-wrap gap-6 items-center">
                            <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-caps hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                Connect with a Concierge
                            </button>
                            <a href="#" className="font-label-caps text-primary hover:text-primary/70 transition-colors border-b border-primary/30 pb-1">Send a Private Message</a>
                        </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-5 mt-10 md:mt-0">
                        <div className="glass-panel p-8 rounded-[32px] relative overflow-hidden">
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-fixed/30 rounded-full blur-3xl"></div>
                            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-tertiary-fixed/20 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                                        <MessageSquare className="text-primary w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-label-caps text-on-surface-variant">Live Counsel</p>
                                        <p className="text-base text-on-surface">Available Now</p>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                                        <Mail className="text-primary w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-label-caps text-on-surface-variant">Confidential Email</p>
                                        <p className="text-base text-on-surface">lawonbloomfertilitycentre@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
