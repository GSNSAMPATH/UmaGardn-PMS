"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import QuotationTemplate from "./QuotationTemplate";

interface Props {
  open: boolean;
  onClose: () => void;
  quotationData: any;
}

export default function QuotationSuccessModal({
  open,
  onClose,
  quotationData,
}: Props) {
  const quotationRef = useRef<HTMLDivElement>(null);

  console.log("Quotation data in modal:", quotationData);

  const handlePrint = useReactToPrint({
    contentRef: quotationRef,
    documentTitle: `Quotation-${quotationData?.id ?? ""}`,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[450px]">
        <h2 className="text-xl font-semibold mb-2 text-gray-500">
          Quotation Generated
        </h2>

        <p className="text-sm text-gray-600 mb-5">
          Quote Number :
          <strong>
            {" "}
            {quotationData?.id}
          </strong>
        </p>

        <div className="flex justify-end gap-3 text-gray-500">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-full"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-black text-white rounded-full"
          >
            Print Quotation
          </button>
        </div>

        {/* Hidden Printable Area */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
          }}
        >
          <div ref={quotationRef}>
            <QuotationTemplate
              quotation={quotationData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}