"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/app/components/input";
import { Button } from "@/app/components/button";
import { CardContent } from "@/app/components/card";
import { Select } from "@/app/components/Select";
import { Label } from "@/app/components/label";
import {
  FaAddressCard,
  FaBan,
  FaBed,
  FaBrush,
  FaCalendar,
  FaCalendarAlt,
  FaChild,
  FaConciergeBell,
  FaCreditCard,
  FaEnvelope,
  FaFemale,
  FaIdBadge,
  FaIdCard,
  FaLocationArrow,
  FaMoneyBill,
  FaMoon,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { FaPersonCirclePlus, FaUsers } from "react-icons/fa6";
import { BiCategory } from "react-icons/bi";

import { useFetchData } from "@/app/hooks/useFetchData";
import { useCreateBooking } from "@/app/hooks/useCreateBooking";
import { buildBookingPayload } from "@/app/login/utils/bookingPayload";
import BookingButton from "@/app/components/BookingButton";
import { usePopup } from "@/app/components/PopupContext";

import { api, API_BASE_URL } from "@/lib/api";
import { Banknote } from "lucide-react";

const Section = ({ title, children }: any) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
    <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="bg-gray-200" />
    {children}
  </div>
);

export default function BookingScreen() {
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [guest, setGuest] = useState<any>({});
  const [stay, setStay] = useState<any>({});
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [nights, setNights] = useState(0);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [source, setSource] = useState<any>(null);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentType, setPaymentType] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [bookingSourceId, setBookingSourceId] = useState<string>("");
  const [totalAdvance, setTotalAdvance] = useState(0);
  const [status, setStatus] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);

  


  const { showInvoice } = usePopup()!;
  const { createBooking } = useCreateBooking();

  const sourceId = source?.id || "";

  // ✅ API data (no localhost)
  const { data: bookingSources, loading: loadingSources } = useFetchData<any[]>(
    "/api/BookingSourceProfile",
    []
  );

  const { data: mealPlans } = useFetchData<any[]>("/api/MealPlans", []);

  const { data: roomTypes } = useFetchData<any[]>("/api/RoomTypes", []);

  const { data: addons } = useFetchData<any[]>("/api/Addons", []);

  const { data: Countrys } = useFetchData<any[]>("/api/Country", []);

  const activeAddons = useMemo(
    () => (addons ?? []).filter((a: any) => a.isActive),
    [addons]
  );

  // ✅ available rooms using params (no query string building)
  const roomsPath = checkin && checkout ? "/api/Rooms/available" : null;

  const { data: rooms, loading: roomsLoading } = useFetchData<any[]>(
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

  const getAddonChargeType = (addonId: number) => {
    const addon = (addons ?? []).find((a: any) => a.addonId === addonId);
    if (!addon?.chargeType) return "per_booking";
    return addon.chargeType === "PerNight" ? "per_night" : "per_booking";
  };

  const fetchGuestById = async () => {
    if (!idType || !idNumber) return;

    try {
      setLoadingGuest(true);

      // ✅ no localhost + params
      const data = await api.get<any>("/api/Booking/guest", {
        idType,
        idNumber,
      });

      if (!data) {
        console.log("Guest not found");
        return;
      }

      setSelectedMealPlanId(data.mealPlans?.[0]?.mealPlanId);

      const [firstName = "", lastName = ""] =
        data.guests?.[0]?.name?.split(" ") || [];

      const [HomeAddress = "", City = ""] =
        data.guests?.[0]?.address?.split(",") || [];

      setGuest((prev: any) => ({
        ...prev,
        firstName,
        lastName,
        HomeAddress,
        City,
        email: data.guests?.[0]?.email,
        phone: data.guests?.[0]?.phone,
        country: data.guests?.[0]?.country,
      }));

      setStay((prev: any) => ({
        ...prev,
        checkin: data.checkinDate?.split("T")[0],
        checkout: data.checkoutDate?.split("T")[0],
      }));

      const checkinD = data.checkinDate?.split("T")[0] ?? "";
      const checkoutD = data.checkoutDate?.split("T")[0] ?? "";

      setCheckin(checkinD);
      setCheckout(checkoutD);

      // NOTE: you have "adalts" in response (typo) -> keep safe
      setAdults(Number(data.adalts ?? 1));
      setChildren(Number(data.children ?? 0));

      setStatus(data?.status ?? "");
      setBookingId(data?.bookingId ?? null);


            // ✅ load existing discount if backend returns it
      // supports "discount" or "discountAmount" just in case
      const existingDiscount =
        Number(data?.discount ?? data?.discountAmount ?? 0) || 0;
      setDiscount(existingDiscount);

      if (data.addons?.length) {
        setSelectedAddons(
          data.addons.map((a: any) => ({
            addonId: a.addonId,
            name: a.name,
            price: a.price,
            chargeType: getAddonChargeType(a.addonId),
          }))
        );
      }

      if (data.sourceId) setBookingSourceId(data.sourceId);

      const payments = data?.payments ?? [];
      const totalAdvance = payments
        .filter((p: any) => p.status === "advance")
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      setTotalAdvance(totalAdvance);

      if (data.rooms?.length) {
        setSelectedRooms(
          data.rooms.map((r: any) => ({
            roomId: r.roomId,
            roomNumber: r.roomNumber,
            roomTypeId: r.roomTypeId,
            pricePerNight: r.pricePerNight,
          }))
        );
      }
    } catch (err) {
      console.error("Fetch guest error:", err);
    } finally {
      setLoadingGuest(false);
    }
  };

  useEffect(() => {
    if (!checkin || !checkout) {
      setNights(0);
      return;
    }

    const checkInDate = new Date(checkin);
    const checkOutDate = new Date(checkout);

    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setNights(diffDays > 0 ? diffDays : 0);
  }, [checkin, checkout]);

  // Add autosave or "Save" button to trigger this
 useEffect(() => {
  const draft = localStorage.getItem("bookingDraft");

  if (draft) {
    const data = JSON.parse(draft);

    setIdType(data.idType || "");
    setIdNumber(data.idNumber || "");
    setGuest(data.guest || {});
    setCheckin(data.checkin || "");
    setCheckout(data.checkout || "");
    setAdults(data.adults || 1);
    setChildren(data.children || 0);
    // setSelectedRooms(data.selectedRooms || []);
    setSelectedAddons(data.selectedAddons || []);
    setPaymentMethod(data.paymentMethod || "cash");
    setPaymentType(data.paymentType || "");
    setPaidAmount(data.paidAmount || 0);
    setDiscount(data.discount || 0);
    console.log("Loaded draft:", data.discount);

    // Missing fields
    setSelectedRoomTypeId(data.selectedRoomTypeId || "");
    setSelectedRoomId(data.selectedRoomId || "");
    setSelectedMealPlanId(data.selectedMealPlanId || "");
    setBookingSourceId(data.bookingSourceId || "");
  }

  setDraftLoaded(true);
  setInitialized(true);
}, []);

//

  const addSelectedRoom = (roomId: string) => {
    const room = (rooms ?? []).find((r: any) => r.roomId === Number(roomId));
    if (!room) return;

    const exists = selectedRooms.some((sr) => sr.roomId === room.roomId);
    if (exists) return;

    const normalizedRoom = {
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      pricePerNight: room.roomTypeBasePrice,
    };

    setSelectedRooms((prev) => [...prev, normalizedRoom]);
    setSelectedRoomId("");
  };

  const totalGuests = adults + children;

  useEffect(() => {
    const selectedMealPlan = (mealPlans ?? []).find(
      (m: any) => m.mealPlanId === Number(selectedMealPlanId)
    );

    const roomTotal = selectedRooms.reduce(
      (sum, room) => sum + (room.pricePerNight || 0) * nights,
      0
    );

    const mealTotal = selectedMealPlan
      ? selectedMealPlan.price * totalGuests * nights
      : 0;

    const addonTotal = selectedAddons.reduce((sum, addon) => {
      const type = (addon.chargeType || "").toLowerCase();
      if (type === "per_night" || type === "pernight")
        return sum + addon.price * nights;
      return sum + addon.price;
    }, 0);

    setTotalAmount(roomTotal + mealTotal + addonTotal);
  }, [selectedRooms, nights, mealPlans, selectedMealPlanId, totalGuests, selectedAddons]);

    // ✅ clamp discount whenever total changes
  // useEffect(() => {
  //   setDiscount((prev) => {
  //     const d = Number(prev || 0);
  //     if (d < 0) return 0;
  //     if (d > totalAmount) return totalAmount;
  //     return d;
  //   });
  // }, [totalAmount]);

  useEffect(() => {
  if (!draftLoaded) return;
  if (totalAmount <= 0) return;

  setDiscount((prev) => {
    const d = Number(prev || 0);
    if (d < 0) return 0;
    if (d > totalAmount) return totalAmount;
    return d;
  });
}, [totalAmount, draftLoaded]);

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

  useEffect(() => {
    if (!bookingSourceId) return;
    if (!bookingSources?.length) return;

    const matchedSource = bookingSources.find((s) => s.id === bookingSourceId);
    if (matchedSource) setSource(matchedSource);
  }, [bookingSourceId, bookingSources]);

  const submitBooking = async () => {
    try {
      const safeDiscount = Math.max(0, Math.min(Number(discount || 0), totalAmount));

      const payload = buildBookingPayload({
        guest,
        idType,
        idNumber,
        sourceId,
        checkin,
        checkout,
        adults,
        children,
        selectedRooms,
        selectedAddons,
        selectedMealPlanId,
        mealPlans,
        totalAmount,
        discount: safeDiscount, // ✅ SEND DISCOUNT        
        paymentMethod,
        paymentType,
        paidAmount,
      });

      console.log("payload:", payload);

      const result = await createBooking(payload);

      setBookingId(result.bookingId);

      const nights =
        (new Date(result.checkoutDate).getTime() -
          new Date(result.checkinDate).getTime()) /
        (1000 * 60 * 60 * 24);

      const roomTotal = selectedRooms.reduce(
        (sum, r) => sum + (r.pricePerNight || 0) * nights,
        0
      );

      const totalGuests = adults + children;

      const selectedMealPlan = (mealPlans ?? []).find(
        (m: any) => m.mealPlanId === Number(selectedMealPlanId)
      );

      const mealTotal = selectedMealPlan
        ? selectedMealPlan.price * totalGuests * nights
        : 0;

      const addonTotal = selectedAddons.reduce(
        (sum, a) => (a.chargeType === "PerNight" ? sum + a.price * nights : sum + a.price),
        0
      );

      showInvoice({
        booking: {
          bookingRef: result.bookingRef,
          guestName: result.name,
          checkin: result.checkinDate,
          checkout: result.checkoutDate,
          subInvoiceNumber: result.subInvoiceNumber,
          totalNights: nights,
          roomNumbers: selectedRooms.map((r) => r.roomNumber).join(", "),
          roomTotal,
          mealTotal,
          addonTotal,
          discount: discount,
          totalAmount: result.totalAmount,
        },
        payments: [
          {
            method: result.method,
            amount: result.amount,
            status: "paid",
            paymentDate: result.paymentDate,
          },
        ],
      });

      handleReset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = useCallback(async () => {
    await submitBooking();
  }, [checkin, checkout, adults, children, selectedRooms, selectedMealPlanId, selectedAddons, totalAmount, discount, paymentMethod, paymentType, paidAmount, sourceId, idType, idNumber, guest]);

  const handleReset = useCallback(() => {
    setIdType("");
    setIdNumber("");
    setGuest({});
    setStay({});
    setSelectedRooms([]);
    setCheckin("");
    setCheckout("");
    setNights(0);
    setAdults(1);
    setChildren(0);
    setSource(null);
    setSelectedRoomTypeId("");
    setSelectedRoomId("");
    setTotalAmount(0);
    setDiscount(0);
    setPaymentMethod("cash");
    setPaymentType("");
    setPaidAmount(0);
    setSelectedMealPlan(null);
    setSelectedMealPlanId("");
    setSelectedAddons([]);
    setBookingSourceId("");
    setTotalAdvance(0);
    setStatus("");
  }, []);

  useEffect(() => {
  if (!initialized) return;

  setSelectedRooms([]);
  setSelectedRoomId("");
}, [checkin, checkout]);

  const checkoutPayload = {
    bookingId: bookingId,
    payments: [
      {
        amount: totalAmount - totalAdvance,
        method: paymentMethod,
        transactionId: "POS-" + Date.now(),
        paymentDate: new Date().toISOString(),
        status: paymentType,
      },
    ],
  };

    const discountPercentage =
    totalAmount > 0 ? ((discount / totalAmount) * 100).toFixed() : "0";
    const dueAmount = totalAmount - discount - totalAdvance; // LKR

    // save draft to localStorage on every change (can optimize with debounce)
useEffect(() => {
  if (!draftLoaded) return;

  localStorage.setItem(
    "bookingDraft",
    JSON.stringify({
      idType,
      idNumber,
      guest,
      checkin,
      checkout,
      adults,
      children,
      // selectedRooms,
      // selectedRoomTypeId,
      // selectedRoomId,
      selectedMealPlanId,
      selectedAddons,
      bookingSourceId,
      paymentMethod,
      paymentType,
      paidAmount,
      discount,
    })
  );
}, [
  draftLoaded,
  idType,
  idNumber,
  guest,
  checkin,
  checkout,
  adults,
  children,
  // selectedRooms,
  // selectedRoomTypeId,
  // selectedRoomId,
  selectedMealPlanId,
  selectedAddons,
  bookingSourceId,
  paymentMethod,
  paymentType,
  paidAmount,
  discount,
]);
  
  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 py-16 overflow-y-auto hide-scrollbar font-inter">
        <div className="fixed mt-15 top-0 items-center w-full bg-white py-5 px-4 ">
          <h2 className="text-xl pl-3 font-semibold">Reservation</h2>
        </div>
      <div className="text-gray-800 mt-16">
      <CardContent className="rounded-2xl space-y-8 pt-6">

        {/* GUEST REGISTRATION */}
        <Section title="Guest Registration">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaIdBadge size={12} /> ID Type
            </Label>
           <Select
           value={idType}
           onChange={(e) => setIdType(e.target.value)}
           >
              <option value="" disabled selected >
                Select ID Type   
              </option> 
              <option value="NIC">NIC</option>
              <option value="Passport">Passport</option>
            </Select></div>
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaIdCard size={12} /> ID Number
            </Label>
          <Input
            placeholder="ID/Passport Number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            onBlur={fetchGuestById}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchGuestById();
              }
            }}
          />

          </div>
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaPhone size={12} className="rotate-90" /> Phone
            </Label>
          <Input 
            placeholder="Phone Number"
            value={guest.phone || ""}
            onChange={(e) => setGuest({ ...guest, phone: e.target.value })} /></div>
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaEnvelope  size={12} /> Email
            </Label>
          <Input
           placeholder="Email Address"
           value={guest.email || ""}
           onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaFemale size={12} /> Gender
            </Label>
          <Select>
          <option value="" disabled selected>
                Select Gender
              </option> 
            <option>Male</option>
            <option>Female</option>
          </Select>
          </div>
        <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaUser size={12} /> First Name
            </Label>
          <Input
           placeholder="First Name"
           value={guest.firstName || ""}
           onChange={(e) => setGuest({ ...guest, firstName: e.target.value })
          } />
        </div>
        <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaUser size={12} /> Last Name
            </Label>
          <Input
           placeholder="Last Name"
           value={guest.lastName || ""}
           onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} />
        </div>
                <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaAddressCard size={12} />Home Address
            </Label>
          <Input
           placeholder="Home Address"
           value={guest.HomeAddress || ""}
           onChange={(e) => setGuest({ ...guest, HomeAddress: e.target.value })} />
        </div>
                        <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaAddressCard size={12} />City
            </Label>
          <Input
           placeholder="City"
           value={guest.City || ""}
           onChange={(e) => setGuest({ ...guest, City: e.target.value })} />
        </div>
        <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaLocationArrow size={12} /> Country
            </Label>
          <Select
            value={guest.country}
            onChange={(e) =>
              setGuest({ ...guest, country: e.target.value })
            }
          >
            <option value="" disabled selected>
              Select Nationality
            </option>
            {Countrys.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </Select>

        </div>
        </div>
        </Section>

        {/* RESERVATION INFO */}
        <Section title="Reservation Info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-4">
            <div className="w-full">
              <Label className="flex items-center gap-2 mb-1 text-sm">
                <FaCalendar size={12} /> Check-In
              </Label>
                <div className="relative w-full">
                  <Input
                    value={checkin} 
                    type="date" 
                    placeholder="Check-In"
                    onChange={(e) => setCheckin(e.target.value)}
                    className="
                          lg:pr-12
                          appearance-none
                          // [&::-webkit-calendar-picker-indicator]:opacity-0
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
              {/* Input */}
              <Input
                type="date"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="
                  lg:pr-12
                  appearance-none
                  // [&::-webkit-calendar-picker-indicator]:opacity-0
                  [&::-webkit-calendar-picker-indicator]:absolute
                  [&::-webkit-calendar-picker-indicator]:right-3
                "
              />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l px-3 text-gray-400">
            <FaCalendarAlt size={14} />
          </div>
        </div>
            </div>
        </div>
          <div className="flex gap-4 ">
            <div>
              <Label className="flex items-center gap-2 mb-1 text-sm">
                <FaMoon size={12} /> Night
              </Label>
            <Input placeholder="Nights" disabled value={nights} />
            </div>
       
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaUsers size={12} /> Adults
            </Label>
            <Input 
            placeholder="Adults" 
            value={adults || ""}
            onChange={(e) => setAdults(Number(e.target.value))}>
             </Input>
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaChild size={12} /> Children
            </Label>
            <Input
             placeholder="Children"
             value={children || ""}
             onChange={(e) => setChildren(Number(e.target.value))} />
            </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
            <Select
            value={source?.id || ""}
            onChange={(e) =>
              setSource(
                bookingSources.find((s) => s.id === e.target.value)
              )
            }
          >
            <option value="" disabled>
              Select Booking Source
            </option>
            {bookingSources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
          {source?.sourceType === "DIRECT" && (
          <>
            <Input placeholder="Coopent Ref No" />
          </>
        )}
         {source?.sourceType === "OTA" && (
          <>
            <Input placeholder="Booking Ref No" />
          </>
         )}
         {source?.sourceType === "AGENT" && (
          <>
            <Input placeholder="Agent Ref No" />

          </>
         )}
          </div>
          
          </div>
        </Section>
        {/* ROOM INFO */}
        <Section title="Room Info">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
          <Label className="flex items-center gap-2 mb-1 text-sm">
            <BiCategory size={12} /> Room Type
          </Label>
          <Select
            value={selectedRoomTypeId}
            onChange={(e) => {
              setSelectedRoomTypeId(e.target.value);
              setSelectedRoomId("");
            } }>
          <option value="">Select Room Type</option>
          {roomTypes.map((rt) => (
            <option key={rt.roomTypeId} value={rt.roomTypeId}>
              {rt.name}
            </option>
          ))}
            </Select>
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-1 text-sm">
              <FaBed size={12} /> Room Number
            </Label>
          <Select
            value={selectedRoomId}
            onChange={(e) => {
              setSelectedRoomId(e.target.value);
              addSelectedRoom(e.target.value);
            }}
            disabled={!selectedRoomTypeId}
          >
            <option value="">Select Room</option>
            {filteredRooms.map((r) => (
              <option key={r.roomId} value={r.roomId}>
                {r.roomNumber}
              </option>
            ))}
          </Select>

          </div>
        </div>

       <div className="flex gap-4 flex-wrap">
        {selectedRooms.map((r) => (
          <div
            key={r.roomId}
            className="flex flex-col w-[160px] bg-gray-100 rounded-xl p-4 flex justify-between gap-4"
          >
            <div className="flex items-center gap-6">
              <p className="text-[12px] w-full">
                {roomTypes.find(rt => rt.roomTypeId === r.roomTypeId)?.name}
              </p>
            <button
              type="button"
              className="h-2 w-2 p-2 flex items-center justify-center border rounded-full text-xs"
              onClick={() =>
                setSelectedRooms((prev) =>
                  prev.filter((sr) => sr.roomId !== r.roomId)
                )
              }
            >
              ✕
            </button>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-bold">{r.roomNumber || rooms.find(r => r.roomId === r.roomId)?.roomNumber}</p>
              <div className="w-full h-4 flex items-center justify-end gap-3">
                <FaBrush size={18} className="rotate-220 text-green-400" />
              <div className="w-4 h-4 bg-blue-600 rounded-sm  flex items-center justify-center gap-4"/>
              </div>
            </div>

          </div>
          
        ))}
      </div>
        </Section>
        {/* ADD-ON */}
        <Section title="Add-On">
        <div className="flex flex-row gap-4">
          <div className="flex flex-wrap w-1/4 gap-4">
          <Label className="flex items-center gap-2 mb-1 text-sm">
            <FaConciergeBell size={12} /> Meal Plan
          </Label>
          <Select
            value={selectedMealPlanId}
            onChange={(e) => setSelectedMealPlanId(e.target.value)}
          >
            <option value="">Select Meal Plan</option>

            {mealPlans.map((m) => (
              <option key={m.mealPlanId} value={m.mealPlanId}>
                {m.name} (Rs {m.price})
              </option>
            ))}
          </Select>
          </div>

         <div>
          <div className="w-full flex gap-4"/>
          <Label className="flex items-center gap-2 mb-1 text-sm">
            <FaPersonCirclePlus size={14} /> Add-On
          </Label>

          <div className="flex flex-row w-full gap-4">
            {activeAddons.map((addon: any) => (
              <label
                key={addon.addonId}
                className={`flex items-center gap-3  p-4 rounded-lg cursor-pointer
                  ${
                    selectedAddons.some(a => a.addonId === addon.addonId)
                      ? "border-blue-700"
                      : ""
                  }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAddons.some(a => a.addonId === addon.addonId)}
                  onChange={() => toggleAddon(addon)}
          
                />

                <div>
                  <p className="font-medium">{addon.name}</p>
                </div>
              </label>
            ))}
          </div>


          </div>
        </div>
        </Section>

        {/* PAYMENT DETAILS */}
        <Section title="Payment Details">

        <div className="bg-white  space-y-6">
        {/* SUMMARY */}
          <div className="space-y-4 text-[14px] font-semibold">
            <div className="flex justify-between bg-gray-100 p-3 rounded-xl border border-gray-200">
              <span>Total Payment</span>
              <span className="font-semibold">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>

                {/* ✅ DISCOUNT INPUT (SENDS TO API) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between bg-gray-100 p-3 rounded-xl border border-gray-200">
                    <span>Discount</span>
                    <span className="text-red-600">(Rs. {discount.toLocaleString()})</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
                    <Label className="text-sm mb-1 block">Enter Discount (Rs)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={totalAmount}
                      value={discount}
                      onChange={(e) => {
                        const v = Number(e.target.value || 0);
                        const safe = Math.max(0, Math.min(v, totalAmount));
                        setDiscount(safe);
                      }}
                      placeholder="0"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Max: Rs {totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
                    <Label className="text-sm mb-1 block">Discount (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discountPercentage}
                      onChange={(e) => {
                        const v = Number(e.target.value || 0);
                        const safe = Math.max(0, Math.min(v, 100));
                        const calculatedDiscount = (safe / 100) * totalAmount;
                        setDiscount(calculatedDiscount);
                      }}
                      placeholder=""
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Max: 100%</p>
                  </div>
                </div>

            <div className="flex justify-between bg-gray-100 p-3 rounded-xl border border-gray-200">
              <span>Total Advance Payment</span>
              <span className="text-green-600">
                (Rs. {totalAdvance.toLocaleString()})
              </span>
            </div>

            <div className="flex justify-between bg-gray-900 p-3 rounded-xl border border-gray-200 text-white font-semibold text-[24px] ">
              <span>Due amount</span>
              <span>
                Rs. {dueAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 grid grid-cols-1 md:grid-cols-4">
        {/* {source?.sourceType === "AGENT" && (
          <>
            <Select>
              <option value="">Select Agent</option>
              <option>ABC Travels</option>
              <option>XYZ Tours</option>
            </Select>

            <Input placeholder="Agent Ref No" />

            <Input
              disabled
              value={`Commission ${source.commissionPercent}%`}
            />

            <Select>
              <option>Credit</option>
              <option>Cash</option>
            </Select>
          </>
        )} */}
          </div>
          <div className="flex gap-4">
            {[
              { id: "cash", label: "Cash", icon: <FaMoneyBill size={30} /> },
              { id: "card", label: "Card Payment", icon: <FaCreditCard size={30} /> },
              { id: "bank", label: "Bank Transfer", icon: <Banknote size={30} /> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl border w-48
                  ${paymentMethod === m.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "bg-gray-100"
                  }`}
              >
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            ))}
          </div>

  
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-sm mb-1">Payment Type</Label>
              <Select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="">Select a payment type</option>
                <option>Advance</option>
                <option>closed</option>
                <option>Partial</option>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-1">Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        {/* ACTIONS */}
 
        <div className="flex justify-end gap-4 pt-6">
        <Button
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
        <BookingButton
          status={status}
          bookingId={bookingId}
          checkoutPayload={checkoutPayload}
          guest={guest}
          totalAmount={totalAmount}
          paymentMethod={paymentMethod}
          paidAmount={paidAmount}
          paymentType={paymentType}
          selectedRooms={selectedRooms}
          selectedMealPlan={selectedMealPlan}
          selectedAddons={selectedAddons}
          nights={nights}
          totalGuests={adults + children}
          onSave={handleSave}
          onStatusUpdate={setStatus}
          onCheckoutSuccess={(invoiceData) => {
            // ✅ Directly pass the data from BookingButton
            showInvoice(invoiceData);
          }}
        />
        </div>
        </Section>     
      </CardContent>
    </div>
    </div>
  );
}


