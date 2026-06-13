"use client";

import SelectionDropdown from "@/app/components/SelectionButton";
import { api } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaBook, FaBed } from "react-icons/fa";
import { FaBookAtlas, FaRightFromBracket, FaRightToBracket } from "react-icons/fa6";
import { IoIosWarning } from "react-icons/io";

/* ---------------- TYPES ---------------- */
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

type DashboardOverview = {
  newBookings: number;
  checkIns: number;
  checkOuts: number;
  roomsAvailable: number;
  totalRooms: number;
  roomsOccupied: number;
  notReady: number;

  newBookingsLastPeriod: number;
  checkInsLastPeriod: number;
  checkOutsLastPeriod: number;
  roomsAvailableLastPeriod: number;
};

type RoomCleanItem = {
  room: string;
  status: string;
  task: "Clean" | "Dirty";
  assignee: string;
};

type AlertItem = {
  message: string;
  time: string;
};

/* ---------------- HELPERS ---------------- */
function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pctChange(current: number, prev: number) {
  if (prev <= 0) return 0;
  return ((current - prev) / prev) * 100;
}

// Week range (Mon-Sun)
function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // days since Monday
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function endOfWeekSunday(d: Date) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
function toYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type PeriodParams =
  | { period: "month"; year: number; month: number }
  | { period: "week"; year: number; month: number; startDate: string; endDate: string }
  | { period: "day"; year: number; month: number; day: number };

function labelFromSelected(selectedtype: string) {
  if (selectedtype === "thisWeek") return "This Week";
  if (selectedtype === "lastMonth") return "Last Month";
  if (selectedtype === "Day") return "Today";
  return "Today";
}


function rangeHint(p: PeriodParams) {
  if (p.period === "week") return `Week: ${p.startDate} → ${p.endDate}`;
  return `Month: ${p.year}-${String(p.month).padStart(2, "0")}`;
}

