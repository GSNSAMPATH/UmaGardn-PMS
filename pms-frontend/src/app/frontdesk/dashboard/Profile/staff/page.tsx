"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/app/components/button";


export default function StaffPage() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    loadStaff();
  }, []);

  // Load staff list
  const loadStaff = async () => {
    try {
      const res = await fetch("http://localhost:5122/api/Staff");
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 py-20">
      {/* STAFF LIST */}
      <section className="p-8">
        <h2 className="text-xl font-semibold mb-6">Staff Members</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {staff.map((s: any) => (
            <div
              key={s.staffId}
              className="flex flex-col  items-center justify-center gap-2 p-4 border bg-white border-gray-300 rounded-3xl "
            >
              <Image
                src={
                  s.profileImageUrl
                    ? `http://localhost:5122${s.profileImageUrl}`
                    : "/default-user.png"
                }
                alt={s.name}
                width={100}
                height={100}
                className="w-full h-[180px] rounded-xl border object-cover"
              />

              <h3 className="font-semibold text-lg">{s.name}</h3>
              <p className="text-sm text-gray-600">{s.email}</p>
              <p className="text-sm text-gray-700">{s.role}</p>
              <p className="text-sm text-gray-500">{s.phone}</p>

  
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}
