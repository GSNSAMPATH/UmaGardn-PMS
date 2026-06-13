// "use client";

// import { useState } from "react";
// import { FaChevronDown } from "react-icons/fa";

// export interface DropdownItem2 {
//   label: string;
//   value: string;
// }
// interface SelectionDropdownProps {
//   label?: string;
//   items: DropdownItem2[]; // YOU CAN PASS API OR HARDCODE DATA
//   value?: string;
//   onChange?: (value: string) => void;
// }

// export default function SelectionDropdown({
//   label = "Select Option",
//   items,
//   value,
//   onChange,
// }: SelectionDropdownProps) {
//   const [open, setOpen] = useState(false);

//   const selected = items.find((i) => i.value === value);

//   return (
//     <div className="relative inline-block text-left">
//       <button
//         onClick={() => setOpen(!open)}
//         className="
//           flex items-center justify-between gap-2
//           bg-white 
//           px-4 py-2 
//           rounded-full 
//           shadow-sm 
//           text-sm font-medium 
//           border border-gray-300
//           hover:shadow-md 
//           transition
//           min-w-[150px]
//         "
//       >
//         {selected ? selected.label : label}
//         <FaChevronDown size={12} className="text-gray-700" />
//       </button>

//       {open && (
//         <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 z-50">
//           {items.map((item) => (
//             <div
//               key={item.value}
//               className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
//               onClick={() => {
//                 onChange?.(item.value);
//                 setOpen(false);
//               }}
//             >
//               {item.label}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export interface DropdownItem {
  label: string;
  value: string;
}

interface SelectionDropdownProps {
  label?: string;
  items: DropdownItem[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function SelectionDropdown({
  label = "Select",
  items,
  value,
  onChange,
}: SelectionDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // CLOSE WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    items.find((i) => i.value === value)?.label ?? label;

  return (
    <div className="relative inline-block z-[1]" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2 
          px-4 py-2 
          rounded-full
          font-inter 
          shadow-sm 
          text-[12px] font-semibold
          border border-gray-200
          hover:shadow-md 
          transition
          bg-gray-100
        "
      >
        {selectedLabel}
        <FaChevronDown size={12} className="text-gray-700 border border-gray-300 rounded-full py-1 h-5 w-5" />
      </button>

      {/* Dropdown LIST */}
      {open && (
        <div className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-lg z-50">
          {items.map((item) => (
            <div
              key={item.value}
              onClick={() => {
                onChange?.(item.value);
                setOpen(false); // CLOSE AFTER CLICK
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
