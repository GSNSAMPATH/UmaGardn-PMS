"use client";
import { createContext, useContext, useState } from "react";
import BookingSuccessModal from "@/app/components/BookingSuccessModal";
import SimplePopup from "./SimplePopup";

type PopupType = 
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { type: "invoice"; invoiceData: any }
  | null;

interface PopupContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInvoice: (invoiceData: any) => void;
  hidePopup: () => void;
}

const PopupContext = createContext<PopupContextType | null>(null);

export const usePopup = () => useContext(PopupContext);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<PopupType>(null);

  const showSuccess = (message: string) => setPopup({ type: "success", message });
  const showError = (message: string) => setPopup({ type: "error", message });
  const showInvoice = (invoiceData: any) => setPopup({ type: "invoice", invoiceData });
  const hidePopup = () => setPopup(null);

  return (
    <PopupContext.Provider value={{ showSuccess, showError, showInvoice, hidePopup }}>
      {children}

      {/* Global Popups */}
      {popup?.type === "invoice" && popup.invoiceData && (
        <BookingSuccessModal
          open={true}
          onClose={hidePopup}
          invoiceData={popup.invoiceData}
        />
      )}

      {popup?.type === "success" && (
        <SimplePopup title="Success" message={popup.message} onClose={hidePopup} />
      )}

      {popup?.type === "error" && (
        <SimplePopup title="Error" message={popup.message} onClose={hidePopup} error />
      )}
    </PopupContext.Provider>
  );
}
