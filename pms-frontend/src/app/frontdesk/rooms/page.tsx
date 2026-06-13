"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import SelectionDropdown, { DropdownItem } from "@/app/components/SelectionButton";
import { api, API_BASE_URL } from "@/lib/api";

export default function RoomPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<DropdownItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [search, setSearch] = useState("");

  // Load all rooms initially
  useEffect(() => {
    loadAllRooms();
  }, []);

  const loadAllRooms = async () => {
    try {
      const data = await api.get<any[]>("/api/Rooms");
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading all rooms:", err);
    }
  };



  // Load room types
  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const data = await api.get<any[]>("/api/RoomTypes");

        setRoomTypes([
          { label: "All Types", value: "" },
          ...(Array.isArray(data) ? data : []).map((rt: any) => ({
            label: rt.name,
            value: String(rt.roomTypeId),
          })),
        ]);
      } catch (err) {
        console.error("Error loading room types:", err);
        setRoomTypes([{ label: "All Types", value: "" }]);
      }
    };

    loadRoomTypes();
  }, []);

  // Load rooms by room type
  const loadRoomsByType = async (typeId: string) => {
    try {
      const data = await api.get<any>(`/api/RoomTypes/${typeId}/rooms`);

      // If backend returns: { roomTypeId, name, rooms: [] }
      const normalizedRooms = (data?.rooms ?? []).map((room: any) => ({
        ...room,
        roomTypeId: data.roomTypeId,
        roomTypeCode: data.roomTypeCode,
        roomTypeName: data.name,
        roomTypeDescription: data.description,
        roomTypeSize: data.size,
        roomTypeMaxAdults: data.maxAdults,
        roomTypeMaxChildren: data.maxChildren,
        roomTypeBasePrice: data.basePrice,
        bedType: data.bedType,
        size: data.size,
      }));

      return normalizedRooms;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };



  // Apply filter when room type changes
  useEffect(() => {
    if (selectedRoomType === "") {
      loadAllRooms();
    } else {
      loadRoomsByType(selectedRoomType).then((filtered) => {
        setRooms(filtered);
      });
    }
  }, [selectedRoomType]);

  // SEARCH filter
  const filteredRooms = rooms.filter((room) => {
    const text = search.toLowerCase();

    return (
      room.roomNumber?.toString().toLowerCase().includes(text) ||
      room.roomCode?.toLowerCase().includes(text) ||
      room.status?.toLowerCase().includes(text) ||
      room.roomTypeName?.toLowerCase().includes(text)||
      room.roomTypeMaxAdults?.toString().toLowerCase().includes(text)
    );
  });

  useEffect(() => {
    if (rooms.length > 0) {
      setSelectedRoom(rooms[0]); // ✅ safer than rooms[1]
    }
  }, [rooms]);

    const imgUrl = (path?: string) => {
    if (!path) return "";
    const cleanBase = API_BASE_URL.replace(/\/$/, "");
    const cleanPath = String(path).replace(/^\//, "");
    return `${cleanBase}/${cleanPath}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 pt-16">
      <div className="flex flex-row items-center justify-between bg-white py-4 px-8">
        <h2 className="text-[20px] font-semibold">Rooms</h2>

        {/* Search Box */}
        <div className="hidden md:flex items-center bg-gray-100 px-3 py-1 rounded-full w-96">
          <FaSearch className="text-gray-800" />
          <input
            type="text"
            placeholder="Search room number, status, or type..."
            className="bg-transparent outline-none text-sm text-gray-800 ml-2 w-full"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Room Type Dropdown */}
        <SelectionDropdown
          label="Room Type"
          value={selectedRoomType}
          items={roomTypes}
          onChange={setSelectedRoomType}
          
        />
      </div>
      <div className="p-6">
      <section className="rounded-xl p-6 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---------------------- LEFT SIDE (ROOM LIST) ---------------------- */}
          <div className="lg:col-span-2 space-y-6 max-h-[70vh] font-inter overflow-y-auto pr-2 hide-scrollbar">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room: any, index: number) => (
                <div
                  key={index}
                  onClick={() => setSelectedRoom(room)}
                  className="cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-6 hover:shadow-md transition"
                >
                  {/* Room Image */}
                  <div className="w-60 h-36 overflow-hidden rounded-xl">
                    <Image
                      alt="Room"
                      src={imgUrl(room.imageUrl)}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Room Info */}
                  <div className="flex-1 flex flex-col">
                    <div>
                      {/* Title + Status */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-[14px] font-semibold">
                          {room.roomTypeName}
                        </h3>

                        <span
                          className={`text-[10px] font-inter px-3 py-1 rounded-full font-medium ${
                            room.status === "Available"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {room.status}
                        </span>
                      </div>

                      {/* Icons */}
                      <div className="flex items-center gap-6 text-[10px] text-gray-700 mt-2">
                        <div className="flex items-center gap-2">
                          <span>📏</span>
                          <span>{room.roomTypeSize  ?? "35"} m²</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>🛏</span>
                          <span>{room.bedType}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          <span>
                            {room.roomTypeMaxAdults ?? 1} Adults / {room.roomTypeMaxChildren ?? 0} Kids
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-[12px] mt-3 line-clamp-3">
                        {room.roomTypeDescription}
                      </p>
                    </div>

                    {/* Availability */}
                    <div className="text-gray-600 text-[12px] mt-4 flex justify-between">
                      <span>
                        <strong>Room Code:</strong> {room.roomCode}
                      </span>
                      <span>
                        <strong>Floor:</strong> {room.floor}
                      </span>
                      <span className="font-medium">
                        Rs {room.roomTypeBasePrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No rooms found</p>
            )}
          </div>

          {/* ---------------------- RIGHT SIDE (ROOM DETAILS) ---------------------- */}
          <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit top-20">
            {selectedRoom ? (
              <>
                <h3 className="text-[14px] font-semibold">
                  {selectedRoom.roomTypeName}
           

                <span
                  className={`text-[10px] ml-4 px-3 py-1 rounded-full font-medium inline-block ${
                    selectedRoom.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedRoom.status}
                </span>
              </h3>
                <p className="text-gray-500 text-[10px] mt-2">
                  Occupied:{" "}
                  <strong>
                    {selectedRoom.roomTypeOccupied ?? "10/15 Rooms"}
                  </strong>
                </p>

                {/* Main Image */}
                <div className="w-full h-40 mt-4 rounded-xl overflow-hidden">
                  <Image
                    alt="Room"
                    src={imgUrl(selectedRoom.imageUrl)}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Small Gallery */}
                <div className="flex gap-3 mt-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-md overflow-hidden"
                    >
                      <Image
                        alt="Thumb"
                        src={imgUrl(selectedRoom.imageUrl)}
                        width={80}
                        height={60}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Icons */}
                <div className="flex items-center gap-6 text-[10px] text-gray-700 mt-4">
                  <div className="flex items-center gap-2">
                    <span>📏</span>
                    <span>{selectedRoom.size ?? "35 m²"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>🛏</span>
                    <span>{selectedRoom.bedType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>
                      {selectedRoom.maxAdults ?? 1} Adults /{" "}
                      {selectedRoom.maxChildren ?? 0} Kids
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-[12px] mt-2 leading-relaxed">
                  {selectedRoom.roomTypeDescription}
                </p>

                <h4 className="mt-2 text-[14px] font-semibold">Features</h4>
                <ul className="flex flex-row flex-wrap gap-2 mt-2 text-[10px] text-gray-600 space-y-1 space-x-4">
                  <li>✔ Private Balcony</li>
                  <li>✔ Speed WiFi</li>
                  <li>✔ Room Service</li>
                </ul> 
              </>
            ) : (
              <p className="text-gray-500 text-sm">
                Select a room to view details
              </p>
            )}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
