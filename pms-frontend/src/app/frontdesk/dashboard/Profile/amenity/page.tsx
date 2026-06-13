"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AmenityPage() {
  const [amenities, setAmenities] = useState([]);
  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      const res = await fetch("http://localhost:5122/api/Amenities");
      const data = await res.json();
      setAmenities(data);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 py-20">
      {/* AMENITIES TABLE */}
      <section className="p-8">
        <h2 className="text-xl font-semibold mb-6">Amenities List</h2>

        <div className="flex flex-row w-full overflow-x-auto gap-4">

            {amenities.map((amenity: any) => (
              <div
                key={amenity.amenityId}
                className="flex flex-col items-center justify-center gap-2 p-4 border bg-white border-gray-300 rounded-3xl"
              >
                <Image
                  src={`http://localhost:5122${amenity.icon}`}
                  alt={amenity.name}
                  width={100}
                  height={100}
                  className="w-[300px] h-[200px] rounded-xl border object-cover"
                />
                <h3 className="font-semibold">{amenity.name}</h3>
                <p className="text-sm text-gray-600 text-center">{amenity.description}</p>
              </div>
            ))}
        </div>
      </section>

    </div>
  );
}
