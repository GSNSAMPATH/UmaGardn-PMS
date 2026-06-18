// app/admin/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { FaBook, FaSearch, FaTimesCircle } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { api } from "@/lib/api";
import SelectionDropdown from "@/app/components/SelectionButton";
import { FaC, FaRightFromBracket, FaRightToBracket } from "react-icons/fa6";

/* ---------------- CONSTANTS ---------------- */
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const MONTH_TO_INDEX: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

const BOOKING_SOURCE_COLORS = ["#0B0B0B", "#29374b", "#4b576b", "#919aac", "#c2cbda", "#e7f0fc", "#eff1f3"];

/* ---------------- TYPES ---------------- */
type DashboardOverview = {
  newBookings: number;
  checkIns: number;
  checkOuts: number;
  roomsAvailable: number;
  totalRooms: number;
  roomsOccupied: number;
  notReady: number;
  cancelledBookings: number;

  newBookingsLastPeriod: number;
  checkInsLastPeriod: number;
  checkOutsLastPeriod: number;
  roomsAvailableLastPeriod: number;

  todaysRevenue?: number;
};

type GuestBooking = {
  id: number;
  bookingId: number | string;
  bookingRef: string;
  guestName: string;
  phone: string;
  email: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  adults: number;
  children: number;
  nights: number;
  total: number;
  dueAmount?: number;
};

type GuestRow = {
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string | null;
  roomType: string;
  status: string;
  dueAmount: number;
};

type RangeType = "today" | "thisWeek" | "thisMonth" | "lastMonth";

type PeriodParams =
  | { period: "day"; year: number; month: number; day: number }
  | { period: "week"; year: number; week: number }
  | { period: "month"; year: number; month: number };

type SourceStat = { name: string; value: number };
type SourceStatsResponse = { month: string; sources: SourceStat[] };

/* ---------------- HELPERS ---------------- */
function safeNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatLKR(n: number) {
  return `LKR ${safeNum(n).toLocaleString()}`;
}

function kFmt(v: number) {
  const n = safeNum(v);
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

function normalizeSourceName(n: unknown) {
  const s = String(n ?? "").trim();
  return s ? s : "Unknown";
}

function colorForIndex(i: number) {
  return BOOKING_SOURCE_COLORS[i % BOOKING_SOURCE_COLORS.length];
}

interface Alert {
  message: string;
  time: string;
}

/**
 * IMPORTANT:
 * This matches your backend week logic exactly:
 * - jan1 (UTC)
 * - firstMonday = jan1 + (Monday - jan1.DayOfWeek)
 * - startDate = firstMonday + (week-1)*7
 */
function backendWeekNumber(dateLocal: Date) {
  const year = dateLocal.getFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1, 0, 0, 0));

  // JS getUTCDay(): 0=Sun..6=Sat, Monday=1
  const daysOffset = 1 - jan1.getUTCDay();
  const firstMonday = new Date(jan1);
  firstMonday.setUTCDate(jan1.getUTCDate() + daysOffset);

  const d = new Date(Date.UTC(year, dateLocal.getMonth(), dateLocal.getDate(), 0, 0, 0));
  const diffDays = Math.floor((d.getTime() - firstMonday.getTime()) / 86400000);
  return Math.floor(diffDays / 7) + 1; // week starts at 1
}

function monthIndexFromApiRow(m: any): number | null {
  if (typeof m === "number" && Number.isFinite(m)) {
    if (m >= 1 && m <= 12) return m - 1;
    if (m >= 0 && m <= 11) return m;
    return null;
  }

  const s = String(m ?? "").trim().toUpperCase();
  if (!s) return null;
  if (MONTH_TO_INDEX[s] !== undefined) return MONTH_TO_INDEX[s];

  const asNum = Number(s);
  if (Number.isFinite(asNum)) {
    if (asNum >= 1 && asNum <= 12) return asNum - 1;
    if (asNum >= 0 && asNum <= 11) return asNum;
  }
  return null;
}

