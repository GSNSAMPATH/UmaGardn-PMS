"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BiBed, BiCategory } from "react-icons/bi";
import { MdDescription } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import { FaChild } from "react-icons/fa6";
import { TbRulerMeasure } from "react-icons/tb";
import { Label } from "@/app/components/label";
import { Input } from "@/app/components/input";
import { Button } from "@/app/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/table";
import AlertBox from "@/app/components/alert-box";
import { api } from "@/lib/api";

type RoomType = {
  roomTypeId: number;
  roomTypeCode: string;
  name: string;
  description: string;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  size: number;
  bedType: string;
};

export default function RoomPage() {
  const [rooms, setRooms] = useState<RoomType[]>([]);

  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomTypeCode, setRoomTypeCode] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxAdults: "",
    maxChildren: "",
    size: "",
    bedType: "",
  });

  const [alertBox, setAlertBox] = useState({
    show: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const showAlert = (type: any, message: string) => {
    setAlertBox({ show: true, type, message });
    setTimeout(() => {
      setAlertBox((p) => ({ ...p, show: false }));
    }, 2500);
  };

  const loadRoomTypes = async () => {
    try {
      const data = await api.get<RoomType[]>("/api/RoomTypes");
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load room types");
    }
  };

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setRoomTypeCode(null);
    setRoomId(null);
    setForm({
      name: "",
      description: "",
      basePrice: "",
      maxAdults: "",
      maxChildren: "",
      size: "",
      bedType: "",
    });
  };

  const handleEdit = (room: RoomType) => {
    setRoomId(room.roomTypeId);
    setRoomTypeCode(room.roomTypeCode);

    setForm({
      name: room.name ?? "",
      description: room.description ?? "",
      basePrice: String(room.basePrice ?? ""),
      maxAdults: String(room.maxAdults ?? ""),
      maxChildren: String(room.maxChildren ?? ""),
      size: String(room.size ?? ""),
      bedType: room.bedType ?? "",
    });
  };

  const handleSave = async () => {
    // ✅ CREATE (same as your old POST)
    if (!roomId) {
      try {
        await api.post("/api/RoomTypes", {
          name: form.name,
          description: form.description,
          basePrice: form.basePrice,
          maxAdults: form.maxAdults,
          maxChildren: form.maxChildren,
          size: form.size,
          bedType: form.bedType,
        });

        showAlert("success", "Room type added successfully!");
        await loadRoomTypes();
        handleReset();
      } catch (err) {
        console.error(err);
        showAlert("error", "Error adding room type");
      }
      return;
    }

    // ✅ UPDATE (KEEP SAME working payload)
    try {
      // Ensure code exists (prevents 400)
      const existing = rooms.find((r) => r.roomTypeId === roomId);
      const code = roomTypeCode ?? existing?.roomTypeCode ?? null;

      if (!code) {
        showAlert("error", "Room Type Code missing. Please edit again.");
        return;
      }

      await api.put(`/api/RoomTypes/${roomId}`, {
        roomTypeId: roomId,
        roomTypeCode: code,
        name: form.name,
        description: form.description,
        basePrice: form.basePrice,
        maxAdults: form.maxAdults,
        maxChildren: form.maxChildren,
        size: form.size,
        bedType: form.bedType,
        rooms: [], // ✅ keep same as your working code
      });

      showAlert("success", "Room type updated successfully!");
      await loadRoomTypes();
      handleReset();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error updating room type");
    }
  };

  return (
    <>
      <AlertBox
        type={alertBox.type}
        message={alertBox.message}
        show={alertBox.show}
        onClose={() => setAlertBox({ ...alertBox, show: false })}
      />

      <div className="bg-gray-50 min-h-screen text-gray-800 py-16">
        <div className="flex flex-row items-center justify-between bg-white py-4 px-8 ">
          <h2 className="text-xl font-semibold ">Add Room Type</h2>
        </div>

        <div className="p-6">
          <section className="rounded-xl p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <BiCategory size={18} /> Room Type Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter room type"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <MdDescription size={18} /> Description
                </Label>
                <Input
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Enter description"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <RiMoneyDollarCircleFill size={18} /> Base Price
                </Label>
                <Input
                  value={form.basePrice}
                  onChange={(e) => updateField("basePrice", e.target.value)}
                  placeholder="Enter base price"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaUsers size={18} /> Max Adults
                </Label>
                <Input
                  value={form.maxAdults}
                  onChange={(e) => updateField("maxAdults", e.target.value)}
                  placeholder="Enter max adults"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaChild size={18} /> Max Children
                </Label>
                <Input
                  value={form.maxChildren}
                  onChange={(e) => updateField("maxChildren", e.target.value)}
                  placeholder="Enter max children"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <TbRulerMeasure size={18} /> Size (Sqft/m²)
                </Label>
                <Input
                  value={form.size}
                  onChange={(e) => updateField("size", e.target.value)}
                  placeholder="Enter room size"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <BiBed size={18} /> Bed Type
                </Label>
                <Input
                  value={form.bedType}
                  onChange={(e) => updateField("bedType", e.target.value)}
                  placeholder="Enter bed type"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button
                variant="borderBlue"
                onClick={handleReset}
                className="bg-gray-100"
              >
                Reset
              </Button>
              <Button onClick={handleSave} className="bg-gray-800 text-white">
                {roomId ? "Update" : "Save"}
              </Button>
            </div>
          </section>

          <section className="mt-8 rounded-xl">
            <h2 className="text-xl font-semibold mb-6">Room Type List</h2>

            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Room Code</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Adults</TableHead>
                  <TableHead>Children</TableHead>
                  <TableHead>Bed Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rooms.length > 0 ? (
                  rooms.map((room, index) => (
                    <TableRow key={index}>
                      <TableCell>{room.roomTypeCode}</TableCell>
                      <TableCell>{room.name}</TableCell>
                      <TableCell>
                        {room.description
                          ? room.description.split(" ").slice(0, 8).join(" ") +
                            (room.description.split(" ").length > 8
                              ? "..."
                              : "")
                          : ""}
                      </TableCell>
                      <TableCell>Rs :{room.basePrice}</TableCell>
                      <TableCell>{room.maxAdults}</TableCell>
                      <TableCell>{room.maxChildren}</TableCell>
                      <TableCell>{room.bedType}</TableCell>
                      <TableCell>{room.size} Sqft</TableCell>

                      <TableCell className="text-center flex justify-center gap-4">
                        <Button
                          onClick={() => handleEdit(room)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <FaEdit className="text-gray-800 text-[14px]" />
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-xl">
                          <FaTrash className="text-red-500 text-[14px]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-6 text-gray-500"
                    >
                      No rooms available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        </div>
      </div>
    </>
  );
}
