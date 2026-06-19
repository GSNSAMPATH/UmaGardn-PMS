"use client";

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
  if (!open) return null;

  const handlePrint = async () => {
    try {
      const html2pdf =
        (await import("html2pdf.js")).default;

      let element =
        document.getElementById(
          "quotation-content"
        );

      if (!element) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1500)
        );

        element =
          document.getElementById(
            "quotation-content"
          );
      }

      if (!element) {
        alert(
          "Quotation template is still loading."
        );
        return;
      }

      await html2pdf()
        .set({
          margin: 10,
          filename: `Quotation-${
            quotationData.quoteNumber ??
            quotationData.id
          }.pdf`,
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
    } catch (err) {
      console.error(
        "Failed to generate PDF",
        err
      );

      alert(
        "Failed to generate quotation PDF."
      );
    }
  };

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
            Download PDF
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
          <QuotationTemplate
            quotation={quotationData}
          />
        </div>
      </div>
    </div>
  );
}