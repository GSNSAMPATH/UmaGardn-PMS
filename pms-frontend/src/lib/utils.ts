// utils.ts
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// utils2.ts
export function joinClasses(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}