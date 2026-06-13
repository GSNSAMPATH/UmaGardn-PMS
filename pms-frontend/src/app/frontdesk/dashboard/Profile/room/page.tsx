"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/table";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import SelectionDropdown, { DropdownItem } from "@/app/components/SelectionButton";

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
      const res = await fetch("http://localhost:5122/api/Rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Error loading all rooms:", err);
    }
  };



  // Load room types
  useEffect(() => {
    fetch("http://localhost:5122/api/RoomTypes")
      .then((res) => res.json())
      .then((data) =>
        setRoomTypes([
          { label: "All Types", value: "" },
          ...data.map((rt: any) => ({
            label: rt.name,
            value: rt.roomTypeId.toString(),
          })),
        ])
      );
  }, []);

  // Load rooms by room type
  const loadRoomsByType = async (typeId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5122/api/RoomTypes/${typeId}/rooms`
      );

      const data = await res.json();

      // If backend returns: { roomTypeId, name, rooms: [] }
      const normalizedRooms = data.rooms.map((room: any) => ({
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
  if (rooms.length > 1) {
    setSelectedRoom(rooms[1]);
  }
}, [rooms]);

  

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 py-16">
      <div className="flex flex-row items-center justify-between bg-white py-4 px-8">
        <h2 className="text-xl font-semibold">Rooms</h2>

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
      <section className="rounded-xl p-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---------------------- LEFT SIDE (ROOM LIST) ---------------------- */}
          <div className="lg:col-span-2 space-y-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room: any, index: number) => (
                <div
                  key={index}
                  onClick={() => setSelectedRoom(room)}
                  className="cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-6 hover:shadow-md transition"
                >
                  {/* Room Image */}
                  <div className="w-60 h-40 overflow-hidden rounded-xl">
                    <Image
                      alt="Room"
                      src={`http://localhost:5122/${room.imageUrl}`}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Room Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title + Status */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">
                          {room.roomTypeName}
                        </h3>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            room.status === "Available"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {room.status}
                        </span>
                      </div>

                      {/* Icons */}
                      <div className="flex items-center gap-6 text-sm text-gray-700 mt-2">
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
                      <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                        {room.roomTypeDescription}
                      </p>
                    </div>

                    {/* Availability */}
                    <div className="text-gray-600 text-sm mt-4 flex justify-between">
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
                <h3 className="text-xl font-semibold">
                  {selectedRoom.roomTypeName}
                </h3>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium mt-2 inline-block ${
                    selectedRoom.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedRoom.status}
                </span>

                <p className="text-gray-500 text-sm mt-2">
                  Occupied:{" "}
                  <strong>
                    {selectedRoom.roomTypeOccupied ?? "10/15 Rooms"}
                  </strong>
                </p>

                {/* Main Image */}
                <div className="w-full h-48 mt-4 rounded-xl overflow-hidden">
                  <Image
                    alt="Room"
                    src={`http://localhost:5122/${selectedRoom.imageUrl}`}
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
                        src={`http://localhost:5122/${selectedRoom.imageUrl}`}
                        width={80}
                        height={60}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Icons */}
                <div className="flex items-center gap-6 text-sm text-gray-700 mt-4">
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
                <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                  {selectedRoom.roomTypeDescription}
                </p>

                <h4 className="mt-4 font-semibold">Features</h4>
                <ul className="flex flex-row flex-wrap gap-2 mt-2 text-sm text-gray-600 space-y-1 space-x-4">
                  <li>✔ Private Balcony</li>
                  <li>✔ Speed WiFi</li>
                  <li>✔ Room Service</li>
                  <li>✔ Hot Water</li>
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
