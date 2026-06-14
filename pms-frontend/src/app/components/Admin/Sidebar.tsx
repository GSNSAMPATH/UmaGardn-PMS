"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBed, FaUsers, FaCog, FaFileArchive, FaSignOutAlt, FaCalendar, FaRemoveFormat, FaHotel, FaFileInvoice } from "react-icons/fa";
import { GrDashboard } from "react-icons/gr";
import { TbFlagCancel } from "react-icons/tb";


export default function Sidebar({ open,onClose, }: { open: boolean; onClose: () => void; }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

const handleMobileClose = () => {
  if (window.innerWidth < 1024) {
    onClose();
  }
};
    const router = useRouter();
  // Auto-open Profile dropdown if user is inside `/admin/dashboard/Profile/*`
  useEffect(() => {
    if (pathname.startsWith("/admin/dashboard/Profile")) {
      setProfileOpen(true);
    }
  }, [pathname]);

  const isActive = (path: string) =>
    pathname === path ?  "bg-gray-200 rounded rounded-xl text-black font-semibold" : "";

  const isSubActive = (path: string) =>
    pathname === path ? "bg-gray-200 text-black font-semibold" : "";

    const handleLogout = () => {
    // 🔐 Clear auth (adjust based on your system)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // If cookie-based auth
    document.cookie = "token=; Max-Age=0; path=/";

    // 🚀 Redirect to login
    router.replace("/");
  };


  return (
    <div
      className={`fixed top-16 left-0 h-full border-r border-gray-200 bg-white z-40 transition-all duration-300
        ${open ? "w-64" : "w-0 overflow-hidden"}
      `}
    >
      <div className="flex flex-col mt-4 px-4 text-gray-600">

        {/* Dashboard */}
        <Link
          href="/admin/dashboard"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:rounded-xl hover:bg-gray-100 rounded ${isActive("/admin/dashboard")}`}
        >
          <GrDashboard /> Dashboard
        </Link>

        {/* Profile Section */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="p-3 flex items-center justify-between hover:bg-gray-100 rounded"
        >
          <span className="flex items-center gap-3 font-bold">
            <FaFileArchive /> Profile
          </span>
          <span
            className={`transition-transform ${
              profileOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </button>

        {/* Submenu */}
        {profileOpen && (
          <div className="ml-8 mt-1 flex flex-col gap-2 text-sm text-gray-700 font-semibold">

            <Link
              href="/admin/dashboard/Profile/hotel"
              onClick={handleMobileClose}
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/hotel")}`}
            >
              Hotel
            </Link>

            <Link
              href="/admin/dashboard/Profile/room"
              onClick={handleMobileClose}
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/room")}`}
            >
              Rooms
            </Link>

            <Link
              href="/admin/dashboard/Profile/room_type"
              onClick={handleMobileClose}
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/room_type")}`}
            >
              Room Types
            </Link>

            {/* <Link
              href="/admin/dashboard/Profile/amenity"
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/amenity")}`}
            >
              Amenities
            </Link> */}

            <Link
              href="/admin/dashboard/Profile/staff"
              onClick={handleMobileClose}
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/staff")}`}
            >
              Staff
            </Link>

            <Link
              href="/admin/dashboard/Profile/mealplan"
              onClick={handleMobileClose}
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/mealplan")}`}
            >
              Meal Plan
            </Link>

            {/* <Link
              href="/profile/payment"
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/profile/payment")}`}
            >
              Payment
            </Link> */}

            <Link
              href="/admin/dashboard/Profile/bookingsorce"
              onClick={handleMobileClose}
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/bookingsorce")}`}
            >
              BookingSource
            </Link>
          </div>
        )}

        <Link
          href="/admin/reservations"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/admin/reservations")}`}
        >
          <FaHotel /> Reservations
        </Link>

        {/* Rooms */}
        <Link
          href="/admin/calender"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:rounded-xl hover:bg-gray-100 rounded ${isActive("/admin/calender")}`}
        >
          <FaCalendar />Calender
        </Link>

        {/* Guests */}
        <Link
          href="/admin/guests"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:rounded-xl hover:bg-gray-100 rounded ${isActive("/admin/guests")}`}
        >
          <FaUsers /> Guests
        </Link>

         {/* Quotations */}
        <Link
          href="/admin/quotations"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:rounded-xl hover:bg-gray-100 rounded ${isActive("/admin/quotations")}`}
        >
          <FaFileInvoice /> Quotations
        </Link>

        {/* Settings */}
        <Link
          href="/admin/booking_cancel"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/admin/booking_cancel")}`}
        >
          <FaRemoveFormat /> Booking Cancel
        </Link>
        <button
          onClick={handleLogout}
          className="p-3 flex items-center gap-3 hover:rounded-xl hover:bg-red-100 rounded text-red-600"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}
