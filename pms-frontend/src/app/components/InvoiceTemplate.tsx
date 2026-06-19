// "use client";

// import { useEffect, useState } from "react";

// interface InvoiceTemplateProps {
//   booking: {
//     bookingRef: string;
//     guestName: string;
//     checkin: string;
//     checkout: string;
//     advanceAmount?: number;
//     roomTotal?: number;
//     mealTotal?: number;
//     addonTotal?: number;
//     totalAmount?: number;
//     invoiceNumber?: string;
//     subInvoiceNumber?: string;
//     roomNumbers?: string;
//     discount?: number;
//     totalNights?: number;
//   };
//   payments: Array<{
//     method: string;
//     amount?: number;
//     status: string;
//     paymentDate?: string;
//   }>;
// }

//  export default function InvoiceTemplate({ booking, payments }: InvoiceTemplateProps) {
//   const [html, setHtml] = useState<string>("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/invoice-html", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ booking, payments }),
//         });

//         const data = await res.json();
//         if (!mounted) return;

//         setHtml(data.html || "");
//       } catch {
//         if (!mounted) return;
//         setHtml("");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [booking, payments]);

//   if (loading) return <div className="p-6 text-sm text-gray-600">Loading invoice...</div>;

//   return (
//     <div className="bg-white">
//       <div dangerouslySetInnerHTML={{ __html: html }} />
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

interface InvoiceTemplateProps {
  booking: {
    bookingRef: string;
    guestName: string;
    checkin: string;
    checkout: string;
    advanceAmount?: number;
    roomTotal?: number;
    mealTotal?: number;
    addonTotal?: number;
    totalAmount?: number;
    invoiceNumber?: string;
    subInvoiceNumber?: string;
    roomNumbers?: string;
    discount?: number;
    totalNights?: number;
  };
  payments: Array<{
    method: string;
    amount?: number;
    status: string;
    paymentDate?: string;
  }>;
}

export default function InvoiceTemplate({
  booking,
  payments,
}: InvoiceTemplateProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "/api/invoice-html",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              booking,
              payments,
            }),
          }
        );

        const data = await res.json();

        if (!mounted) return;

        setHtml(data.html || "");
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setHtml("");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [booking, payments]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading invoice...
      </div>
    );
  }

  return (
    <div id="invoice-content">
      <div
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </div>
  );
}