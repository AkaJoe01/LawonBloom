'use client';

import Image from 'next/image';
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section id="clinical-excellence" className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            >
                <p className="text-sm tracking-widest uppercase text-gray-500 mb-4">Clinical Excellence</p>
                <h1 className="text-4xl md:text-5xl font-serif leading-tight">The Science of Tomorrow, Today.</h1>
                <p className="mt-6 text-gray-600 max-w-md">Step into a realm where cutting-edge reproductive science meets serene, sanctuary-like care.</p>
            </motion.div>

            <div>
                <Image 
                src="/images/microscope.jpg" 
                alt="Laboratory microscope" 
                width={400}
                height={300}
                className="rounded-2xl shadow-lg w-full h-auto" 
                />
            </div>
        </section>
    );
}