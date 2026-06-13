"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/components/table";

import { FaEnvelope, FaDownload } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import GuestPdfTemplate from "@/app/components/GuestPdfTemplate";
import SelectionDropdown from "@/app/components/SelectionButton";
import SendEmailModal from "@/app/components/SendEmailModal";
import { api } from "@/lib/api";

type GuestRow = {
  id: string;
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  email: string;
  phone: string;
  gender: string;
  country: string;
  address: string;
  bookingId: number | null;
  bookingGuestId: number | null;
};


export default function GuestPage() {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState<"name" | "email" | "id">("name");

  const [selectedGuest, setSelectedGuest] = useState<GuestRow | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailGuest, setEmailGuest] = useState<GuestRow | null>(null);

  // ---------------- FETCH ----------------
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.get<any[]>("/api/Booking/booking-guests");

       const mapped: GuestRow[] = (Array.isArray(data) ? data : []).map((g) => {
        const fullName = String(g?.name ?? "").trim();
        const parts = fullName ? fullName.split(/\s+/) : [];
        const firstName = parts[0] ?? "-";
        const lastName = parts.slice(1).join(" ") || "-";

        return {
          id: String(g?.guestCode ?? g?.id ?? "-"),
          firstName,
          lastName,
          idType: String(g?.idType ?? "-"),
          idNumber: String(g?.idNumber ?? "-"),
          email: String(g?.email ?? "-"),
          phone: String(g?.phone ?? "-"),
          gender: "-", // API not sending gender
          country: String(g?.country ?? "-"),
          address: String(g?.address ?? "-"),
          bookingId: g?.bookingId ?? null,
          bookingGuestId: g?.bookingGuestId ?? null,
        };
      });


        if (alive) setGuests(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load guests");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  // ---------------- FILTER ----------------
  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;

    return guests.filter((g) => {
      const value =
        filterBy === "email"
          ? String(g.email ?? "")
          : filterBy === "id"
          ? String(g.idNumber ?? "")
          : `${g.firstName ?? ""} ${g.lastName ?? ""}`;

      return value.toLowerCase().includes(q);
    });
  }, [search, filterBy, guests]);

  // ---------------- ACTIONS ----------------
  const clearSearch = () => {
    setSearch("");
    setFilterBy("name");
  };

  const waitForNextPaint = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const handleDownload = async (guest: GuestRow) => {
    setSelectedGuest(guest);

    // Wait for GuestPdfTemplate to render into the hidden container
    await waitForNextPaint();
    await waitForNextPaint();

    if (!pdfRef.current) {
      alert("PDF not ready");
      return;
    }

    html2pdf()
      .set({
        filename: `Guest-${guest.id}.pdf`,
        margin: 10,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(pdfRef.current)
      .save();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 text-gray-500">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between bg-white py-4 px-6 rounded-xl shadow-sm">
        <h2 className="text-[20px] font-inter font-semibold text-gray-800">Guest Details</h2>

        <div className="flex items-center gap-3 z-10">
          <SelectionDropdown
            label="Filter By"
            items={[
              { label: "Name", value: "name" },
              { label: "Email", value: "email" },
              { label: "ID", value: "id" },
            ]}
            value={filterBy}
            onChange={(v) => setFilterBy(v as any)}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="border border-gray-300 bg-gray-100 rounded-full px-4 py-2 text-[12px] w-64"
          />

          <button
            onClick={clearSearch}
            className="text-sm text-gray-600 font-semibold hover:underline"
          >
            Clear Search
          </button>
        </div>
      </div>

      {/* ================= STATES ================= */}
      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-gray-600">
          Loading guests...
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-red-500 font-semibold">{error}</p>
          <p className="text-sm text-gray-500 mt-1">
            Check API base URL and backend is running.
          </p>
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && !error && (
        <div className="p-6 rounded-xl font-inter">
          {/* Header table (sticky-like) */}
          <Table>
            <TableHeader className="sticky top-0 bg-white z-5 ">
              <TableRow>
                <TableHead className="text-center w-20 text-[14px]">ID</TableHead>
                <TableHead className="text-center w-30 text-[14px]">First Name</TableHead>
                <TableHead className="text-center w-24 text-[14px]">Last Name</TableHead>
                <TableHead className="text-center w-24 text-[14px]">ID Type</TableHead>
                <TableHead className="text-center w-38 text-[14px]">ID / Passport</TableHead>
                <TableHead className="text-center w-54 text-[14px]">Email</TableHead>
                <TableHead className="text-center w-24 text-[14px]">Phone</TableHead>
                <TableHead className="text-center w-20 text-[14px]">Gender</TableHead>
                <TableHead className="text-center text-[14px]">Country</TableHead>
                <TableHead className="text-center text-[14px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* Body scroll */}
          <div className="max-h-[500px] font-inter  overflow-y-auto hide-scrollbar">
            <Table>
              <TableBody>
                {filteredGuests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-gray-400">
                      No guests found
                    </TableCell>
                  </TableRow>
                )}

                {filteredGuests.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="text-[14px]">{g.id}</TableCell>
                    <TableCell className="text-[14px]">{g.firstName}</TableCell>
                    <TableCell className="text-[14px]">{g.lastName}</TableCell>
                    <TableCell className="text-[14px]">{g.idType}</TableCell>
                    <TableCell className="text-[14px]">{g.idNumber}</TableCell>
                    <TableCell className="text-[14px]">{g.email}</TableCell>
                    <TableCell className="text-[14px]">{g.phone}</TableCell>
                    <TableCell className="text-[14px]">{g.gender}</TableCell>
                    <TableCell className="text-[14px]">{g.country}</TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEmailGuest(g);
                            setEmailOpen(true);
                          }}
                          className="p-2 border rounded-lg hover:bg-gray-100"
                          aria-label="Send Email"
                        >
                          <FaEnvelope />
                        </button>

                        <button
                          onClick={() => handleDownload(g)}
                          className="p-2 border rounded-lg hover:bg-gray-100"
                          aria-label="Download PDF"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Email Modal */}
      <SendEmailModal
        open={emailOpen}
        guest={emailGuest}
        onClose={() => {
          setEmailOpen(false);
          setEmailGuest(null);
        }}
      />

      {/* Hidden PDF render */}
      <div style={{ position: "fixed", left: "-10000px", top: 0 }}>
        {selectedGuest && <GuestPdfTemplate ref={pdfRef} guest={selectedGuest} />}
      </div>
    </div>
  );
}
