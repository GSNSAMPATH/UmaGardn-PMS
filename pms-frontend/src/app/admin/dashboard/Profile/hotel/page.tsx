"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Label } from "@/app/components/label";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type HotelDto = {
  hotelId: number;
  name: string;
  address: string;
  phone: string;
  email: string;
};

export default function Hotel() {
  const [hotelId, setHotelId] = useState<number | null>(null);

  const [form, setForm] = useState({
    hotelName: "",
    address: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Load hotel data
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get<HotelDto[]>("/api/hotel");

        const hotel = Array.isArray(data) ? data[0] : null;
        if (!hotel?.hotelId) {
          console.warn("Hotel not found:", data);
          setHotelId(null);
          return;
        }

        setHotelId(hotel.hotelId);
        setForm({
          hotelName: hotel.name ?? "",
          address: hotel.address ?? "",
          phone: hotel.phone ?? "",
          email: hotel.email ?? "",
        });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 Save / Update API Call
  const handleUpdate = async () => {
    if (!hotelId) {
      alert("❌ Hotel ID not found.");
      return;
    }

    const payload = {
      hotelId,
      name: form.hotelName,
      address: form.address,
      phone: form.phone,
      email: form.email,
    };

    try {
      // ✅ token auto-added by api.ts (cookie token)
      await api.put(`/api/Hotel/${hotelId}`, payload);
      alert("Updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating hotel");
    }
  };

  const handleReset = () => {
    setForm({
      hotelName: "",
      address: "",
      phone: "",
      email: "",
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 py-16">
      <div className="flex flex-row items-center justify-between bg-white py-4 px-8 ">
        <h2 className="text-xl font-semibold">Hotel Profile</h2>
      </div>

      <div className="p-6">
        <section className="rounded-xl p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="flex items-center gap-2 mb-1">
                <Building2 size={18} /> Hotel Name
              </Label>
              <Input
                value={form.hotelName}
                onChange={(e) => updateField("hotelName", e.target.value)}
                placeholder="Enter your hotel name"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1">
                <MapPin size={18} /> Address
              </Label>
              <Input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Enter your address"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1">
                <Phone size={18} /> Phone Number
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1">
                <Mail size={18} /> Email Address
              </Label>
              <Input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="borderBlue"
              size="md"
              onClick={handleReset}
              className="bg-gray-100 "
            >
              Reset
            </Button>
            <Button size="md" onClick={handleUpdate} className="bg-gray-800">
              Save
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
