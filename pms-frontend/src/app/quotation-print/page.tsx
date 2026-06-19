"use client";

import { useEffect, useState } from "react";
import QuotationTemplate from "../components/QuotationTemplate";

export default function QuotationPrintPage() {
  const [quotation, setQuotation] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem(
      "quotation-print"
    );

    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      setQuotation(parsed);
    } catch (err) {
      console.error(
        "Failed to parse quotation data",
        err
      );
    }
  }, []);

  useEffect(() => {
    if (!quotation) return;

    // Set browser page title
    document.title = `Quotation-${
      quotation.id ||
      "Document"
    }`;

    const timer = setTimeout(() => {
      window.print();
    }, 1500);

    const handleAfterPrint = () => {
      window.close();
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    return () => {
      clearTimeout(timer);
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, [quotation]);

  if (!quotation) {
    return (
      <div className="p-6">
        Loading quotation...
      </div>
    );
  }

  return (
    <QuotationTemplate
      quotation={quotation}
    />
  );
}