/* ✅ Tooltip like screenshot */
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const v = safeNum(payload[0]?.value);

  return (
    <div className="rounded-xl bg-black/85 px-4 py-3 text-white shadow-lg border border-white/10">
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-lg font-semibold">{formatLKR(v)}</div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function AdminDashboard() {
  const [searchGuest, setSearchGuest] = useState("");
  const [selectedRange, setSelectedRange] = useState<RangeType>("today");
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [guestsRaw, setGuestsRaw] = useState<GuestBooking[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [monthlyChartData, setMonthlyChartData] = useState<{ month: string; revenue: number }[]>(() =>
    MONTH_LABELS.map((m) => ({ month: m, revenue: 0 }))
  );

  // ✅ Booking Source state
  const [bookingSourceRes, setBookingSourceRes] = useState<SourceStatsResponse | null>(null);
  const [bookingSourceLoading, setBookingSourceLoading] = useState(false);
  const [bookingSourceError, setBookingSourceError] = useState<string | null>(null);

  /* ---------- Static widgets (dummy) ---------- */
  const alerts = useMemo(
    () => [
      // { room: "207", message: "AC is not working.", time: "10:32 PM" },
      // { room: "105", message: "TV not responding.", time: "10:30 PM" },
      // { room: "310", message: "Water leakage reported.", time: "09:50 PM" },
    ],
    []
  );

  /* ---------- Build params (API) ---------- */
  const periodParams: PeriodParams = useMemo(() => {
    const now = new Date();

    if (selectedRange === "today") {
      return { period: "day", year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    }

    if (selectedRange === "thisWeek") {
      return { period: "week", year: now.getFullYear(), week: backendWeekNumber(now) };
    }

    if (selectedRange === "lastMonth") {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { period: "month", year: last.getFullYear(), month: last.getMonth() + 1 };
    }

    return { period: "month", year: now.getFullYear(), month: now.getMonth() + 1 };
  }, [selectedRange]);

  function buildDashboardQuery(p: PeriodParams) {
    if (p.period === "day") return { period: "day", year: p.year, month: p.month, day: p.day };
    if (p.period === "week") return { period: "week", year: p.year, week: p.week };
    return { period: "month", year: p.year, month: p.month };
  }

  function buildGuestsQuery(p: PeriodParams) {
    if (p.period === "day") return { status: "CheckedIn", year: p.year, month: p.month, day: p.day };
    if (p.period === "week") return { status: "CheckedIn", year: p.year, week: p.week };
    return { status: "CheckedIn", year: p.year, month: p.month };
  }

  /* ---------- Fetch Dashboard + Guests ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const dash = await api.get<DashboardOverview>("/api/Dashboard", buildDashboardQuery(periodParams));
        const guests = await api.get<GuestBooking[]>("/api/Booking/guest-management", buildGuestsQuery(periodParams));

        console.log(guests);
        if (!mounted) return;
        setOverview(dash ?? null);
        setGuestsRaw(Array.isArray(guests) ? guests : []);
      } catch (e) {
        console.error("API error:", e);
        if (!mounted) return;
        setOverview(null);
        setGuestsRaw([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [periodParams]);

  /* ---------- Fetch Monthly Revenue Chart (always full year) ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchMonthlyRevenueChart = async () => {
      try {
        const res = await api.get<any[]>("/api/Dashboard/monthly-revenue", { year: currentYear });
        const full = MONTH_LABELS.map((label) => ({ month: label, revenue: 0 }));

        (res ?? []).forEach((r) => {
          const idx = monthIndexFromApiRow(r?.month ?? r?.Month);
          if (idx === null) return;
          full[idx].revenue = safeNum(r?.revenue ?? r?.Revenue ?? r?.total ?? r?.amount);
        });

        if (mounted) setMonthlyChartData(full);
      } catch (e) {
        console.error("Monthly revenue API error:", e);
        if (mounted) setMonthlyChartData(MONTH_LABELS.map((m) => ({ month: m, revenue: 0 })));
      }
    };

    fetchMonthlyRevenueChart();
    return () => {
      mounted = false;
    };
  }, [currentYear]);

  /* ---------- Today Revenue (separate endpoint) ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchTodayRevenue = async () => {
      try {
        const now = new Date();

        const res = await api.get<any>("/api/Dashboard/revenue", {
          period: "day",
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
        });

        if (!mounted) return;

        const value = safeNum(res?.revenue ?? res?.totalRevenue ?? res?.amount ?? res);
        setTodayRevenue(value);
      } catch (err) {
        console.error("Today revenue error:", err);
        if (mounted) setTodayRevenue(0);
      }
    };

    fetchTodayRevenue();
    const interval = setInterval(fetchTodayRevenue, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ---------- Booking Source (month + year) ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchBookingSource = async () => {
      try {
        setBookingSourceLoading(true);
        setBookingSourceError(null);

        // We will use month/year based on selectedRange:
        // - today/thisWeek/thisMonth -> current month
        // - lastMonth -> last month
        const now = new Date();
        const ym =
          selectedRange === "lastMonth"
            ? { year: new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear(), month: new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth() + 1 }
            : { year: now.getFullYear(), month: now.getMonth() + 1 };

        const res = await api.get<SourceStatsResponse>("/api/Dashboard/source-stats", {
          year: ym.year,
          month: ym.month,
        });

        if (!mounted) return;

        const safe: SourceStatsResponse = {
          month: String((res as any)?.month ?? ""),
          sources: Array.isArray((res as any)?.sources) ? (res as any).sources : [],
        };

        setBookingSourceRes(safe);
      } catch (e: any) {
        console.error("Booking source API error:", e);
        if (!mounted) return;
        setBookingSourceRes(null);
        setBookingSourceError(e?.message || "Failed to load booking sources");
      } finally {
        if (mounted) setBookingSourceLoading(false);
      }
    };

    fetchBookingSource();
    return () => {
      mounted = false;
    };
  }, [selectedRange]);

  
  /* ---------- Derived ---------- */
  const guests: GuestRow[] = useMemo(() => {
    return guestsRaw.map((g) => ({
      bookingId: String(g.bookingRef ?? g.bookingId ?? g.id ?? ""),
      guestName: g.guestName ?? "-",
      checkIn: g.checkIn ?? "-",
      checkOut: g.checkOut,
      roomType: g.roomType ?? "-",
      status: g.status ?? "-",
      dueAmount: g.total ?? 0,
    }));
  }, [guestsRaw]);

  const filteredGuests = useMemo(() => {
    const q = searchGuest.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) => (g.guestName || "").toLowerCase().includes(q));
  }, [guests, searchGuest]);

  const ov: DashboardOverview = overview ?? {
    newBookings: 0,
    checkIns: 0,
    checkOuts: 0,
    roomsAvailable: 0,
    totalRooms: 0,
    roomsOccupied: 0,
    notReady: 0,
    cancelledBookings: 0,
    newBookingsLastPeriod: 0,
    checkInsLastPeriod: 0,
    checkOutsLastPeriod: 0,
    roomsAvailableLastPeriod: 0,
  };

  const roomsAvailability = useMemo(
    () => [
      { name: "Occupied", value: safeNum(ov.roomsOccupied), color: "#FF8A00" },
      { name: "Available", value: safeNum(ov.roomsAvailable), color: "#10B981" },
      { name: "Not Ready", value: safeNum(ov.notReady), color: "#EF4444" },
    ],
    [ov]
  );

  const bookingSourceData = useMemo(() => {
    const src = bookingSourceRes?.sources ?? [];
    const normalized = src
      .map((s, idx) => ({
        name: normalizeSourceName((s as any)?.name),
        value: safeNum((s as any)?.value),
        color: colorForIndex(idx),
      }))
      .filter((x) => x.value > 0);

    // If API sends nothing useful, show empty
    return normalized;
  }, [bookingSourceRes]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-500 border-gray-100 py-6">
      <div className="items-center justify-between mb-6 pt-14 py-4 border-gray-200 p-6">
        {/* Overview */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-inter font-semibold text-gray-800 mb-4">Overview</h3>
            <SelectionDropdown
              label="select"
              value={selectedRange}
              onChange={(v) => setSelectedRange(v as RangeType)}
              items={[
                { label: "Today", value: "today" },
                { label: "This Week", value: "thisWeek" },
                { label: "This Month", value: "thisMonth" },
                { label: "Last Month", value: "lastMonth" },
              ]}
            />
          </div>

<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-7 gap-4">
  <StatCard
    title="New Bookings"
    value={safeNum(ov.newBookings)}
    tag={<FaBook />}
    color="blue"
  />

  <StatCard
    title="Checked In"
    value={safeNum(ov.checkIns)}
    tag={<FaRightToBracket />}
    color="green"
  />

  <StatCard
    title="Checked Out"
    value={safeNum(ov.checkOuts)}
    tag={<FaRightFromBracket />}
    color="red"
  />

  <StatCard
    title="Occupied Rooms"
    value={safeNum(ov.roomsOccupied)}
    tag={<FaRightToBracket />}
    color="orange"
  />

  <StatCard
    title="Cancelled Bookings"
    value={safeNum(ov.cancelledBookings)}
    tag={<FaTimesCircle />}
    color="red"
  />

  <div className="xl:col-span-2">
    <StatCard
      title="Today's Revenue"
      value={formatLKR(todayRevenue)}
      tag={<span className="text-xs">today</span>}
      color="purple"
    />
  </div>
</div>



          {loading && <div className="text-xs text-gray-400 mt-3">Loading dashboard...</div>}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* ✅ UPDATED CHART UI (like screenshot) */}
            <div className="rounded-2xl border border-gray-200/10 bg-white p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Revenue</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-gray/50 text-black/80">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>

              <div style={{ width: "100%", height: 260 }} className="-mx-4 lg:-mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="purpleFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.95} />
                        <stop offset="55%" stopColor="#8B5CF6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#0c0c0c" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="rgba(3, 2, 2, 0.1)" vertical={false} />

                    <XAxis dataKey="month" tick={{ fill: "rgba(8, 6, 6, 0.65)", fontSize: 12 }} axisLine={false} tickLine={false} />

                    <YAxis
                      tickFormatter={(v) => kFmt(Number(v))}
                      tick={{ fill: "rgba(5, 4, 4, 0.55)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, "auto"]}
                    />

                    <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "rgba(7, 2, 2, 0.69)", strokeWidth: 2 }} />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0d0d0e"
                      strokeWidth={3}
                      fill="url(#purpleFill)"
                      dot={false}
                      activeDot={{ r: 6, stroke: "#0e0c0c", strokeWidth: 2, fill: "#0c0b0e" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Guests */}
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-700">Guests</h2>
                  {loading && <span className="text-xs text-gray-400">Fetching...</span>}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                    <FaSearch />
                    <input
                      className="ml-2 bg-transparent outline-none text-sm"
                      placeholder="Search Guest Name"
                      value={searchGuest}
                      onChange={(e) => setSearchGuest(e.target.value)}
                    />
                  </div>
                  <button className="hidden md:block bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">+ New Guest</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-150 whitespace-nowrap md:w-full text-sm ">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="py-3 text-left">Booking ID</th>
                      <th className="py-3 text-left">Guest Name</th>
                      <th className="py-3 text-left">Check-In</th>
                      <th className="py-3 text-left">Check-Out</th>
                      <th className="py-3 text-left">Room Type</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Due Amount</th>
                      <th className="py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredGuests.map((g, i) => (
                      <tr key={`${g.bookingId}-${i}`} className="border-b last:border-b-0">
                        <td className="py-3">{g.bookingId}</td>
                        <td>{g.guestName}</td>
                        <td>{g.checkIn}</td>
                        <td>{g.checkOut ?? "-"}</td>
                        <td>{g.roomType}</td>
                        <td>
                          <StatusBadge status={g.status} />
                        </td>
                        <td>{formatLKR(g.dueAmount)}</td>
                        <td>
                          <button className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-semibold">Check-Out</button>
                        </td>
                      </tr>
                    ))}

                    {!loading && filteredGuests.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-gray-400">
                          No guests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 gap-0 md:gap-6 lg:gap-0 grid md:grid-cols-2 lg:grid-cols-1">
            {/* Rooms Availability */}
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Rooms Availability</h3>

              <div className="flex items-center gap-4">
                <div style={{ width: 140, height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={roomsAvailability} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60}>
                        {roomsAvailability.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1">
                  {roomsAvailability.map((r, idx) => (
                    <div key={idx} className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                        <span className="text-sm">{r.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">{safeNum(r.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ✅ Booking Source (API) */}
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-gray-900">Booking Source</h3>
                <span className="text-[12px] text-gray-500">{bookingSourceRes?.month ?? ""}</span>
              </div>
              <div className="h-px bg-gray-200 mt-3 mb-5" />

              {bookingSourceLoading ? (
                <div className="text-[14px] text-gray-500">Loading...</div>
              ) : bookingSourceError ? (
                <div className="text-[14px] text-red-600">{bookingSourceError}</div>
              ) : bookingSourceData.length === 0 ? (
                <div className="text-[14px] text-gray-500">No source data for this period.</div>
              ) : (
                <div className="flex items-center gap-8">
                  <div className="shrink-0" style={{ width: 150, height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingSourceData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={0}
                          outerRadius={65}
                          stroke="transparent"
                        >
                          {bookingSourceData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-4">
                    {bookingSourceData.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: b.color }} />
                          <span className="text-[15px] text-gray-800">{b.name}</span>
                        </div>
                        <span className="text-[15px] text-gray-600 tabular-nums">{b.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="hidden lg:block bg-white max-h-[300px] overflow-y-auto hide-scrollbar rounded-2xl shadow border border-gray-100 h-fit px-6">
              <div className="sticky top-0 z-20 bg-white py-4 border-b border-gray-100">
                <h2 className="text-[16px] font-semibold">Alerts</h2>
              </div>

              <div className="space-y-4 py-4">
                {alerts.length > 0 ? (
                  alerts.map((a: Alert, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-red-500 text-white p-2 rounded-full">
                        <IoIosWarning size={16} />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-[14px] text-gray-700">{a.message}</p>
                        <p className="text-xs text-gray-500">{a.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-gray-400">No alerts available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Presentational Components
--------------------------- */

function StatCard({
  title,
  value,
  tag,
  color,
}: {
  title: string;
  value: number | string;
  tag: React.ReactNode;
  color?: string;
}) {
  const colorClasses =
    color === "green"
      ? "text-green-600 bg-green-100 border border-green-600"
      : color === "red"
      ? "text-red-600 bg-red-100 border border-red-600"
      : color === "orange"
      ? "text-orange-600 bg-orange-100 border border-orange-600"
      : color === "purple"
      ? "text-purple-600"
      : color === "blue"
      ? "text-blue-600 bg-blue-100 border border-blue-600"
      : "text-gray-700 bg-gray-100 border border-gray-300";

  return (
    <div className={`${color === "purple" ? "bg-gray-100" : "bg-gray-100"}  rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col justify-between h-full`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <div className={`text-sm font-medium h-8 w-8 flex items-center justify-center rounded-full ${colorClasses}`}>{tag}</div>
      </div>
      <div className="mt-4">
        <div className="text-[26px] font-inter font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-400 mt-1">Updated from API</div>
      </div>
    </div>
  );
}



function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CheckedIn: "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs",
    CheckedOut: "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs",
    "Pending Arrival": "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs",
    "Check-In": "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs",
    "Check-Out": "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs",
  };

  return <span className={map[status] ?? "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"}>{status}</span>;
}
