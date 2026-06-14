"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaBed, FaImage } from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
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
import { Select } from "@/app/components/Select";
import AlertBox from "@/app/components/alert-box";
import Image from "next/image";

import { api, apiFetch, assetUrl } from "@/lib/api";

type RoomType = {
  roomTypeId: number;
  name: string;
};

type Room = {
  roomId: number;
  roomCode: string;
  roomNumber: string;
  // floor?: string;
  status: string;
  roomTypeId: number;
  roomTypeName?: string;
  bedType?: string;
  roomTypeDescription?: string;
  roomTypeBasePrice?: number;
  imageUrl?: string | null;
};

export default function RoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);

  const [roomImage, setRoomImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [alertBox, setAlertBox] = useState({
    show: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const showAlert = (type: any, message: string) => {
    setAlertBox({ show: true, type, message });
    setTimeout(() => {
      setAlertBox((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

  const [form, setForm] = useState({
    roomNumber: "",
    // floor: "0",
    status: "",
    roomTypeId: "",
  });

  useEffect(() => {
    loadRooms();
    loadRoomTypes();
  }, []);

  // ✅ Load all rooms (base URL via api)
  const loadRooms = async () => {
    try {
      const data = await api.get<Room[]>("/api/rooms");
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load rooms");
    }
  };

  // ✅ Load room types (base URL via api)
  const loadRoomTypes = async () => {
    try {
      const data = await api.get<RoomType[]>("/api/RoomTypes");
      setRoomTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load room types");
    }
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // File Upload preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setRoomImage(file);

    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleReset = () => {
    setForm({
      roomNumber: "",
      // floor: "0",
      status: "",
      roomTypeId: "",
    });
    setRoomId(null);
    setRoomImage(null);
    setPreview(null);
  };

  // ✅ Edit existing (image preview uses assetUrl)
  const handleEdit = (room: Room) => {
    setRoomId(room.roomId);
    setForm({
      roomNumber: room.roomNumber ?? "",
      // floor: room.floor ?? "",
      status: room.status ?? "",
      roomTypeId: String(room.roomTypeId ?? ""),
    });

    setRoomImage(null);
    setPreview(room.imageUrl ? assetUrl(room.imageUrl) : null);
  };

  // ✅ Save OR Update Room (multipart/form-data) using apiFetch + base URL
  const handleSave = async () => {
    const isUpdate = !!roomId;

    try {
      const formData = new FormData();
      formData.append("RoomNumber", form.roomNumber);
      // formData.append("Floor", form.floor);
      formData.append("Status", form.status);
      formData.append("RoomTypeId", form.roomTypeId);

      if (roomImage) formData.append("Image", roomImage);
      if (isUpdate) formData.append("RoomId", String(roomId));

      const path = isUpdate ? `/api/rooms/${roomId}` : "/api/rooms";
      const method = isUpdate ? "PUT" : "POST";

      // ✅ apiFetch will auto add Authorization, and will NOT set JSON Content-Type for FormData
      await apiFetch(path, {
        method,
        body: formData,
      });

      showAlert("success", isUpdate ? "Room updated!" : "Room added!");
      await loadRooms();
      handleReset();
    } catch (err) {
      console.error(err);
      showAlert("error", isUpdate ? "Update failed" : "Save failed");
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
          <h2 className="text-xl font-semibold">Add Room</h2>
        </div>

        <div className="p-6">
          {/* ADD ROOM FORM */}
          <section className="rounded-xl p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-gray-600 ">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaBed size={18} /> Room Number
                </Label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) => updateField("roomNumber", e.target.value)}
                  placeholder="Enter room number"
                />
              </div>

              {/* <div>
                <Label className="flex items-center gap-2 mb-1">
                  <MdDescription size={18} /> Floor
                </Label>
                <Input
                  value={form.floor}
                  onChange={(e) => updateField("floor", e.target.value)}
                  placeholder="Enter floor"
                />
              </div> */}

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <RiMoneyDollarCircleFill size={18} /> Status
                </Label>
                <Select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaUsers size={18} /> Room Type
                </Label>
                <Select
                  value={form.roomTypeId}
                  onChange={(e) => updateField("roomTypeId", e.target.value)}
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.roomTypeId} value={rt.roomTypeId}>
                      {rt.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaImage /> Profile Image
                </Label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />

                {preview && (
                  <img
                    src={preview}
                    className="w-20 h-20 mt-2 rounded-xl border object-cover"
                    alt="preview"
                  />
                )}
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
              <Button onClick={handleSave} className="bg-gray-800 text-white ">
                {roomId ? "Update" : "Save"}
              </Button>
            </div>
          </section>

          {/* ROOM TABLE LIST */}
          <section className="mt-8 rounded-xl">
            <h2 className="text-xl font-semibold mb-6">Room List</h2>

            <Table>
              <TableHeader>
                <TableRow className=" bg-gray-100">
                  <TableHead>Room Code</TableHead>
                  <TableHead>Room Number</TableHead>
                  {/* <TableHead>Floor</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Bed Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rooms.length > 0 ? (
                  rooms.map((room, index) => (
                    <TableRow key={index}>
                      <TableCell>{room.roomCode}</TableCell>
                      <TableCell>{room.roomNumber}</TableCell>
                      {/* <TableCell>{room.floor}</TableCell> */}
                      <TableCell>{room.status}</TableCell>
                      <TableCell>{room.roomTypeName}</TableCell>
                      <TableCell>{room.bedType}</TableCell>
                      <TableCell>
                        {(() => {
                          const desc = room.roomTypeDescription ?? "";
                          const words = desc.split(" ");
                          const limited = words.slice(0, 8).join(" ");
                          return words.length > 8 ? limited + "..." : limited;
                        })()}
                      </TableCell>
                      <TableCell>{room.roomTypeBasePrice}</TableCell>

                      {/* ✅ Image uses baseURL helper */}
                      <TableCell>
                        {room.imageUrl ? (
                          <Image
                            alt="Room Image"
                            src={assetUrl(room.imageUrl)}
                            width={100}
                            height={100}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                        ) : (
                          "No Image"
                        )}
                      </TableCell>

                      <TableCell className="text-center flex justify-center gap-4">
                        <Button
                          onClick={() => handleEdit(room)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <FaEdit className="text-gray-800 text-[14px]" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          // TODO: add delete handler
                        >
                          <FaTrash className="text-red-500 text-[14px]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-gray-500">
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