/* ---------------- COMPONENT ---------------- */
export default function FrontOfficeDashboard() {
  const [selectedtype, setSelectedtype] = useState<string>("Day");
  const [searchBooking, setSearchBooking] = useState("");
  const [bookings, setBookings] = useState<GuestBooking[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // keep your current dummy arrays (you can later move to API)
  const roomClean: RoomCleanItem[] = [
    // { room: "#123", status: "Allocated", task: "Clean", assignee: "Andrew" },
  ];

  const alerts: AlertItem[] = [
    // { message: "Room 207: AC is not working.", time: "10:32 PM" },
  ];

  // ✅ now supports thisWeek + thisMonth + lastMonth
  const periodParams = useMemo<PeriodParams>(() => {
    const now = new Date();

    if (selectedtype === "Day") {
      return {
        period: "day",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      };
    }

    if (selectedtype === "thisWeek") {
      const start = startOfWeekMonday(now);
      const end = endOfWeekSunday(now);
      return {
        period: "week",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        startDate: toYMD(start),
        endDate: toYMD(end),
      };
    }

    const thisMonth = { month: now.getMonth() + 1, year: now.getFullYear() };
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = { month: last.getMonth() + 1, year: last.getFullYear() };

    if (selectedtype === "lastMonth") {
      return { period: "month", ...lastMonth };
    }

    return { period: "month", ...thisMonth };
  }, [selectedtype]);


  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // ✅ 1) Overview from /api/Dashboard
        // For weekly: send startDate/endDate
        const dash = await api.get<DashboardOverview>("/api/Dashboard", {
          period: periodParams.period,
          year: periodParams.year,
          month: periodParams.month,

          ...(periodParams.period === "week"
            ? { startDate: periodParams.startDate, endDate: periodParams.endDate }
            : {}),

          ...(periodParams.period === "day"
            ? { day: periodParams.day }
            : {}),
        });

        // ✅ 2) Guest list (same logic)
        const guests = await api.get<GuestBooking[]>("/api/Booking/guest-management", {
          status: "CheckedIn",
          year: periodParams.year,
          month: periodParams.month,
          ...(periodParams.period === "week"
            ? { startDate: periodParams.startDate, endDate: periodParams.endDate }
            : {}),
        });

        if (!mounted) return;

        setOverview(dash ?? null);
        setBookings(Array.isArray(guests) ? guests : []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60 * 60 * 1000); // refresh every 1 hour
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [periodParams]);

  /* ---------------- SEARCH ---------------- */
  const filteredBookings = useMemo(() => {
    const q = searchBooking.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => (b.guestName || "").toLowerCase().includes(q));
  }, [bookings, searchBooking]);

  /* ---------------- STATS ---------------- */
  const newBookings = safeNum(overview?.newBookings);
  const roomsAvailable = safeNum(overview?.roomsAvailable);
  const roomsOccupied = safeNum(overview?.roomsOccupied);
  const totalRooms = safeNum(overview?.totalRooms);

  const newBookingsPct = pctChange(newBookings, safeNum(overview?.newBookingsLastPeriod));
  const roomsAvailablePct = roomsAvailable / totalRooms * 100
  const roomsOccupiedPct = roomsOccupied / totalRooms * 100

  const fmt = (n?: number) => safeNum(n).toLocaleString();
  const dropdownLabel = labelFromSelected(selectedtype);
  const periodText = rangeHint(periodParams);
  // const totalLabel = periodParams.period === "week" ? "Total in this week" : "Total in this month";
  const totalLabel = periodParams.period === "day" ? "Total in this day" : "Total in this month";

  return (
    <div className="p-6 bg-gray-100 min-h-screen pt-20 text-gray-600">
      <div className="flex flex-row w-full overflow-x-auto gap-4 ">
        <div className="flex flex-col border border-gray-100 w-full">
          <div className="flex flex-col bg-white rounded-2xl mb-6">
            <div className="flex flex-row justify-between mt-4 items-center px-6">
              <div className="flex flex-col">
                <h1 className="text-[16px] font-semibold font-[inter]">Overview</h1>
                <p className="text-xs text-gray-400 mt-1">{periodText}</p>
              </div>

              <SelectionDropdown
                label={dropdownLabel}
                value={selectedtype}
                items={[
                  // { label: "This Week", value: "thisWeek" },
                  // { label: "This Month", value: "thisMonth" },
                  // { label: "Last Month", value: "lastMonth" },
                  { label: "Today", value: "Day"}
                ]}
                onChange={(value) => setSelectedtype(value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
              {/* Total Rooms */}
              <div className="bg-gray-100 rounded-2xl shadow flex flex-col border border-gray-200 px-6 py-4">
                <p className="flex flex-row font-bold text-gray-600 justify-between p-1 text-[14px] rounded-xl mb-2">
                  Total Rooms{" "}
                  <span className="text-sm text-blue-600 bg-blue-200 rounded-full p-2">
                    <FaBed />
                  </span>
                </p>
                <h2 className="text-3xl font-bold">
                  {fmt(totalRooms)}{" "}
                  <span className="text-sm text-gray-500 mt-2">100%</span>
                </h2>
                <span className="text-sm text-gray-500 mt-2">{totalLabel}</span>
              </div>

              {/* Occupied Rooms */}
              <div className="bg-gray-100 rounded-2xl shadow flex flex-col border border-gray-200 px-6 py-4">
                <p className="flex flex-row font-bold text-gray-600 justify-between p-1 text-[14px] rounded-xl mb-2">
                  Occupied Rooms{" "}
                  <span className="flex text-sm h-8 w-8 justify-center text-green-600 bg-green-200 rounded-full p-2">
                    <FaRightToBracket />
                  </span>
                </p>
                <h2 className="text-3xl font-bold">
                  {fmt(roomsOccupied)}{" "}
                  <span className="text-sm text-gray-500 mt-2">{roomsOccupiedPct.toFixed(1)}%</span>
                </h2>
                <span className="text-sm text-gray-500 mt-2">{totalLabel}</span>
              </div>

              {/* Available Rooms (you were showing checkOuts value here; keeping your original UI, but you may want roomsAvailable) */}
              <div className="bg-gray-100 rounded-2xl shadow flex flex-col border border-gray-200 px-6 py-4">
                <p className="flex flex-row font-bold text-gray-600 justify-between p-1 text-[14px] rounded-xl mb-2">
                  Available Rooms{" "}
                  <span className="flex justify-center h-8 w-8 text-sm text-red-600 bg-red-200 rounded-full p-2">
                    <FaBed />
                  </span>
                </p>
                <h2 className="text-3xl font-bold">
                  {fmt(roomsAvailable)}{" "}
                  <span className="text-sm text-gray-500 mt-2">{roomsAvailablePct.toFixed(1)}%</span>
                </h2>
                <span className="text-sm text-gray-500 mt-2">{totalLabel}</span>
              </div>

              {/* New Bookings */}
              <div className="bg-gray-100 rounded-2xl shadow flex flex-col border border-gray-200 px-6 py-4">
                <p className="flex flex-row font-bold text-gray-600 justify-between p-1 text-[14px] rounded-xl mb-2">
                  New Bookings{" "}
                  <span className="text-sm text-orange-600 bg-orange-200  rounded-full p-2">
                    <FaBookAtlas />
                  </span>
                </p>
                <h2 className="text-3xl font-bold">
                  {fmt(newBookings)}{" "}
                  <span className="text-sm text-gray-500 mt-2">{newBookingsPct.toFixed(1)}%</span>
                </h2>
                <span className="text-sm text-gray-500 mt-2">{totalLabel}</span>
              </div>
            </div>
          </div>

          {/* Guest List */}
          <div className="flex flex-col">
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Guest List</h2>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                    <FaSearch className="text-gray-500 text-sm" />
                    <input
                      type="text"
                      placeholder="Search Guest Name"
                      className="ml-2 bg-transparent outline-none text-sm"
                      onChange={(e) => setSearchBooking(e.target.value)}
                    />
                  </div>

                  <a
                    href="/frontdesk/reservations"
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    + New Guest
                  </a>
                </div>
              </div>

              <div className="max-h-[38vh] overflow-y-auto hide-scrollbar">
                <table className="w-full border-separate border-spacing-y-2 text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-gray-500 bg-gray-100 font-inter text-[14px]">
                      <th className="text-left px-4 py-2 rounded-l-xl">Booking ID</th>
                      <th className="text-left px-4 py-2">Guest Name</th>
                      <th className="text-left px-4 py-2">Check-In</th>
                      <th className="text-left px-4 py-2">Check-Out</th>
                      <th className="text-left px-4 py-2">Room Type</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Due Amount</th>
                      <th className="text-left px-4 py-2 rounded-r-xl">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr
                        key={b.id ?? (typeof b.bookingId === "string" ? b.bookingId : b.bookingRef)}
                        className="bg-gray-50 rounded-xl text-[14px]"
                      >
                        <td className="px-4 py-3 rounded-l-xl font-medium">{b.bookingRef}</td>
                        <td className="px-4 py-3">{b.guestName}</td>
                        <td className="px-4 py-3">{b.checkIn}</td>
                        <td className="px-4 py-3">{b.checkOut || "-"}</td>
                        <td className="px-4 py-3">{b.roomType}</td>
                        <td className="px-4 py-3">
                          <p className="bg-green-200 p-1 px-2.5 text-[12px] text-green-600 rounded-full">
                            {b.status}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-medium">Rs.{fmt(b.dueAmount ?? b.total ?? 0)}</td>
                        <td className="px-4 py-3 rounded-r-xl">
                          <button className="bg-red-100 text-red-600 px-3 py-1 w-21 rounded-md text-xs font-semibold">
                            Check-Out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {loading && <div className="text-sm text-gray-500 mt-3">Loading...</div>}
                {!loading && filteredBookings.length === 0 && (
                  <div className="text-[14px] text-center text-gray-500 mt-3">No guests found.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8 w-120 font-inter">
          {/* ROOMS CLEAN */}
          <div className="bg-white max-h-[320px] rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-gray-100">
              <h2 className="text-[16px] font-semibold">Rooms Clean</h2>
            </div>

            <div className="max-h-[260px] overflow-y-auto hide-scrollbar px-4">
              <table className="w-full border-separate border-spacing-y-2">
                <thead className="sticky top-0 bg-white z-10 rounded-xl">
                  <tr className="text-gray-500 bg-gray-100 text-[14px]">
                    <th className="py-2 rounded-l-lg">Room</th>
                    <th>Status</th>
                    <th>Task</th>
                    <th className="rounded-r-lg">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {roomClean?.map((r, index) => (
                    <tr key={index} className="bg-gray-50 rounded-xl font-inter text-[12px]">
                      <td className="px-2 py-2 rounded-l-xl font-medium">{r.room}</td>
                      <td>{r.status}</td>
                      <td>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[12px] ${
                            r.task === "Clean"
                              ? "bg-green-200 text-green-600"
                              : "bg-red-200 text-red-600"
                          }`}
                        >
                          {r.task}
                        </span>
                      </td>
                      <td className="rounded-r-xl">{r.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ALERTS */}
          <div className="bg-white max-h-[300px] overflow-y-auto hide-scrollbar text-inter rounded-2xl shadow border border-gray-100 h-fit px-6">
            <div className="sticky top-0 z-20 bg-white  py-4 border-b border-gray-100">
              <h2 className="text-[16px] font-semibold">Alerts</h2>
            </div>

            <div className="space-y-4">
              {alerts?.length > 0 ? (
                alerts.map((a, index) => (
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
                <p className="text-[14px] py-4 text-gray-400">No alerts available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
