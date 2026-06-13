"use client";

import { useState } from "react";
import { Button } from "./button";
import { api } from "@/lib/api";

interface BookingButtonProps {
  status: string;
  bookingId: number | null;
  checkoutPayload: any;
  guest: { firstName: string; lastName: string };
  totalAmount: number;
  paymentMethod: string;
  paidAmount: number;
  paymentType: string;
  selectedRooms: any[]; // Needed to calculate roomTotal
  selectedMealPlan?: any; // Optional meal plan
  selectedAddons?: any[]; // Optional addons
  nights: number;
  totalGuests: number;
  onSave: () => Promise<void>;
  onStatusUpdate: (status: string) => void;
  onCheckoutSuccess: (invoiceData: any) => void; // Invoice popup hook
}

export default function BookingButton({
  status,
  bookingId,
  checkoutPayload,
  guest,
  totalAmount,
  paymentMethod,
  paidAmount,
  paymentType,
  selectedRooms = [],
  selectedMealPlan,
  selectedAddons = [],
  nights,
  totalGuests,
  onSave,
  onStatusUpdate,
  onCheckoutSuccess,
}: BookingButtonProps) {
  const [loading, setLoading] = useState(false);

  const normalizedStatus = status?.toLowerCase();

  const getButtonConfig = () => {
    switch (normalizedStatus) {
      case "confirmed":
        return { text: "Check-in", className: "bg-green-600 hover:bg-green-700" };
      case "checkedin":
        return { text: "Check-out", className: "bg-red-600 hover:bg-red-700" };
      default:
        return { text: "Booking", className: "bg-gray-900 hover:bg-gray-700" };
    }
  };

  const { text, className } = getButtonConfig();

  const handleClick = async () => {
    setLoading(true);

    try {
      // ================= SAVE =================
      if (!normalizedStatus) {
        await onSave();
        return;
      }

      if (!bookingId) throw new Error("Booking ID missing");

      // ================= CHECK-IN =================
      if (normalizedStatus === "confirmed") {
        const data = await api.post<any>(`/api/Booking/check-in/${bookingId}`);
        onStatusUpdate(data.status?.toLowerCase() || "checkedin");
        return;
      }

      // ================= CHECK-OUT =================
      if (normalizedStatus === "checkedin") {
        const data = await api.post<any>("/api/Booking/check-out", checkoutPayload);
        console.log("Checkout API response:", data);

        onStatusUpdate(data.status?.toLowerCase() || "checkedout");

        // ------------------ Normalize invoice data ------------------
        const roomTotal = selectedRooms.reduce(
          (sum, r) => sum + (r.pricePerNight || 0) * nights,
          0
        );


        const mealTotal = data.mealPlanAmount * totalGuests * nights || 0;

        const addonTotal = selectedAddons.reduce(
          (sum, a) => (a.chargeType === "per_night" ? sum + a.price * nights : sum + a.price),
          0
        );

        const invoiceData = {
          booking: {
            bookingId: data.bookingId,
            bookingRef: data.bookingRef,           // ✅ keep backend bookingRef
            guestName: guest.firstName + " " + guest.lastName,
            checkin: data.actualCheckIn,
            checkout: data.actualCheckOut,
            roomNumbers: data.roomNumbers,
            totalNights: data.totalNights,
            roomTotal,
            mealTotal,
            addonTotal,
            totalAmount: data.totalAmount,
            subInvoiceNumber: data.subInvoiceNumber,
            invoiceNumber: data.invoiceNumber,
            advanceAmount: data.advanceAmount,
          },
          payments: [
            {
              method: paymentMethod || "",
              amount: paidAmount || 0,
              status: paymentType || "closed",
              paymentDate: new Date().toISOString(),
            },
          ],
          status: "checkedout",
        };

        console.log("Invoice data:", invoiceData);
        onCheckoutSuccess(invoiceData);
      }
    } catch (err) {
      console.error(err);
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`text-white ${className} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Processing..." : text}
    </Button>
  );
}
