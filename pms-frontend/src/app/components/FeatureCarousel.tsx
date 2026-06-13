"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    title: "Manage Your Entire Hotel Operations Smoothly From One System",
    description:
      "Handle all hotel operations including reservations, check-ins, check-outs, billing, staff assignments, and guest communications efficiently.",
    image: "IMG-20250927-WA0016.jpg",
  },
  {
    title: "Enhance Guest Experience With Personalized Services and Notifications",
    description:
      "Offer tailored experiences, send automated alerts, and respond to guest requests promptly creating memorable stays.",
    image: "IMG-20250927-WA0043.jpg",
  },
  {
    title: "Access Your Hotel Data Securely Anytime From Anywhere in Cloud",
    description:
      "Your hotel’s information is protected and accessible from any device ensuring real-time updates and data safety.",
    image: "IMG-20250927-WA0049.jpg",
  },
  {
    title: "Get Detailed Reports and Insights for Smarter Hotel Decisions",
    description:
      "Generate comprehensive reports on revenue, occupancy, bookings, and staff performance for informed decisions.",
    image: "IMG-20250927-WA0037.jpg",
  },
  {
    title: "Keep Track of Room Availability and Status in Real-Time",
    description:
      "Monitor room status instantly and ensure each room is ready for guests improving operational efficiency.",
    image: "IMG-20250927-WA0035.jpg",
  },
];

export default function FeatureCarousel() {
  const [index, setIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* SLIDES */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="min-w-full grid grid-cols-1 gap-10 items-center px-6"
            >
              {/* IMAGE */}
              <img
                src={slide.image}
                alt={slide.title}
                className="rounded-2xl shadow-lg mb-10 "
              />

              {/* TEXT */}
              <div className="text-center max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">
                  {slide.title}
                </h2>
                <p className="text-gray-500">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              i === index ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
