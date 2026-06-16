"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/app/components/input";
import { Button } from "@/app/components/button";
import { Select } from "@/app/components/Select";
import { Label } from "@/app/components/label";
import AlertBox from "@/app/components/alert-box";
import { useFetchData } from "@/app/hooks/useFetchData";
import QuotationSuccessModal from "./QuotationSuccessModal";
import { api } from "@/lib/api";
import { FiX } from "react-icons/fi";
import {
  FaCalendar,
  FaCalendarAlt,
  FaIdBadge,
  FaIdCard,
  FaUser,
} from "react-icons/fa";

const Section = ({ title, children }: any) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

type Quotation = {
  id: number;
};

type SelectedRoom = {
  roomId: number;
  roomNumber: string;
  roomTypeId: number;
  pricePerNight: number;
};

export default function QuotationScreen() {
  const [alert, setAlert] = useState({
    show: false,
    type: "success" as any,
    message: "",
  });
  const showAlert = (type: any, message: string) =>
    setAlert({ show: true, type, message });

  // ---------------- Guest Info ----------------
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("+94");

  // ---------------- Stay / basic quote data ----------------
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [nights, setNights] = useState(0);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // ---------------- Room selection ----------------
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);

  // ---------------- Add-on ----------------
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  // ---------------- Payment ----------------
  const [discount, setDiscount] = useState(0);

  const [showQuotationModal, setShowQuotationModal] =
  useState(false);

  const [quotationData, setQuotationData] =
  useState<any>(null);

  // ✅ API data
  const { data: roomTypes } = useFetchData<any[]>("/api/RoomTypes", []);
  const { data: mealPlans } = useFetchData<any[]>("/api/MealPlans", []);
  const { data: addons } = useFetchData<any[]>("/api/Addons", []);

  const activeAddons = useMemo(
    () => (addons ?? []).filter((a: any) => a.isActive),
    [addons]
  );

  // ✅ available rooms with params (your same pattern)
  const roomsPath = checkin && checkout ? "/api/Rooms/available" : null;
  const { data: rooms } = useFetchData<any[]>(
    roomsPath,
    [],
    checkin && checkout ? { checkin, checkout } : undefined
  );

  const filteredRooms = useMemo(() => {
    return (rooms ?? []).filter(
      (r: any) =>
        r.roomTypeId === Number(selectedRoomTypeId) && r.status === "Available"
    );
  }, [rooms, selectedRoomTypeId]);

  // Nights calc
  useEffect(() => {
    if (!checkin || !checkout) {
      setNights(0);
      return;
    }
    const inD = new Date(checkin);
    const outD = new Date(checkout);
    const diff = Math.ceil((outD.getTime() - inD.getTime()) / 86400000);
    setNights(diff > 0 ? diff : 0);
  }, [checkin, checkout]);

  // Add room
  const addSelectedRoom = (roomId: string) => {
    const room = (rooms ?? []).find((r: any) => r.roomId === Number(roomId));
    if (!room) return;

    const exists = selectedRooms.some((sr) => sr.roomId === room.roomId);
    if (exists) return;

    const normalized: SelectedRoom = {
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      pricePerNight: room.roomTypeBasePrice, // same as booking
    };

    setSelectedRooms((prev) => [...prev, normalized]);
    setSelectedRoomId("");
  };

  // Reset selected rooms when dates change
  useEffect(() => {
    setSelectedRooms([]);
    setSelectedRoomId("");
  }, [checkin, checkout]);

  const totalGuests = adults + children;

  const selectedMealPlan = useMemo(() => {
    return (mealPlans ?? []).find(
      (m: any) => m.mealPlanId === Number(selectedMealPlanId)
    );
  }, [mealPlans, selectedMealPlanId]);

  const roomTotal = useMemo(() => {
    return selectedRooms.reduce(
      (sum, r) => sum + (Number(r.pricePerNight) || 0) * nights,
      0
    );
  }, [selectedRooms, nights]);

  const mealTotal = useMemo(() => {
    if (!selectedMealPlan) return 0;
    return (Number(selectedMealPlan.price) || 0) * totalGuests * nights;
  }, [selectedMealPlan, totalGuests, nights]);

  const addonTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addon) => {
      const type = String(addon.chargeType || "").toLowerCase();
      if (
        type === "per_night" ||
        type === "pernight" ||
        type === "pernightly"
      ) {
        return sum + Number(addon.price || 0) * nights;
      }
      return sum + Number(addon.price || 0);
    }, 0);
  }, [selectedAddons, nights]);

  const totalAmount = useMemo(() => {
    return Math.max(
      0,
      roomTotal + mealTotal + addonTotal - (Number(discount) || 0)
    );
  }, [roomTotal, mealTotal, addonTotal, discount]);

  const toggleAddon = (addon: any) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addon.addonId);
      if (exists) return prev.filter((a) => a.addonId !== addon.addonId);

      return [
        ...prev,
        {
          addonId: addon.addonId,
          name: addon.name,
          price: addon.price,
          chargeType: addon.chargeType,
        },
      ];
    });
  };

  const money = (v: number) =>
    `LKR. ${Number(v || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Save quotation
  const handleSaveDraft = async () => {
    try {
      const payload = {
        guest: { idType, idNumber, guestName, phone },
        stay: { checkin, checkout, nights, adults, children },
        rooms: selectedRooms,
        mealPlanId: selectedMealPlanId ? Number(selectedMealPlanId) : null,
        addons: selectedAddons,
        totals: {
          roomTotal,
          mealTotal,
          addonTotal,
          discount,
          totalAmount,
        },
        currency: "LKR",
        date: new Date().toISOString(),
      };

      await api.post("/api/Quotations", payload);

      showAlert("success", "Quotation saved!");
    } catch (e: any) {
      console.error(e);
      showAlert("error", e?.message || "Save failed");
    }
  };

  // ✅ Generate quotation HTML using your template route
const handleGenerateQuotation = async () => {
  try {
    if (!guestName?.trim()) {
      showAlert("error", "Guest name is required");
      return;
    }

    if (!checkin || !checkout) {
      showAlert(
        "error",
        "Check-in and Check-out are required"
      );
      return;
    }

    if (!selectedRooms.length) {
      showAlert(
        "error",
        "Please select at least one room"
      );
      return;
    }

      const savePayload = {
        name: guestName,
        idType,
        idNumber,
        phone,

        checkinDate: new Date(checkin).toISOString(),
        checkoutDate: new Date(checkout).toISOString(),

        mealPlanId: selectedMealPlanId
          ? Number(selectedMealPlanId)
          : 0,

        addonId:
          selectedAddons.length > 0
            ? selectedAddons[0].addonId
            : 0,

        rooms: selectedRooms.map((r) => ({
          roomId: r.roomId,
          roomTypeId: r.roomTypeId,
        })),

        adults,
        children,
        discount,
      };

    console.log("Saving quotation with payload:", savePayload);

    const savedQuotation = await api.post<any>(
      "/api/Quotation",
      savePayload
    );

    console.log("Saved quotation:", savedQuotation);

   const quotationPreviewData = {
    id:
      savedQuotation?.id ??
      savedQuotation?.quotationId,

    quoteNumber:
      savedQuotation?.quoteNumber ??
      savedQuotation?.quotationNumber ??
      `QT-${Date.now()}`,

    guestName,
    guestPhone: phone,
    guestIdType: idType,
    guestIdNumber: idNumber,

    checkin,
    checkout,

    nights,
    adults,
    children,

    guestsCount:
      Number(adults || 0) +
      Number(children || 0),

    roomTotal,
    mealTotal,
    addonTotal,
    discount,
    totalAmount,

    quoteDate: new Date().toISOString(),

    validUntil: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(),

    rooms: selectedRooms.map((r) => ({
      roomId: r.roomId,
      roomNumber: r.roomNumber,
      roomTypeId: r.roomTypeId,

      roomTypeName:
        roomTypes?.find(
          (rt: any) =>
            rt.roomTypeId === r.roomTypeId
        )?.name ?? "",

      pricePerNight:
        Number(r.pricePerNight ?? 0),
    })),

    mealPlan: selectedMealPlan
      ? {
          mealPlanId:
            selectedMealPlan.mealPlanId,

          name:
            selectedMealPlan.name,

          price:
            Number(
              selectedMealPlan.price ?? 0
            ),
        }
      : null,

    addons: selectedAddons.map(
      (a: any) => ({
        addonId: a.addonId,
        name: a.name,
        price: Number(a.price ?? 0),
      })
    ),
  };

  console.log(
    "Quotation Preview Data:",
    quotationPreviewData
  );

  setQuotationData(
    quotationPreviewData
  );

    setShowQuotationModal(true);
  } catch (err: any) {
    console.error(err);

    showAlert(
      "error",
      err?.message ||
        "Quotation generation failed"
    );
  }
};

  const handleReset = () => {
    setIdType("");
    setIdNumber("");
    setGuestName("");
    setPhone("+94");
    setCheckin("");
    setCheckout("");
    setNights(0);
    setAdults(1);
    setChildren(0);
    setSelectedRoomTypeId("");
    setSelectedRoomId("");
    setSelectedRooms([]);
    setSelectedMealPlanId("");
    setSelectedAddons([]);
    setDiscount(0);
  };

  return (
    <>
      <AlertBox
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert((p) => ({ ...p, show: false }))}
      />

      <div className="min-h-screen bg-[#f6f6f6] text-gray-900 font-sans">
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 pt-16">
          <div className="mx-auto  px-6 py-4 flex items-center justify-between">
            <h1 className="text-[20px] font-semibold">Create Quote</h1>
          </div>
        </div>

        <div className="mx-auto  px-6 py-8 space-y-6">
          {/* Guest Info */}
          <Section title="Guest Info">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaIdBadge size={12} />
                  ID Type
                </Label>
                <Select value={idType} onChange={(e) => setIdType(e.target.value)}>
                  <option value="">Select ID type</option>
                  <option value="NIC">NIC</option>
                  <option value="Passport">Passport</option>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaIdCard size={12} />
                  ID/Passport Number
                </Label>
                <Input
                  placeholder="Enter ID number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaUser size={12} />
                  Guest Name
                </Label>
                <Input
                  placeholder="Enter guest name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Stay Info */}
          <Section title="Stay Info">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="w-full">
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaCalendar size={12} /> Check-In
                </Label>
                <div className="relative w-full">
                  <Input
                    type="date"
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    className="
                      pr-12 appearance-none
                      [&::-webkit-calendar-picker-indicator]:absolute
                      [&::-webkit-calendar-picker-indicator]:right-3
                    "
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l px-3 text-gray-400">
                    <FaCalendarAlt size={14} />
                  </div>
                </div>
              </div>

              <div className="w-full">
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaCalendar size={12} /> Check-Out
                </Label>
                <div className="relative w-full">
                  <Input
                    type="date"
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    className="
                      pr-12 appearance-none
                      [&::-webkit-calendar-picker-indicator]:absolute
                      [&::-webkit-calendar-picker-indicator]:right-3
                    "
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l px-3 text-gray-400">
                    <FaCalendarAlt size={14} />
                  </div>
                </div>
              </div>

              <div>
                <Label>Nights</Label>
                <Input disabled value={nights} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Adults</Label>
                  <Input
                    type="number"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Children</Label>
                  <Input
                    type="number"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Room Info */}
          <Section title="Room Info">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <Label>Room type</Label>
                <Select
                  value={selectedRoomTypeId}
                  onChange={(e) => {
                    setSelectedRoomTypeId(e.target.value);
                    setSelectedRoomId("");
                  }}
                  disabled={!checkin || !checkout}
                >
                  <option value="">Select room type</option>
                  {(roomTypes ?? []).map((rt: any) => (
                    <option key={rt.roomTypeId} value={rt.roomTypeId}>
                      {rt.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Rooms</Label>
                <Select
                  value={selectedRoomId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedRoomId(v);
                    if (v) addSelectedRoom(v);
                  }}
                  disabled={!selectedRoomTypeId}
                >
                  <option value="">Select rooms</option>
                  {filteredRooms.map((r: any) => (
                    <option key={r.roomId} value={r.roomId}>
                      Room {r.roomNumber}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              {selectedRooms.map((r) => (
                <div
                  key={r.roomId}
                  className="w-[240px] rounded-2xl bg-[#f7f7f7] border border-gray-200 p-4 relative"
                >
                  <button
                    className="absolute right-3 top-3 text-gray-500 hover:text-black"
                    onClick={() =>
                      setSelectedRooms((prev) =>
                        prev.filter((x) => x.roomId !== r.roomId)
                      )
                    }
                    aria-label="Remove room"
                    type="button"
                  >
                    <FiX />
                  </button>

                  <div className="text-xs text-gray-500 font-medium">Room No.</div>
                  <div className="text-[20px] font-semibold leading-6">
                    {r.roomNumber}
                  </div>
                  <div className="mt-2 text-sm text-gray-800">
                    {(roomTypes ?? []).find((t: any) => t.roomTypeId === r.roomTypeId)
                      ?.name || ""}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Price/night: <span className="font-semibold">{money(r.pricePerNight)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Add-On */}
          <Section title="Add-On">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="flex flex-wrap w-1/4 gap-4">
                <Label>Meal Plan</Label>
                <Select
                  value={selectedMealPlanId}
                  onChange={(e) => setSelectedMealPlanId(e.target.value)}
                >
                  <option value="">Select meal plan</option>
                  {(mealPlans ?? []).map((m: any) => (
                    <option key={m.mealPlanId} value={m.mealPlanId}>
                      {m.name} (Rs {Number(m.price || 0).toLocaleString()})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Additional Services</Label>
                <div className="mt-3 flex flex-wrap gap-4">
                  {activeAddons.map((addon: any) => {
                    const checked = selectedAddons.some(
                      (a) => a.addonId === addon.addonId
                    );
                    return (
                      <label
                        key={addon.addonId}
                        className={`flex items-center gap-3 border p-4 rounded-lg cursor-pointer ${
                          checked ? "border-blue-700 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(addon)}
                        />
                        <div>
                          <p className="font-medium">{addon.name}</p>
                          <p className="text-sm text-gray-500">
                            Rs {Number(addon.price || 0).toLocaleString()}{" "}
                            {String(addon.chargeType || "")
                              .toLowerCase()
                              .includes("night")
                              ? "/ night"
                              : "/ booking"}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* Payment Details */}
          <Section title="Payment Details">
            <div className="space-y-3">
              <Row label="Room Cost" value={money(roomTotal)} />
              <Row label="Meal Plan Cost" value={money(mealTotal)} />
              <Row label="Add-On Services Cost" value={money(addonTotal)} />

              <div className="flex items-center justify-between rounded-xl bg-[#fafafa] border border-gray-200 px-5 py-4">
                <div className="text-sm font-medium">Discount</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">LKR.</span>
                  <Input
                    className="w-[160px] text-right"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-black text-white px-6 py-5 flex items-center justify-between">
                <div className="text-lg font-semibold">Total Quotation</div>
                <div className="text-2xl font-bold">{money(totalAmount)}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                Save draft
              </Button>
              <Button className="bg-black text-white" onClick={handleGenerateQuotation}>
                Download
              </Button>
            </div>
          </Section>
        </div>
      </div>
      <QuotationSuccessModal
      open={showQuotationModal}
      onClose={() => {
        setShowQuotationModal(false);
      }}
      quotationData={quotationData}
    />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#fafafa] border border-gray-200 px-5 py-4">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}