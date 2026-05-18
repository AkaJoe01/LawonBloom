const services = [
    {
        title: "Private Coordination",
        description: "Dedicated care coordinators guiding every stage of your experience.",
    },
    {
        title: "Global Access",
        description: "Travel planning and accommodation support for international families.",
    },
    {
        title: "Confidential Care",
        description: "Absolute discretion with personalized treatment pathways.", 
    },
];

export default function Services() {
    return(
        <section className="max-w-6xl mx-auto px-6 py-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service) => (
                    <div key={service.title} 
                    className="bg-surface-bright/60 backdrop-blur-xl border border-outline-variant/30 rounded-4xl p-10 shadow-sm"
                    >
                        <h3 className="font-display text-3xl mb-6 text-foreground">
                            {service.title}
                        </h3>
                        <p className="text-on-surface-variant leading-8">
                            {service.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}