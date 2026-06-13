import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // ✅ IMPORTANT (fs needs Node)

type Payload = {
  booking: {
    bookingRef: string;
    guestName: string;
    checkin: string;
    checkout: string;
    advanceAmount?: number;
    roomTotal?: number;
    mealTotal?: number;
    addonTotal?: number;
    discount?: number;
    totalAmount?: number;
    invoiceNumber?: string;
    subInvoiceNumber?: string;
    roomNumbers?: string;
    totalNights?: number;
  };
  payments: Array<{
    method: string;
    amount?: number;
    status: string;
    paymentDate?: string;
  }>;
};

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

const lkr = (v?: number) =>
  (v ?? 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Payload>;
    const booking = body.booking;
    const payments = body.payments ?? [];

    if (!booking || !booking.guestName) {
      return NextResponse.json({ html: "", error: "Missing booking data" }, { status: 400 });
    }

    const templatePath = path.join(process.cwd(), "templates", "invoice.html");

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { html: "", error: `Template not found: ${templatePath}` },
        { status: 500 }
      );
    }

    let html = fs.readFileSync(templatePath, "utf8");

    const paidAmount = payments.reduce((sum, p) => {
      if ((p.status || "").toLowerCase() !== "cancelled") return sum + (p.amount ?? 0);
      return sum;
    }, 0);

    const paymentMade = (booking.advanceAmount ?? 0) + paidAmount;

    const totalAmount =
      booking.totalAmount ??
      (booking.roomTotal ?? 0) + (booking.mealTotal ?? 0) + (booking.addonTotal ?? 0);

    const balanceDue = Math.max(totalAmount - paymentMade, 0);

    const items = [
      {
        desc: `Room Charges${booking.roomNumbers ? ` (Room ${booking.roomNumbers})` : ""}${
          booking.checkin && booking.checkout
            ? `\nDate - ${booking.checkin} - ${booking.checkout}${
                booking.totalNights ? ` (${booking.totalNights}N)` : ""
              }`
            : ""
        }`,
        qty: booking.totalNights ?? 1,
        rate:
          booking.totalNights && booking.totalNights > 0
            ? (booking.roomTotal ?? 0) / booking.totalNights
            : booking.roomTotal ?? 0,
        amount: booking.roomTotal ?? 0,
        show: (booking.roomTotal ?? 0) > 0,
      },
      {
        desc: "Meals",
        qty: 1,
        rate: booking.mealTotal ?? 0,
        amount: booking.mealTotal ?? 0,
        show: (booking.mealTotal ?? 0) > 0,
      },
      {
        desc: "Add-ons",
        qty: 1,
        rate: booking.addonTotal ?? 0,
        amount: booking.addonTotal ?? 0,
        show: (booking.addonTotal ?? 0) > 0,
      },
      {
        desc: "Discount",
        qty: 1,
        rate: (booking.discount ?? 0),
        amount: (booking.discount ?? 0),
        show: (booking.discount ?? 0) > 0,
      },
    ].filter((x) => x.show);

    const itemsHtml = items
      .map(
        (it, idx) => `
<tr>
  <td>${idx + 1}</td>
  <td>${(it.desc || "").replace(/\n/g, "<br/>")}</td>
  <td style="text-align:right">${String(it.qty)}</td>
  <td style="text-align:right">${lkr(it.rate)}</td>
  <td style="text-align:right">${lkr(it.amount)}</td>
</tr>`
      )
      .join("");

    html = html
      .replaceAll("{{invoiceNumber}}", booking.invoiceNumber || booking.subInvoiceNumber || "—")
      .replaceAll("{{guestName}}", booking.guestName || "—")
      .replaceAll("{{invoiceDate}}", formatDate(booking.checkout))
      .replaceAll("{{dueDate}}", formatDate(booking.checkout))
      .replaceAll("{{items}}", itemsHtml)
      .replaceAll("{{subTotal}}", lkr(totalAmount))
      .replaceAll("{{total}}", lkr(totalAmount))
      .replaceAll("{{paid}}", lkr(paymentMade))
      .replaceAll("{{balanceDue}}", lkr(balanceDue));

    return NextResponse.json({ html });
  } catch (err: any) {
    console.error("invoice-html error:", err);
    return NextResponse.json(
      { html: "", error: err?.message || "Failed to render invoice HTML" },
      { status: 500 }
    );
  }
}
