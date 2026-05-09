"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    title: "A Decade of Dreaming",
    subtitle: "The Chen Family",
    image: "/images/family.jpg",
  },
  {
    title: "Beyond Borders",
    subtitle: "The Al Fassi Family",
    image: "/images/corridor.jpg",
  },
  {
    title: "A Quiet Miracle",
    subtitle: "The Rivera Family",
    image: "/images/doctor.jpg",
  },
];

export default function Cinematic() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-5xl">Cinematic Journey</h2>
        </motion.div>

        <p className="text-gray-600 max-w-xl">
          Intimate reflections on the path to parenthood.
        </p>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop
        spaceBetween={30}
        slidesPerView={1.1}
        breakpoints={{
          768: {
            slidesPerView: 2,
          },
        }}
        className="pb-4"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="relative overflow-hidden rounded-2xl group shadow-lg h-[420px]">
              <Image
                src={slide.image}
                alt={slide.subtitle}
                fill
                className="object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="uppercase tracking-[0.2em] text-xs mb-3">
                  {slide.subtitle}
                </p>
                <h3 className="font-serif text-4xl">{slide.title}</h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}