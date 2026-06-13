"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import FeatureCarousel from "../components/FeatureCarousel";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  type LoginResponse = {
  token: string;
  role: string;
  name: string;
  profileImageUrl?: string;
};

  const handleLogin = async () => {
    setError("");

    try {
      const data = await api.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });
      
      if (!data) {
        setError("Invalid email or password");
        return;
      }

      Cookies.set("token", data.token, { expires: 7, path: "/" });
      Cookies.set("role", data.role, { expires: 7, path: "/" });
      Cookies.set("name", data.name, { expires: 7, path: "/" });
      Cookies.set("profileImageUrl", data.profileImageUrl ?? "", {
        expires: 7,
        path: "/",
      });

      setTimeout(() => {
        switch (data.role.toLowerCase()) {
          case "admin":
          case "manager":
            router.push("/admin/dashboard");
            break;
          case "frontmanager":
            router.push("/frontdesk/dashboard");
            break;
          case "staff":
            router.push("/staff/dashboard");
            break;
          default:
            router.push("/login");
        }
      }, 50);
    } catch {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white text-gray-800">
      {/* LEFT */}
      <div className="flex flex-col py-20 px-10 lg:px-20">
        <p className="text-sm font-semibold mb-12">Novrith PMS</p>

        <h1 className="text-3xl font-bold mb-2">
          Welcome Back to Scenery Villas 
        </h1>
        <p className="text-gray-500 mb-16">Sign in your account</p>

        {/* Email */}
        <label className="text-sm font-medium mb-1">Email / User Name</label>
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full bg-gray-100 rounded-full px-5 py-3 mb-10 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <label className="text-sm font-medium mb-1">Password</label>
        <div className="relative mb-10">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full bg-gray-100 rounded-full px-5 py-3 pr-12 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
        </div>

        {/* Remember */}
        <div className="flex items-center gap-2 mb-6">
          <input type="checkbox" defaultChecked />
          <span className="text-sm text-gray-500">Remember me</span>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-3 rounded-full font-semibold hover:opacity-90 transition"
        >
          Log In
        </button>

        <p className="text-xs text-gray-400 mt-16">
          Copyright 2026
        </p>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex items-center justify-center bg-gray-50 px-12">
        <FeatureCarousel />
      </div>
    </div>
  );
}
