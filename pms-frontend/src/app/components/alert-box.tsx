"use client";

import { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface AlertBoxProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number; // auto close
}

export default function AlertBox({
  type = "info",
  message,
  show,
  onClose,
  duration = 3000,
}: AlertBoxProps) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [show]);

  const styles = {
    success: "bg-green-100 border-green-500 text-green-800",
    error: "bg-red-100 border-red-500 text-red-800",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
    info: "bg-blue-100 border-blue-500 text-blue-800",
  };

  const icons = {
    success: <FaCheckCircle size={20} />,
    error: <FaExclamationCircle size={20} />,
    warning: <FaExclamationTriangle size={20} />,
    info: <FaInfoCircle size={20} />,
  };

  return (
    <div
      className={cn(
        "fixed top-6 right-6 z-50 min-w-[260px] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300",
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
        styles[type]
      )}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
}
