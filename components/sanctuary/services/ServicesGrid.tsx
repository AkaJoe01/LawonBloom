"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import {
    FlaskConical,
    ShieldPlus,
    HeartPulse,
    Microscope,
    Sparkles,
    Stethoscope,
} from "lucide-react";

const services = [
    {
        title: "In Vitro Fertilization (IVF)",
        description: "Our IVF program combines cutting-edge technology with personalized care to maximize your chances of success.",
        icon: FlaskConical,
        large: true,
        image: "/images/scan_2.jpg",
    },
    {
        title: "IUI",
        description: "Our IUI services offer a less invasive option for those seeking fertility assistance, with a focus on comfort and effectiveness.",
        icon: Microscope,
    },
    {
        title: "Fertility Preservation",
        description: "We provide comprehensive fertility preservation options, including egg and sperm freezing, to safeguard your reproductive future.",
        icon: Sparkles,
    },
    {
        title: "Sonohysterogram",
        description: "Advanced saline ultrasound imaging for meticulous uterine cavity assessment.",
        icon: ShieldPlus,
    },
    {
        title: "Hysteroscopy",
        description: "Diagnostic and operative precision within the uterine environment.",
        icon: Stethoscope,
    },
    {
        title: "Holistic Counseling",
        description: "Private therapeutic guidance ensuring emotional harmony throughout your journey.",
        icon: HeartPulse,
        image: "/images/scan_1.jpg",
    },
];

export default function ServicesGrid() {
    return (
        <section className="max-w-7xl mx-auto px-6 pb-32">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.15,
                        },
                    },
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[260px]"
            >
                {services.map((service, index) => {
                    const Icon = service.icon;

                    return (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    y: 60,
                                },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                },
                            }}
                            transition={{ duration: 0.8 }}
                            className={`
                                group relative overflow-hidden rounded-[32px]
                                border border-white/30
                                bg-white/40 backdrop-blur-xl
                                p-8 transition duration-700
                                hover:-translate-y-2 hover:shadow-2xl
                                ${
                                    service.large
                                        ? "md:col-span-2 md:row-span-2"
                                        : ""
                                }
                            `}
                        >
                            {/* HOVER IMAGE */}
                            {service.image && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition duration-700">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover scale-110"
                                    />
                                </div>
                            )}

                            {/* GLOW */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-40" />

                            {/* CONTENT */}
                            <div className="relative z-10">
                                {/* ICON */}
                                <div className="w-14 h-14 rounded-full border border-[#caa5ad] flex items-center justify-center mb-10">
                                    <Icon className="w-6 h-6 text-[#9c5c67]" />
                                </div>

                                {/* TITLE */}
                                <h3
                                    className={`
                                        font-serif mb-6 tracking-[-0.03em]
                                        ${
                                            service.large
                                                ? "text-[52px] leading-[1]"
                                                : "text-[34px]"
                                        }
                                    `}
                                >
                                    {service.title}
                                </h3>

                                {/* DESCRIPTION */}
                                <p className="text-gray-600 leading-8 max-w-md">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
}