"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import LayoutWrapper from "./dashboard/LayoutWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const role = Cookies.get("role"); // <-- FIXED!

    console.log("role from cookie = ", role);

    if (!role) {
      router.push("/login");
      return;
    }

    if (role.toLowerCase() !== "admin") {
      router.push("/403");
      return;
    }

    setAllowed(true);
  }, []);

  if (!allowed) return null;

  return <LayoutWrapper>{children}</LayoutWrapper>;
}
