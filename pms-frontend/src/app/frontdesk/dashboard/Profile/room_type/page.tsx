"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/table";

export default function RoomPage() {
  const [rooms, setRooms] = useState([]);
  // Fetch Existing Data
  useEffect(() => {
    fetch("http://localhost:5122/api/RoomTypes")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err));
      console.log(rooms);
  }, []);
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 py-20">
      {/* =============================== */}
      {/*        ROOM TABLE LIST          */}
      {/* =============================== */}
      <section className=" p-8 ">
        <h2 className="text-xl font-semibold mb-6">Room Type List</h2>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 ">
              <TableHead>Room Type Code</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Adults</TableHead>
              <TableHead>Children</TableHead>
              <TableHead>Bed Type</TableHead>
              <TableHead>Size</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rooms.length > 0 ? (
              rooms.map((room: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{room.roomTypeCode}</TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.description}</TableCell>
                  <TableCell>${room.basePrice}</TableCell>
                  <TableCell>{room.maxAdults}</TableCell>
                  <TableCell>{room.maxChildren}</TableCell>
                  <TableCell>{room.bedType}</TableCell>
                  <TableCell>{room.size} Sqft</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No rooms available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

    </div>
  );
}
