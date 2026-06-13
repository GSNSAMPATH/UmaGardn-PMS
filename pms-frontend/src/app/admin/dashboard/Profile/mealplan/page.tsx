"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { BiCategory } from "react-icons/bi";

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

type MealPlan = {
  mealPlanId: number;
  name: string;
  description: string;
  price: number | string;
};

export default function MealPlanPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [mealPlanId, setMealPlanId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  // Alert Handling
  const [alertBox, setAlertBox] = useState({
    show: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const showAlert = (type: any, message: string) => {
    setAlertBox({ show: true, type, message });
  };

  const loadMealPlans = async () => {
    try {
      const data = await api.get<MealPlan[]>("/api/MealPlans");
      setMealPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load meal plans");
    }
  };

  // Fetch Data
  useEffect(() => {
    loadMealPlans();
  }, []);

  // Update field
  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Reset form
  const handleReset = () => {
    setMealPlanId(null);
    setForm({
      name: "",
      description: "",
      price: "",
    });
  };

  // Save / Update
  const handleSave = async () => {
    try {
      if (!mealPlanId) {
        // Create
        await api.post("/api/MealPlans", {
          name: form.name,
          description: form.description,
          price: form.price,
        });

        showAlert("success", "Meal Plan added successfully!");
      } else {
        // Update
        await api.put(`/api/MealPlans/${mealPlanId}`, {
          mealPlanId,
          name: form.name,
          description: form.description,
          price: form.price,
        });

        showAlert("success", "Meal Plan updated successfully!");
      }

      await loadMealPlans();
      handleReset();
    } catch (err) {
      console.error(err);
      showAlert("error", mealPlanId ? "Error updating meal plan" : "Error adding meal plan");
    }
  };

  // Edit data
  const handleEdit = (item: MealPlan) => {
    setMealPlanId(item.mealPlanId);
    setForm({
      name: item.name ?? "",
      description: item.description ?? "",
      price: String(item.price ?? ""),
    });
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this meal plan?")) return;

    try {
      await api.delete(`/api/MealPlans/${id}`);
      showAlert("success", "Meal Plan deleted!");
      await loadMealPlans();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error deleting meal plan");
    }
  };

  // Description limiter (20 words)
  const limitWords = (text: string) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.slice(0, 20).join(" ") + (words.length > 20 ? "..." : "");
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
        <div className="flex flex-row items-center justify-between bg-white py-4 px-8">
          <h2 className="text-xl font-semibold">Meal Plan Settings</h2>
        </div>

        <div className="p-6">
          {/* FORM */}
          <section className="rounded-xl p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <BiCategory size={18} /> Plan Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter meal plan name"
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
                  <RiMoneyDollarCircleFill size={18} /> Price
                </Label>
                <Input
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="Enter price"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button variant="borderBlue" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleSave} className="bg-gray-800 text-white">
                {mealPlanId ? "Update" : "Save"}
              </Button>
            </div>
          </section>

          {/* TABLE */}
          <section className="mt-8 rounded-xl">
            <h2 className="text-xl font-semibold mb-6">Meal Plan List</h2>

            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {mealPlans.length > 0 ? (
                  mealPlans.map((item) => (
                    <TableRow key={item.mealPlanId}>
                      <TableCell>{item.mealPlanId}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{limitWords(item.description)}</TableCell>
                      <TableCell>Rs: {item.price}</TableCell>

                      <TableCell className="text-center flex justify-center gap-4">
                        <Button
                          onClick={() => handleEdit(item)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <FaEdit className="text-gray-800 text-[14px]" />
                        </Button>

                        <Button
                          onClick={() => handleDelete(item.mealPlanId)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <FaTrash className="text-red-500 text-[14px]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      No meal plans available
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
