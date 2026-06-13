"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { FaEdit, FaTrash, FaImage, FaToolbox } from "react-icons/fa";
import { Label } from "@/app/components/label";
import { Input } from "@/app/components/input";
import { Button } from "@/app/components/button";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/table";
export default function AmenityPage() {
  const [amenities, setAmenities] = useState([]);
  const [amenityId, setAmenityId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const token = Cookies.get("token");

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      const res = await fetch("http://localhost:5122/api/Amenities");
      const data = await res.json();
      setAmenities(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setAmenityId(null);
    setName("");
    setDescription("");
    setIcon(null);
    setPreview(null);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    setIcon(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    if (amenityId) formData.append("AmenityId", amenityId.toString());
    formData.append("Name", name);
    formData.append("Description", description);
    if (icon) formData.append("Icon", icon);
    
    console.log(formData);

    try {
      const url = amenityId
        ? `http://localhost:5122/api/Amenities/${amenityId}`
        : "http://localhost:5122/api/Amenities";

      const method = amenityId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error saving");

      alert(amenityId ? "Amenity Updated!" : "Amenity Created!");
      loadAmenities();
      resetForm();

    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  const handleEdit = (amenity: any) => {
    setAmenityId(amenity.amenityId);
    setName(amenity.name);
    setDescription(amenity.description);
    setPreview(`http://localhost:5122${amenity.icon}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return;

    try {
      const res = await fetch(`http://localhost:5122/api/Amenities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      alert("Deleted successfully");
      loadAmenities();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 py-16">

      <div className="flex flex-row items-center justify-between  bg-white py-4 px-8 ">
        <h2 className="text-xl font-semibold">Amenity Profile</h2>
      </div>
      {/* ADD AMENITY FORM */}
      <div className="p-6">
      <section className="rounded-xl p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div>
            <Label className="flex items-center gap-2 mb-1">
              <FaToolbox size={18} /> Amenity Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amenity name"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-1">
              <FaEdit size={18} /> Description
            </Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Amenity description"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-1">
              <FaImage size={18} /> Icon
            </Label>
            <Input 
              type="file" 
              accept="image/*" 
              className="text-gray-400 py-3"
              onChange={handleFileChange} />

            {preview && (
              <img
                src={preview}
                className="w-16 h-16 mt-2 rounded border object-cover"
              />
            )}
          </div>

        </div>

        <div className="flex justify-end gap-4 mt-8">
            <Button variant="borderBlue" onClick={resetForm} className="bg-gray-100">
            Reset
          </Button>
          <Button onClick={handleSave} className="bg-gray-800 text-white">
            {amenityId ? "Update" : "Save"}
          </Button>
        </div>
      </section>

      {/* AMENITIES TABLE */}
      <section className="mt-8 rounded-xl">
        <h2 className="text-xl font-semibold mb-6">Amenities List</h2>
         <Table>
           <TableHeader>
              <TableRow className="bg-gray-100">
              <TableHead>Amenity ID </TableHead>
               <TableHead>Name</TableHead>
               <TableHead>Description</TableHead>
               <TableHead>Icon</TableHead>
              <TableHead className="flex items-center justify-center ">Actions</TableHead>
          </TableRow> 
          </TableHeader>
           <TableBody>
             {amenities.map((amenity: any) => (
               <TableRow key={amenity.amenityId}>
                 <TableCell>{amenity.amenityId}</TableCell>
                 <TableCell>{amenity.name}</TableCell>
                <TableCell>
                  {(() => {
                    const desc = amenity.description ?? ""; // safe fallback
                    const words = desc.split(" ");
                    const limited = words.slice(0, 8).join(" ");
                    return words.length > 8 ? limited + "..." : limited;
                  })()}
                </TableCell>
                    <TableCell>
                      {amenity.icon ? (
                        <Image
                          alt="Room Image"
                          src={`http://localhost:5122/${amenity.icon}`}
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
                        onClick={() => handleEdit(amenity)}
                        size="sm" variant="outline" className="rounded-xl">
                        <FaEdit className="text-gray-800 text-[14px]" />
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl">
                        <FaTrash className="text-red-600 text-[14px]" />
                      </Button>
                    </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
      </section>
      </div>
    </div>
  );
}
