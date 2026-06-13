"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex  w-full border-2 rounded-xl border-gray-200  bg-transparent px-3 py-2 text-[14px]",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:ring-none focus-visible:ring-blue-500",
          "disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
