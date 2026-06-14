"use client";
import { useEffect, useState } from "react";
import TopNav from "../../components/Admin/TopNav";
import AdminSidebar from "../../components/Admin/Sidebar";
import FrontDeskSidebar from "../../components/Frontdesck/Sidebar";
import Cookies from "js-cookie";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
    const userRole = Cookies.get("role");
    setRole(userRole || null);
  }, []);



  return (
    <div>
      <TopNav onMenuClick={() => setOpen(!open)} />
      {role === "Admin" ? <AdminSidebar open={open} onClose={() => setOpen(false)} /> : <FrontDeskSidebar open={open} onClose={() => setOpen(false)} /> }
      <main className={`min-h-screen  ${open ? "xl:ml-64 w-fixed" : ""}`} >{children}</main>
    </div>
  );
}
