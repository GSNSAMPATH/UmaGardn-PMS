"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBed, FaUsers, FaCog, FaFileArchive, FaCalendar, FaSignOutAlt, FaFileInvoice, FaHotel } from "react-icons/fa";
import { FaB, FaR } from "react-icons/fa6";
import { GrDashboard } from "react-icons/gr";

export default function Sidebar({ open , onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const handleMobileClose = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Auto-open Profile dropdown if user is inside `/admin/dashboard/Profile/*`
  useEffect(() => {
    if (pathname.startsWith("/frontdesk/dashboard/Profile")) {
      setProfileOpen(true);
    }
  }, [pathname]);

  const isActive = (path: string) =>
    pathname === path ? "bg-gray-200 rounded rounded-xl text-black font-semibold" : "";

  const isSubActive = (path: string) =>
    pathname === path ? "bg-gray-200 text-black font-semibold " : "";

    const handleLogout = () => {
    // 🔐 Clear auth (adjust based on your system)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // If cookie-based auth
    document.cookie = "token=; Max-Age=0; path=/";

    // 🚀 Redirect to login
    router.replace("/");
  }

  return (
    <div
      className={`fixed top-16 left-0 h-full border-r border-gray-200 bg-white z-40 transition-all duration-300
        ${open ? "w-64" : "w-0 overflow-hidden"}
      `}
    >
      <div className="flex flex-col font-[inter] text-[16px] mt-4 px-4 text-gray-600">

        {/* Dashboard */}
        <Link
          href="/frontdesk/dashboard"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/frontdesk/dashboard")}`}
        >
          <GrDashboard /> Dashboard
        </Link>

        {/* Profile Section */}
        {/* <button
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
        </button> */}

        {/* Submenu */}
        {profileOpen && (
          <div className="ml-8 mt-1 flex flex-col gap-2 text-sm text-gray-700 font-semibold">

            {/* <Link
              href="/frontdesk/dashboard/Profile/hotel"
              className={`p-2 hover:bg-gray-100 rounded-xl 
              ${isSubActive("/admin/dashboard/Profile/hotel")}`}
            >
              Hotel
            </Link> */}

            <Link
              href="/frontdesk/dashboard/Profile/room"
              onClick={handleMobileClose}
              className={`p-2 px-4 hover:bg-gray-100 rounded-full 
              ${isSubActive("/frontdesk/dashboard/Profile/room")}`}
            >
              Rooms
            </Link>

            {/* <Link
              href="/frontdesk/dashboard/Profile/room_type"
              className={`p-2 px-4 hover:bg-gray-100 rounded-full 
              ${isSubActive("/frontdesk/dashboard/Profile/room_type")}`}
            >
              Room Types
            </Link> */}

            <Link
              href="/frontdesk/dashboard/Profile/amenity"
              onClick={handleMobileClose}
              className={`p-2 px-4 hover:bg-gray-100 rounded-full 
              ${isSubActive("/frontdesk/dashboard/Profile/amenity")}`}
            >
              Amenities
            </Link>

            <Link
              href="/frontdesk/dashboard/Profile/staff"
              onClick={handleMobileClose}
              className={`p-2 px-4 hover:bg-gray-100 rounded-full  
              ${isSubActive("/frontdesk/dashboard/Profile/staff")}`}
            >
              Staff
            </Link>

            {/* <Link
              href="/profile/payment"
              className={`p-2 px-4 hover:bg-gray-100 rounded-full 
              ${isSubActive("/profile/payment")}`}
            >
              Payment
            </Link> */}
          </div>
        )}

        {/* Rooms */}
        <Link
          href="/frontdesk/rooms"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/frontdesk/rooms")}`}
        >
          <FaBed /> Rooms
        </Link>

        <Link
          href="/frontdesk/reservations"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/frontdesk/reservations")}`}
        >
          <FaHotel /> Reservations
        </Link>

        <Link
          href="/frontdesk/calender"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/frontdesk/calender")}`}
        >
          <FaCalendar /> Calendar
        </Link>

        {/* Guests */}
        <Link
          href="/frontdesk/guest"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/frontdesk/guest")}`}
        >
          <FaUsers /> Guests
        </Link>

        {/* Quatation */}
        <Link
          href="/frontdesk/quotation"
          onClick={handleMobileClose}
          className={`p-3 flex items-center gap-3 hover:bg-gray-100 rounded ${isActive("/frontdesk/quotation")}`}
        >
          <FaFileInvoice /> Quotation
        </Link>

        {/* Settings */}
        <button
          onClick={handleLogout}
          className="p-3 flex items-center gap-3 hover:bg-red-100 rounded text-red-600"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}
