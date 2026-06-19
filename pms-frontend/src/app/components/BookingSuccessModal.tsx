// "use client";

// import { useRef } from "react";
// import { useReactToPrint } from "react-to-print";
// import InvoiceTemplate from "./InvoiceTemplate";

// interface InvoiceData {
//   booking: {
//     bookingRef: string;
//     guestName: string;
//     checkin: string;
//     checkout: string;
//     roomTotal: number;
//     mealTotal: number;
//     addonTotal: number;
//     discount: number;
//     totalAmount: number;
//   };
//   payments: { method: string; amount: number; status: string }[];
//   status?: string;
// }

// interface BookingSuccessModalProps {
//   open: boolean;
//   onClose: () => void;
//   invoiceData: InvoiceData;
// }

// export default function BookingSuccessModal({
//   open,
//   onClose,
//   invoiceData,
// }: BookingSuccessModalProps) {
//   const invoiceRef = useRef<HTMLDivElement>(null);

//   if (!open) return null;

//   const statusText = invoiceData?.status
//     ? invoiceData.status === "checkedin"
//       ? "Check-In Completed"
//       : invoiceData.status === "checkedout"
//       ? "Checkout Completed"
//       : "Booking Saved"
//     : "Booking Completed";

//   // ✅ Using new contentRef API
//   const handlePrint = useReactToPrint({
//     contentRef: invoiceRef,
//     documentTitle: `Invoice-${invoiceData.booking.bookingRef}`,
//   });

//   console.log("invoiceData in modal :", invoiceData);

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl p-6 w-[400px] text-gray-500">
//         <h2 className="text-lg font-semibold mb-2">{statusText}</h2>
//         <p className="text-sm text-gray-600 mb-4">
//           Booking Ref: <b>{invoiceData.booking.bookingRef}</b>
//         </p>

//         <div className="flex gap-3 justify-end">
//           <button onClick={onClose} className="px-4 py-2 border rounded-full">
//             OK
//           </button>
//           <button
//             onClick={handlePrint}
//             className="px-4 py-2 bg-gray-800 text-white rounded-full"
//           >
//             Print Invoice
//           </button>
//         </div>

//         {/* Printable content off-screen */}
//         <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
//           <div ref={invoiceRef}>
//             <InvoiceTemplate
//               booking={invoiceData.booking}
//               payments={invoiceData.payments}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import html2pdf from "html2pdf.js";
import InvoiceTemplate from "./InvoiceTemplate";

interface InvoiceData {
  booking: {
    bookingRef: string;
    guestName: string;
    checkin: string;
    checkout: string;
    roomTotal: number;
    mealTotal: number;
    addonTotal: number;
    discount: number;
    totalAmount: number;
  };
  payments: {
    method: string;
    amount: number;
    status: string;
  }[];
  status?: string;
}

interface BookingSuccessModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

export default function BookingSuccessModal({
  open,
  onClose,
  invoiceData,
}: BookingSuccessModalProps) {
  if (!open) return null;

  const statusText = invoiceData?.status
    ? invoiceData.status === "checkedin"
      ? "Check-In Completed"
      : invoiceData.status === "checkedout"
      ? "Checkout Completed"
      : "Booking Saved"
    : "Booking Completed";

  const handleDownloadPdf = async () => {
    let element = document.getElementById(
      "invoice-content"
    );

    if (!element) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      element = document.getElementById(
        "invoice-content"
      );
    }

    if (!element) {
      alert(
        "Invoice template is still loading."
      );
      return;
    }

    await html2pdf()
      .set({
        margin: 10,
        filename: `Invoice-${invoiceData.booking.bookingRef}.pdf`,
        image: {
          type: "jpeg",
          quality: 1,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(element)
      .save();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] text-gray-500">
        <h2 className="text-lg font-semibold mb-2">
          {statusText}
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Booking Ref:{" "}
          <b>
            {
              invoiceData.booking
                .bookingRef
            }
          </b>
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-full"
          >
            OK
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-gray-800 text-white rounded-full"
          >
            Download Invoice
          </button>
        </div>

        {/* Hidden PDF Template */}
        <div
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            width: "800px",
            background: "#fff",
          }}
        >
          <InvoiceTemplate
            booking={invoiceData.booking}
            payments={invoiceData.payments}
          />
        </div>
      </div>
    </div>
  );
}