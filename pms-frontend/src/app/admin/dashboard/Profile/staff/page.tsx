"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  FaEdit,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaImage,
  FaUsers,
  FaLock,
} from "react-icons/fa";

import { Label } from "@/app/components/label";
import { Input } from "@/app/components/input";
import { Button } from "@/app/components/button";
import { Select } from "@/app/components/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/table";

import { api, apiFetch, API_BASE_URL } from "@/lib/api";

type Staff = {
  staffId: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  profileImageUrl?: string | null;
};

function joinUrl(base: string, path?: string | null) {
  if (!path) return "";
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return b + p;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffId, setStaffId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  // Load staff list
  const loadStaff = async () => {
    try {
      const data = await api.get<Staff[]>("/api/Staff");
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setStaffId(null);
    setName("");
    setEmail("");
    setRole("");
    setPhone("");
    setPassword("");
    setProfileImage(null);
    setPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProfileImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // CREATE or UPDATE (multipart/form-data)
  const handleSave = async () => {
    const formData = new FormData();

    if (staffId) formData.append("StaffId", String(staffId));
    formData.append("Name", name);
    formData.append("Email", email);
    formData.append("Role", role);
    formData.append("Phone", phone);

    // only for create
    if (!staffId) formData.append("Password", password);

    if (profileImage) formData.append("ProfileImage", profileImage);

    try {
      const path = staffId ? `/api/Staff/${staffId}` : "/api/Staff";
      const method = staffId ? "PUT" : "POST";

      await apiFetch(path, {
        method,
        body: formData, // ✅ FormData
        // IMPORTANT: don't set Content-Type here
      });

      alert(staffId ? "Staff updated!" : "Staff added!");
      await loadStaff();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  // EDIT
  const handleEdit = (s: Staff) => {
    setStaffId(s.staffId);
    setName(s.name ?? "");
    setEmail(s.email ?? "");
    setRole(s.role ?? "");
    setPhone(s.phone ?? "");
    setPassword("");

    // show existing image from backend
    setPreview(s.profileImageUrl ? joinUrl(API_BASE_URL, s.profileImageUrl) : null);
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff?")) return;

    try {
      await api.delete(`/api/Staff/${id}`);
      alert("Deleted successfully");
      await loadStaff();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 py-16">
      <div className="flex flex-row items-center justify-between bg-white py-4 px-8 ">
        <h2 className="text-xl font-semibold">Staff Profile</h2>
      </div>

      <div className="p-6">
        {/* STAFF FORM */}
        <section className="rounded-xl p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="flex items-center gap-2 mb-1">
                <FaUser /> Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1">
                <FaEnvelope /> Email
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1">
                <FaUsers size={18} /> Staff Role
              </Label>

              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Frontmanager">Frontmanager</option>
                <option value="Housekeeper">Housekeeper</option>
                <option value="Staff">Staff</option>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1">
                <FaPhone className="rotate-100"/> Phone
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94-xxxx"
              />
            </div>

            {!staffId && (
              <div>
                <Label className="flex items-center gap-2 mb-1"><FaLock /> Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
            )}

            <div>
              <Label className="flex items-center gap-2 mb-1">
                <FaImage /> Profile Image
              </Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />

              {preview && (
                // you can keep <img> for preview (works for blob + remote)
                <img
                  src={preview}
                  className="w-20 h-20 mt-2 rounded-xl border object-cover"
                  alt="preview"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button variant="borderBlue" onClick={resetForm} className="bg-gray-100">
              Reset
            </Button>
            <Button onClick={handleSave} className="bg-gray-800 text-white">
              {staffId ? "Update" : "Save"}
            </Button>
          </div>
        </section>

        {/* STAFF LIST */}
        <section className="mt-8 rounded-xl">
          <h2 className="text-xl font-semibold mb-6">Staff Members</h2>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="flex items-center justify-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.staffId}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell>{s.phone}</TableCell>

                  <TableCell>
                    {s.profileImageUrl ? (
                      <Image
                        alt="Staff Image"
                        src={joinUrl(API_BASE_URL, s.profileImageUrl)}
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
                      onClick={() => handleEdit(s)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                    >
                      <FaEdit className="text-gray-800 text-[14px]" />
                    </Button>

                    <Button
                      onClick={() => handleDelete(s.staffId)} // ✅ fixed
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                    >
                      <FaTrash className="text-red-500 text-[14px]" />
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
