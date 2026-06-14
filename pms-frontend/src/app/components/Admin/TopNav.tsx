"use client";

import { FaBars, FaSearch, FaBell, FaCalendar } from "react-icons/fa";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api"; // ✅ use central base url

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    createdDateTime: "",
  });

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const img = Cookies.get("profileImageUrl");

    if (!img) {
      setProfileImage(null);
      return;
    }

    // ✅ build safe URL using API_BASE_URL (no hardcode)
    const base = API_BASE_URL.replace(/\/$/, "");
    const path = img.startsWith("/") ? img : `/${img}`;
    setProfileImage(base + path);
  }, []);

  const roal = Cookies.get("role");
  const name = Cookies.get("name");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const year = now.getFullYear();
      const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = String(now.getDate()).padStart(2, "0");

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const formatted = `${year} ${month} ${day}  ${hours}:${minutes}:${seconds}`;
      updateField("createdDateTime", formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const now = form.createdDateTime;

  return (
    <div className="fixed top-0 w-full h-16 bg-black text-white flex items-center justify-between px-4 shadow z-50">
      <div className="flex items-center justify-between gap-10 lg:w-3/5">
        {/* Left */}
        <div className="flex items-center gap-4">
          <FaBars className="font-[inter] text-[16px] cursor-pointer" onClick={onMenuClick} />
          <span className="font-[inter] font-semibold text-[16px]">Hotel PMS {roal}</span>
        </div>

        {/* Center - Search */}
        <div className="hidden lg:flex items-center font-[inter] bg-neutral-800 px-3 py-1 rounded-full w-96">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search within the PMS..."
            className="bg-transparent outline-none text-[14px] text-gray-300 ml-2 w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <div className="font-[inter] text-[12px] font-semibold border-x px-2 border-gray-400">
          {now}
        </div>

        <div className="flex items-center gap-4 bg-neutral-800 px-3 py-2 rounded-full">
          <FaBell className="text-lg cursor-pointer" />
          <FaCalendar className="text-lg cursor-pointer" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex font-[inter] flex-col font-semibold text-[12px] text-right border-gray-400">
            <span className="text-[14px] font-semibold border-gray-400">
              welcome<br />
            </span>
            <span className="text-[12px] font-normal text-right border-gray-400"></span>
            {name}
          </div>

          {/* User Profile Image */}
          {profileImage ? (
            <Image
              src={profileImage}
              alt="User"
              width={38}
              height={38}
              className="rounded-full border border-gray-500 cursor-pointer w-8 h-8 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-sm">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
