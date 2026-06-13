"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Params = Record<string, string | number | boolean | null | undefined>;

export function useFetchData<T>(
  path: string | null,
  initialValue: T,
  params?: Params
) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setData(initialValue);
      setLoading(false);
      setError(null);
      return;
    }

    let alive = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ If it starts with http, use fetch directly (optional)
        // ✅ Otherwise, use api.get("/api/..")
        const result = path.startsWith("http")
          ? ((await (await fetch(path)).json()) as T)
          : await api.get<T>(path, params);

        if (alive) setData(result ?? initialValue);
      } catch (err: any) {
        if (alive) setError(err?.message ?? "Failed to fetch");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, JSON.stringify(params)]);

  return { data, loading, error, setData };
}
