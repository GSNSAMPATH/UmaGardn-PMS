"use client";

import React, { useMemo, useState } from "react";
import { CardContent } from "@/app/components/card";
import { Input } from "@/app/components/input";
import { Button } from "@/app/components/button";
import { Select } from "@/app/components/Select";
import { Label } from "@/app/components/label";
import {
  FaIdBadge,
  FaIdCard,
  FaUser,
  FaBed,
  FaCalendarAlt,
  FaMoneyBill,
  FaBan,
} from "react-icons/fa";

import { api } from "@/lib/api";

const Section = ({ title, children }: any) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
    <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const money = (n?: number) =>
  `LKR. ${(Number(n || 0)).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

export default function CancelBookingScreen() {
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // booking object (from /api/Booking/guest)
  const [booking, setBooking] = useState<any>(null);

  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const bookingId = booking?.bookingId ?? null;
  const booking_ref = booking?.bookingRef ?? "";

  const totalAmount = useMemo(() => Number(booking?.totalAmount || 0), [booking]);

  const advancePaid = useMemo(() => {
    const payments = booking?.payments ?? [];
    return payments
      .filter((p: any) => String(p.status).toLowerCase() === "advance")
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  }, [booking]);

  const paymentStatus = useMemo(() => {
    const payments = booking?.payments ?? [];
    if (!payments.length) return "";
    // show the latest status if possible, otherwise first
    const last = payments[payments.length - 1];
    return String(last?.status ?? payments[0]?.status ?? "");
  }, [booking]);

  const checkin = booking?.checkinDate ? String(booking.checkinDate).split("T")[0] : "";
  const checkout = booking?.checkoutDate ? String(booking.checkoutDate).split("T")[0] : "";

  async function fetchBookingByGuest() {
    if (!idType || !idNumber) return;

    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      // ✅ same pattern as your BookingScreen
      const data = await api.get<any>("/api/Booking/guest", { idType, idNumber });

      if (!data) {
        setBooking(null);
        setError("Booking not found for this ID.");
        setRefundAmount(0);
        return;
      }

      setBooking(data);

      // default refund amount = total advance
      const payments = data?.payments ?? [];
      const adv = payments
        .filter((p: any) => String(p.status).toLowerCase() === "advance")
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      setRefundAmount(Number(adv || 0));
    } catch (e: any) {
      setError(e?.message || "Failed to fetch booking.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCancellation() {
    setError(null);
    setSuccess(null);

    if (!bookingId) return setError("No booking loaded.");
    if (!reason) return setError("Please select a cancellation reason.");
    if (refundAmount < 0) return setError("Refund amount cannot be negative.");

    try {
      setSubmitting(true);

      // ✅ IMPORTANT:
      // Your controller is: [HttpPut("cancel")] CancelBooking([FromQuery] int bookingId, [FromQuery] decimal refundAmount)
      // So bookingId/refundAmount MUST be sent as query params, not JSON body.
      const url = `/api/Booking/cancel?bookingId=${encodeURIComponent(
        bookingId
      )}&refundAmount=${encodeURIComponent(refundAmount)}`;

      await api.put(url, {}); // body can be empty

      setSuccess("Booking cancelled successfully.");
      setIdNumber("");
      setBooking(null);
      setReason("");
      setComment("");
      setRefundAmount(0);
      setError(null);
      setSuccess(null);
      setBooking((prev: any) => (prev ? { ...prev, status: "cancelled" } : prev));
    } catch (e: any) {
      setError(e?.message || "Cancellation failed.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 py-16 overflow-y-auto hide-scrollbar font-inter">
      <div className="fixed top-0 w-full bg-white py-5 px-4 border-b border-gray-200">
        <h2 className="text-xl pl-3 font-semibold flex items-center gap-2">
          <FaBan /> Cancel Booking
        </h2>
      </div>

      <div className="mt-1">
        <CardContent className="rounded-2xl space-y-8 pt-6">
          {/* SEARCH */}
          <Section title="Search Booking">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaIdBadge size={12} /> ID Type
                </Label>
                <Select value={idType} onChange={(e) => setIdType(e.target.value)}>
                  <option value="" disabled>
                    Select ID Type
                  </option>
                  <option value="NIC">NIC</option>
                  <option value="Passport">Passport</option>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaIdCard size={12} /> ID Number
                </Label>
                <Input
                  placeholder="ID / Passport Number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchBookingByGuest()}
                />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaIdCard size={12} /> Booking Ref
                </Label>
                <Input placeholder="Booking Ref" value={booking_ref} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaUser size={12} /> Guest Name
                </Label>
                <Input placeholder="Guest Name" value={booking?.guests?.[0]?.name ?? ""} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaBed size={12} /> Room type
                </Label>
                <Input placeholder="Room type" value={booking?.rooms?.[0]?.roomTypeName ?? ""} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaCalendarAlt size={12} /> Check-In
                </Label>
                <Input placeholder="Check-In" value={checkin} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaCalendarAlt size={12} /> Check-Out
                </Label>
                <Input placeholder="Check-Out" value={checkout} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaUser size={12} /> Payment Status
                </Label>
                <Input placeholder="Payment Status" value={paymentStatus} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaUser size={12} /> Total Amount
                </Label>
                <Input placeholder="Total Amount" value={money(totalAmount)} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaUser size={12} /> Advance Paid
                </Label>
                <Input placeholder="Advance Paid" value={money(advancePaid)} disabled />
              </div>

              <div className="md:col-span-2 flex gap-3"></div>
            </div>
          </Section>

          <Section title="Reason for Cancellation Booking">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaUser size={12} /> Reason
                </Label>
                {/* ✅ FIX: bind to reason (not idType) */}
                <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="" disabled>
                    Select Reason
                  </option>
                  <option value="Guest request">Guest request</option>
                  <option value="No show">No show</option>
                  <option value="Payment issue">Payment issue</option>
                  <option value="Overbooking">Overbooking</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1 text-sm">
                  <FaUser size={12} /> Additional Comments
                </Label>
                {/* ✅ FIX: bind to comment (not idNumber) */}
                <Input
                  placeholder="Additional Comments"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* REFUND */}
          <Section title="Refund Details">
            <div className="space-y-4 text-[14px] font-semibold">
              <div className="flex justify-between bg-gray-100 p-3 rounded-xl border border-gray-200">
                <span>Total Booking Amount</span>
                <span>{money(totalAmount)}</span>
              </div>

              <div className="flex justify-between bg-gray-100 p-3 rounded-xl border border-gray-200">
                <span>Advance Paid</span>
                <span>{money(advancePaid)}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
                <span className="text-lg font-semibold">Refund amount</span>
                <div className="w-full md:w-[420px]">
                  <Input
                    type="number"
                    min={0}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    placeholder="Enter refund amount"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Usually refund ≤ advance paid. Adjust based on policy.
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setBooking(null);
                  setReason("");
                  setComment("");
                  setRefundAmount(0);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={submitting}
              >
                Keep
              </Button>

              <Button onClick={confirmCancellation} disabled={submitting} className="px-6">
                {submitting ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          </Section>

          {/* optional messages without changing layout */}
          {error && <div className="text-sm text-red-600 -mt-4">{error}</div>}
          {success && <div className="text-sm text-green-600 -mt-4">{success}</div>}
          {loading && <div className="text-sm text-gray-500 -mt-4">Loading...</div>}
        </CardContent>
      </div>
    </div>
  );
}