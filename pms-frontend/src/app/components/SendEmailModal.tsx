"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Guest = {
  email?: string;
  name?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  guest: Guest | null;
};

export default function SendEmailModal({ open, onClose, guest }: Props) {
  const [subject, setSubject] = useState("Regarding Your Booking");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // reset when open changes
  useEffect(() => {
    if (open) {
      setError("");
      setMessage("");
      setSubject("Regarding Your Booking");
    }
  }, [open]);

  if (!open || !guest?.email) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      setError("Message is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/Booking/send-email", {
        to: guest.email,
        subject: subject.trim(),
        body: message.trim(),
        attachments: [],
      });

      onClose();
    } catch (err: any) {
      // shows your backend error if it exists
      setError(err?.message || "Email sending failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-1">Send Email to</h2>
        <p className="text-sm text-gray-500 mb-4">{guest.email}</p>

        {/* SUBJECT */}
        <input
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            if (error) setError("");
          }}
          placeholder="Email subject"
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
        />

        {/* MESSAGE */}
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter your message..."
          className="w-full h-40 border rounded-lg p-3 text-sm"
        />

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-full"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={loading}
            className="px-5 py-2 bg-black text-white rounded-full disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
