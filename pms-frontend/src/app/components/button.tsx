// "use client";

// import * as React from "react";
// import { Slot } from "@radix-ui/react-slot";
// import { cn } from "@/lib/utils";

// type Variant = "primary" | "secondary" | "outline";
// type Size = "sm" | "md" | "lg" | "icon";

// interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   asChild?: boolean;
//   variant?: Variant;
//   size?: Size;
// }



// const sizeClasses: Record<Size, string> = {
//   sm: "h-8 px-3 text-xs",
//   md: "h-10 px-4 text-sm",
//   lg: "h-12 px-6 text-base",
//   icon: "h-10 w-10 p-0 flex items-center justify-center",
// };

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//   ({ className, asChild = false, variant = "primary", size = "md", ...props }, ref) => {
//     const Comp = asChild ? Slot : "button";

//     return (
//       <Comp
//         ref={ref}
//         className={cn(
//           "inline-flex items-center justify-center rounded-full font-medium shadow transition active:scale-95",
//           "disabled:opacity-50 disabled:pointer-events-none",
//           "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
//           "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
//           "disabled:opacity-50 disabled:pointer-events-none",
//           sizeClasses[size],
//           className
//         )}
//         {...props}
//       />
//     );
//   }
// );

// Button.displayName = "Button";

// export { Button };

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "borderBlue"
  | "borderRed"
  | "borderGreen"
  | "borderYellow";

type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-12 px-3 text-xs",
  md: "h-10 w-30 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0 flex items-center justify-center",
};

// ⭐ NEW — Border color styles
const variantClasses: Record<Variant, string> = {
  primary: "bg-gray-800 text-white hover:bg-gray-800",
  secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  outline: "border border-gray-400 text-gray-800 hover:bg-gray-100",

  // ▶ NEW BORDER COLOR VARIANTS
  borderBlue: "border border-gray-500 text-gray-600 hover:bg-gray-50",
  borderRed: "border border-red-500 text-red-600 hover:bg-red-50",
  borderGreen: "border border-green-500 text-green-600 hover:bg-green-50",
  borderYellow: "border border-yellow-500 text-yellow-600 hover:bg-yellow-50",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant = "primary", size = "md", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium shadow transition active:scale-95",
          "disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
