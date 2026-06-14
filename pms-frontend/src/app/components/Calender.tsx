"use client";

import { api } from "@/lib/api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/* ---------------- TYPES ---------------- */
type BookingStatus =
  | "confirmed"
  | "arrived"
  | "checkedout"
  | "new"
  | "checkedin";

type Booking = {
  booking_ref: string;
  roomId: number; // ✅ UNIQUE
  roomNumber: string; // display only
  start: string;
  end: string;
  label: string;
  status: BookingStatus;

  // ✅ extra fields for hover card
  guestName?: string;
  roomType?: string;
  agent?: string;
  nights?: number;
  mealPlan?: string;
  total?: number;
  paymentStatus?: string;
};

type Room = {
  id: number; // ✅ UNIQUE
  number: string;
  type: string;
  status: string;
};

/* ---------------- DATE HELPERS ---------------- */
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const eachDayOfMonth = (d: Date) => {
  const days: Date[] = [];
  const cur = new Date(startOfMonth(d));
  const end = endOfMonth(d);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const iso = (d: Date) => d.toISOString().split("T")[0];

/* ---------------- STYLES ---------------- */
const bookingColor = (s: BookingStatus) => {
  if (s === "confirmed") return "bg-sky-400/60 border-sky-500";
  if (s === "arrived" || s === "checkedin")
    return "bg-green-400/60 border-green-500";
  if (s === "checkedout") return "bg-red-400/60 border-red-500";
  return "bg-orange-400";
};

const statusBar = (s: string) => {
  if (s === "Ready") return "bg-green-500";
  if (s === "Clean Up") return "bg-orange-400";
  return "bg-red-500";
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = Array.from({ length: 50 }, (_, i) => 2010 + i);

/* ---------------- HOVER CARD ---------------- */
function BookingHoverCard({ b }: { b: Booking }) {
  const money = (v?: number) =>
    (Number(v ?? 0) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmt = (d?: string) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const nights = (d1: string, d2: string) => {
    const start = new Date(d1);
    const end = new Date(d2);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="w-[260px] rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {b.guestName || "Guest"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {b.booking_ref || "-"}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
            {String(b.status || "confirmed")}
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
            {b.paymentStatus || "Paid"}
          </span>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      <div className="p-4 text-sm">
        {[
          ["Room No", b.roomNumber ?? "-"],
          ["Room Type", b.roomType ?? "-"],
          ["Check-in", fmt(b.start)],
          ["Check-out", fmt(b.end)],
          ["Agent", b.agent ?? "-"],
          ["Nights", nights(b.start, b.end) || "-"],
          ["Meal Plan", b.mealPlan ?? "-"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-1">
            <span className="text-gray-400">{k}</span>
            <span className="text-gray-900 font-medium">{String(v)}</span>
          </div>
        ))}

        <div className="mt-2 flex justify-between py-1">
          <span className="text-gray-400">Total</span>
          <span className="text-gray-900 font-semibold">
            LKR {money(b.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */
export default function BookingCalendar() {
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // ✅ hover state (fixed tooltip)
  const [hovered, setHovered] = useState<Booking | null>(null);
  const [hoverMeta, setHoverMeta] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);

  // ✅ measure real card height (fix top not showing)
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardH, setCardH] = useState(260);

  useEffect(() => {
    const update = () => {
      if (!cardRef.current) return;
      const h = cardRef.current.getBoundingClientRect().height;
      if (h && !Number.isNaN(h)) setCardH(h);
    };

    // wait next paint so DOM exists
    requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [hovered]);

  const days = useMemo(() => eachDayOfMonth(current), [current]);
  const totalDays = days.length;

  const showHover = (b: Booking, el: HTMLElement) => {
    const r = el.getBoundingClientRect();

    const CARD_W = 260;
    const GAP = 10;
    const PAD = 10;

    const spaceAbove = r.top;
    const spaceBelow = window.innerHeight - r.bottom;

    const placement: "top" | "bottom" = spaceBelow >= spaceAbove ? "bottom" : "top";

    // keep inside viewport horizontally
    const left = Math.max(
      PAD,
      Math.min(r.left, window.innerWidth - CARD_W - PAD)
    );

    // ✅ compute top so it never goes off-screen
    const top =
      placement === "bottom"
        ? Math.min(window.innerHeight - cardH - PAD, r.bottom + GAP)
        : Math.max(PAD, r.top - GAP - cardH);

    setHovered(b);
    setHoverMeta({ top, left, placement });
  };

  const hideHover = () => {
    setHovered(null);
    setHoverMeta(null);
  };

  /* -------- FETCH CALENDAR API -------- */
  useEffect(() => {
    let mounted = true;

    const fetchCalendar = async () => {
      const month = current.getMonth() + 1;
      const year = current.getFullYear();

      try {
        const data = await api.get<any[]>("/api/Booking/calendar", {
          month,
          year,
        });

        const mapped: Booking[] = (data ?? []).map((b: any) => ({
          booking_ref: b.booking_ref ?? b.bookingRef ?? "",
          roomId: Number(b.roomId ?? b.room_id ?? b.room?.id ?? 0),
          roomNumber: String(b.roomNumber ?? b.room_number ?? ""),
          start: b.checking ?? b.checkin ?? b.checkIn ?? b.start,
          end: b.checkout ?? b.checkOut ?? b.end,
          label: b.booking_ref ?? b.bookingRef ?? "",
          status: String(b.status ?? "new").toLowerCase() as BookingStatus,

          guestName: b.guestName ?? b.guest_name ?? b.customerName ?? b.name,
          roomType:
            b.roomType ??
            b.room_type ??
            b.room?.type ??
            b.roomTypeName ??
            b.room?.roomTypeName,
          agent: b.agent ?? b.source ?? b.bookingSource ?? b.channel,
          nights: Number(b.nights ?? b.totalNights ?? 0) || undefined,
          mealPlan: b.mealPlan ?? b.meal_plan ?? b.meal ?? "-",
          total: Number(b.total ?? b.totalAmount ?? b.amount ?? 0) || undefined,
          paymentStatus:
            b.paymentStatus ??
            b.payment_status ??
            (b.paid === true ? "Paid" : undefined),
        }));

        if (mounted)
          setBookings(
            mapped.filter((x) => Number.isFinite(x.roomId) && x.roomId > 0)
          );
      } catch (err) {
        console.error("Calendar API error", err);
      }
    };

    fetchCalendar();
    return () => {
      mounted = false;
    };
  }, [current]);

  /* -------- FETCH ROOMS API -------- */
  useEffect(() => {
    let mounted = true;

    const fetchRooms = async () => {
      try {
        const data = await api.get<any[]>("/api/Rooms");

        const mapped: Room[] = (data ?? []).map((r: any) => ({
          id: Number(r.id ?? r.roomId ?? 0),
          number: String(r.roomNumber ?? r.number ?? ""),
          type: r.roomTypeName ?? r.roomType ?? "",
          status:
            r.status === "Available"
              ? "Ready"
              : r.status === "Occupied"
              ? "Dirty"
              : "Clean Up",
        }));

        if (mounted)
          setRooms(mapped.filter((x) => Number.isFinite(x.id) && x.id > 0));
      } catch (err) {
        console.error("Rooms API error", err);
      }
    };

    fetchRooms();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-gray-100 min-h-screen py-16 font-inter">
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center bg-white py-3 px-4 md:px-8 text-gray-800 ">
        <h2 className="text-[20px] font-semibold flex flex-1">
          Reservation Calendar
        </h2>

        <div className="flex items-center justify-between w-full md:w-auto md:min-w-[350px] px-2 md:px-4 py-3">
          <button
            onClick={() =>
              setCurrent(
                new Date(current.getFullYear(), current.getMonth() - 1, 1)
              )
            }
          >
            <FaChevronLeft />
          </button>

          <div className="flex gap-3 text-[14px] font-semibold">
            <select
              value={current.getMonth()}
              onChange={(e) =>
                setCurrent(new Date(current.getFullYear(), +e.target.value, 1))
              }
            >
              {months.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={current.getFullYear()}
              onChange={(e) =>
                setCurrent(new Date(+e.target.value, current.getMonth(), 1))
              }
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              setCurrent(
                new Date(current.getFullYear(), current.getMonth() + 1, 1)
              )
            }
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="text-gray-800 p-3 md:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
        <div className="pb-10 space-y-1">
          <div
            className="grid bg-white py-2 text-[16px] rounded-xl"
            style={{ gridTemplateColumns: "70px 100px 100px 1fr" }}
          >
            <div className="col-span-31 text-center py-2 font-medium">
              {current.toLocaleString("default", { month: "long" })}
            </div>
          </div>

          <div
            className="grid text-[14px] bg-white rounded-xl py-2 text-right"
            style={{ gridTemplateColumns: "70px 100px 100px 1fr" }}
          >
            <div className="p-2 font-semibold border-r border-gray-300">
              Room No
            </div>
            <div className="p-2 font-semibold border-r border-gray-300">
              Type
            </div>
            <div className="p-2 font-semibold border-r border-gray-300">
              Status
            </div>

            <div className="grid grid-cols-31 text-center text-xs">
              {days.map((d) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={iso(d)}
                    className={`flex justify-center py-2 border-l text-[12px] items-center border-gray-200 ${
                      isWeekend ? "text-red-500 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {String(d.getDate()).padStart(2, "0")}
                  </div>
                );
              })}
            </div>
          </div>

          {rooms.map((room) => (
            <div
              key={room.id}
              className="relative grid border-b bg-white rounded-xl text-gray-200 text-[14px] items-center"
              style={{ gridTemplateColumns: "70px 100px 100px 1fr" }}
            >
              <div className="p-4 text-gray-500 border-r border-gray-300">
                {room.number}
              </div>
              <div className="p-4 text-gray-500">{room.type}</div>

              <div className="flex items-center gap-2 text-gray-500 border-r border-gray-300">
                <span
                  className={`w-2 h-10 rounded-full ${statusBar(room.status)}`}
                />
                {room.status}
              </div>

              <div className="relative grid grid-cols-31 h-full text-gray-200">
                {days.map((d) => (
                  <div key={iso(d)} className="border-l" />
                ))}

                {bookings
                  .filter((b) => String(b.roomId) === String(room.id))
                  .map((b, i) => {
                    const ms = startOfMonth(current);
                    const me = endOfMonth(current);

                    const start = new Date(b.start);
                    const end = new Date(b.end);

                    if (
                      Number.isNaN(start.getTime()) ||
                      Number.isNaN(end.getTime())
                    )
                      return null;

                    if (end < ms || start > me) return null;

                    const clampedStart = start < ms ? ms : start;
                    const clampedEnd = end > me ? me : end;

                    const startDay =
                      (clampedStart.getTime() - ms.getTime()) / 86400000 +
                      (start < ms ? 0 : 0.5 - 0.3);

                    const endDay =
                      (clampedEnd.getTime() - ms.getTime()) / 86400000 +
                      (end > me ? 1 : 0.5 - 0.2);

                    const leftPct = (startDay / totalDays) * 100;
                    const widthPct = ((endDay - startDay) / totalDays) * 100;

                    const startsBeforeMonth = start < ms;
                    const endsAfterMonth = end > me;
                    const endsInsideMonth = !endsAfterMonth;

                    return (
                      <div
                        key={`${b.booking_ref}-${b.roomId}-${i}`}
                        className={`absolute top-2 h-[40px] md:h-[55px] text-black border border-l-7 border-gray-200 text-xs px-2 flex items-center cursor-pointer ${bookingColor(
                          b.status
                        )}`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          borderRadius:
                            startsBeforeMonth && endsInsideMonth
                              ? "0 8px 8px 0"
                              : "8px",
                        }}
                        onMouseEnter={(e) => showHover(b, e.currentTarget)}
                        onMouseLeave={hideHover}
                      >
                        {!startsBeforeMonth && (
                          <span className="truncate text-[10px] md:text-xs">{b.label}</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        </div>
        </div>
      </div>

      {/* ✅ FIXED HOVER CARD (auto up/down + never off-screen) */}
      {hovered && hoverMeta && (
        <div
          className="hidden md:block fixed z-[999999]"
          style={{ top: hoverMeta.top, left: hoverMeta.left }}
          onMouseEnter={() => setHovered(hovered)}
          onMouseLeave={hideHover}
        >
          <div ref={cardRef}>
            <BookingHoverCard b={hovered} />
          </div>
        </div>
      )}
    </section>
  );
}
