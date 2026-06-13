"use client";

import { api } from "@/lib/api";

export function useCreateBooking() {
  const createBooking = async <T = any>(payload: any) => {
    // ✅ uses NEXT_PUBLIC_API_URL base automatically
    return await api.post<T>("/api/Booking", payload);
  };

  return { createBooking };
}
