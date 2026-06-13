"use client";

import { useEffect, useState } from "react";
import { FaClock, FaCreditCard, FaEdit, FaRandom, FaTag, FaTrash } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

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
import { Select } from "@/app/components/Select";

import { api } from "@/lib/api";

type BookingSource = {
  id: string;
  label: string;
  sourceType: string;
  whoPays: string;
  paymentTiming: string;
  commissionPercent: number;
};

export default function BookingSourceProfilePage() {
  const [sources, setSources] = useState<BookingSource[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: "",
    label: "",
    sourceType: "",
    whoPays: "",
    paymentTiming: "",
    commissionPercent: "",
  });

  /* ---------------- ALERT ---------------- */
  const [alert, setAlert] = useState({
    show: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const showAlert = (type: any, message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert((p) => ({ ...p, show: false })), 2500);
  };

  /* ---------------- FETCH ---------------- */
  const loadSources = async () => {
    try {
      const data = await api.get<BookingSource[]>("/api/BookingSourceProfile");
      setSources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load booking sources");
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  /* ---------------- HELPERS ---------------- */
  const updateField = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      id: "",
      label: "",
      sourceType: "",
      whoPays: "",
      paymentTiming: "",
      commissionPercent: "",
    });
  };

  /* ---------------- SAVE / UPDATE ---------------- */
  const handleSave = async () => {
    const payload: BookingSource = {
      id: form.id.trim(),
      label: form.label.trim(),
      sourceType: form.sourceType,
      whoPays: form.whoPays,
      paymentTiming: form.paymentTiming,
      commissionPercent: Number(form.commissionPercent) || 0,
    };

    try {
      if (editingId) {
        await api.put(`/api/BookingSourceProfile/${editingId}`, payload);
      } else {
        await api.post("/api/BookingSourceProfile", payload);
      }

      showAlert("success", editingId ? "Updated successfully" : "Added successfully");
      await loadSources();
      resetForm();
    } catch (err) {
      console.error(err);
      showAlert("error", "Operation failed");
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (item: BookingSource) => {
    setEditingId(item.id);
    setForm({
      id: item.id,
      label: item.label ?? "",
      sourceType: item.sourceType ?? "",
      whoPays: item.whoPays ?? "",
      paymentTiming: item.paymentTiming ?? "",
      commissionPercent: String(item.commissionPercent ?? 0),
    });
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking source?")) return;

    try {
      await api.delete(`/api/BookingSourceProfile/${id}`);
      showAlert("success", "Deleted successfully");
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      showAlert("error", "Delete failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <AlertBox
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, show: false })}
      />

      <div className="bg-gray-50 min-h-screen text-gray-800 py-16">
        <div className="flex flex-row items-center justify-between bg-white py-4 px-8 ">
          <h2 className="text-xl font-semibold">Booking Source Profile</h2>
        </div>

        <div className="p-6">
          {/* FORM */}
          <section className="rounded-xl p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaTag size={18} /> ID
                </Label>
                <Input
                  value={form.id}
                  disabled={!!editingId}
                  onChange={(e) => updateField("id", e.target.value)}
                  placeholder="BOOKING / AGODA"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <BiCategory size={18} /> Label
                </Label>
                <Input
                  value={form.label}
                  onChange={(e) => updateField("label", e.target.value)}
                  placeholder="Booking.com / Agoda"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaRandom size={18} /> Source Type
                </Label>
                <Select
                  value={form.sourceType}
                  onChange={(e) => updateField("sourceType", e.target.value)}
                >
                  <option value="">Select Source Type</option>
                  <option value="DIRECT">DIRECT</option>
                  <option value="OTA">OTA</option>
                  <option value="AGENT">AGENT</option>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaCreditCard size={18} /> Who Pays
                </Label>
                <Input
                  value={form.whoPays}
                  onChange={(e) => updateField("whoPays", e.target.value)}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <FaClock size={18} /> Payment Timing
                </Label>
                <Select
                  value={form.paymentTiming}
                  onChange={(e) => updateField("paymentTiming", e.target.value)}
                >
                  <option value="">Select Payment Timing</option>
                  <option value="ARRIVAL">ARRIVAL</option>
                  <option value="DEPARTURE">DEPARTURE</option>
                  <option value="BOTH">BOTH</option>
                  <option value="MONTHLY">MONTHLY</option>
                  <option value="YEARLY">YEARLY</option>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <RiMoneyDollarCircleFill /> Commission %
                </Label>
                <Input
                  type="number"
                  value={form.commissionPercent}
                  onChange={(e) => updateField("commissionPercent", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button variant="borderBlue" onClick={resetForm}>
                Reset
              </Button>
              <Button onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
            </div>
          </section>

          {/* TABLE */}
          <section className="mt-8 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>ID</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Who Pays</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sources.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.label}</TableCell>
                    <TableCell>{s.sourceType}</TableCell>
                    <TableCell>{s.whoPays}</TableCell>
                    <TableCell>{s.paymentTiming}</TableCell>
                    <TableCell>{s.commissionPercent}%</TableCell>
                    <TableCell className="flex justify-center gap-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(s)}
                        className="rounded-xl"
                      >
                        <FaEdit className="text-gray-800 text-[14px]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(s.id)}
                        className="rounded-xl"
                      >
                        <FaTrash className="text-red-500 text-[14px]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {sources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No booking sources available
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
