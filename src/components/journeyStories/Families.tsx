"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ArrowLeft } from "lucide-react";

const testimonials = [
  {
    author: "Sarah & James",
    location: "London, UK",
    quote:
      "The clinical excellence was apparent from day one, but it was the profound empathy and peace within the sanctuary that truly carried us through our darkest moments.",
    image: "/images/Profile.jpg",
  },
  {
    author: "Mia & Noah",
    location: "Dubai, UAE",
    quote:
      "Every detail felt personalized. The team supported our journey with compassion, expertise, and unwavering patience.",
    image: "/images/scan.jpg",
  },
  {
    author: "Avery & Leo",
    location: "New York, USA",
    quote:
      "The environment was calming, the science was outstanding, and the result was the dream we’ve waited for.",
    image: "/images/scan_1.jpg",
  },
];

export default function Families() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-20 items-start">
        <div>
          <p className="uppercase text-xs tracking-[0.3em] text-[#9c5c67] mb-6">
            Written Archives
          </p>
          <h2 className="font-serif text-[56px] leading-[1.1] mb-8">
            The Lawonbloom Families
          </h2>
          <p className="text-gray-600 leading-8 mb-10">
            Read the personal accounts of resilience, scientific precision, and the delicate balance of hope that defines our sanctuary.
          </p>
          <button className="inline-flex items-center gap-2 text-[#9c5c67] uppercase tracking-[0.2em] text-sm">
            Explore All Stories <ArrowLeft size={20} />
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-2xl p-10 shadow-sm">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop
            spaceBetween={24}
            slidesPerView={1}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.author}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{testimonial.author}</h4>
                      <p className="font-medium text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-8 italic">{testimonial.quote}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
} 