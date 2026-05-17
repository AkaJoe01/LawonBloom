import Link from "next/link";

const services = [
    {
        title: "Fertility Preservation",
        description: "Elite egg and sperm freezing protocols with advanced vitrification.",
        href: "/clinical-excellence/fertility-preservation",
    },
    {
        title: "IVF Programs",
        description: "World-class IVF treatments personalized for every journey.",
        href: "/clinical-excellence/ivf",
    },
    {
        title: "Genetic Testing",
        description: "Comprehensive preimplantation genetic testing for healthy embryos.",
        href: "/clinical-excellence/genetic-testing",
    },
];

export default function Services(){
    return(
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {services.map((service) => (
                    <Link
                        key={service.title}
                        href={service.href}
                        className="group bg-surface-bright/60 backdrop-blur-xl border border-outline-variant/30 rounded-[32px] p-10 hover:-translate-y-2 transition duration-500"
                    >
                        <h3 className="font-display text-3xl mb-6 text-foreground group-hover:text-primary transition">
                            {service.title}
                        </h3>
                        <p className="text-on-surface-variant leading-8">
                            {service.description}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
