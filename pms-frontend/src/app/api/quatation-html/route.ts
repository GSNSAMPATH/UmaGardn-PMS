import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type Payload = {
  quotation: {
    quoteNumber?: string;
    guestName: string;
    guestPhone?: string;
    guestIdType?: string;
    guestIdNumber?: string;

    checkin?: string;
    checkout?: string;
    nights?: number;
    adults?: number;
    children?: number;

    roomTotal?: number;
    mealTotal?: number;
    addonTotal?: number;
    discount?: number;
    totalAmount?: number;
  };

  rooms?: Array<{
    roomNumber: string;
    roomTypeName?: string;
    pricePerNight?: number;
  }>;

  mealPlan?: {
    name?: string;
    price?: number;
  } | null;

  addons?: Array<{
    name: string;
    price?: number;
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
  (v ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Payload>;

    const quotation = body.quotation;
    const rooms = body.rooms ?? [];
    const mealPlan = body.mealPlan;
    const addons = body.addons ?? [];

    if (!quotation || !quotation.guestName) {
      return NextResponse.json(
        { html: "", error: "Missing quotation data" },
        { status: 400 }
      );
    }

    const templatePath = path.join(process.cwd(), "templates", "quotation.html");

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { html: "", error: `Template not found: ${templatePath}` },
        { status: 500 }
      );
    }

    let html = fs.readFileSync(templatePath, "utf8");

    const totalGuests =
      (quotation.adults ?? 0) + (quotation.children ?? 0);

    const totalAmount =
      quotation.totalAmount ??
      (quotation.roomTotal ?? 0) +
        (quotation.mealTotal ?? 0) +
        (quotation.addonTotal ?? 0) -
        (quotation.discount ?? 0);

    // ---------------- BUILD ITEMS ----------------

    const items: any[] = [];

    // Rooms
    rooms.forEach((r) => {
      if (!quotation.nights || !r.pricePerNight) return;

      items.push({
        desc: `Room ${r.roomNumber}${
          r.roomTypeName ? ` - ${r.roomTypeName}` : ""
        }\n${quotation.checkin} - ${quotation.checkout} (${quotation.nights}N)`,
        qty: quotation.nights,
        rate: r.pricePerNight,
        amount: r.pricePerNight * quotation.nights,
      });
    });

    // Meal Plan
    if (mealPlan && quotation.nights && totalGuests) {
      const qty = quotation.nights * totalGuests;

      items.push({
        desc: `Meal Plan - ${mealPlan.name}`,
        qty,
        rate: mealPlan.price ?? 0,
        amount: (mealPlan.price ?? 0) * qty,
      });
    }

    // Add-ons
    addons.forEach((a) => {
      items.push({
        desc: a.name,
        qty: 1,
        rate: a.price ?? 0,
        amount: a.price ?? 0,
      });
    });

    const itemsHtml = items
      .map(
        (it, idx) => `
<tr>
  <td>${idx + 1}</td>
  <td>${(it.desc || "").replace(/\n/g, "<br/>")}</td>
  <td style="text-align:right">${it.qty}</td>
  <td style="text-align:right">${lkr(it.rate)}</td>
  <td style="text-align:right">${lkr(it.amount)}</td>
</tr>`
      )
      .join("");

    // ---------------- REPLACE TEMPLATE VALUES ----------------

    html = html
      .replaceAll("{{quoteNumber}}", quotation.quoteNumber || "—")
      .replaceAll("{{guestName}}", quotation.guestName || "—")
      .replaceAll("{{guestPhone}}", quotation.guestPhone || "—")
      .replaceAll("{{guestIdType}}", quotation.guestIdType || "")
      .replaceAll("{{guestIdNumber}}", quotation.guestIdNumber || "")
      .replaceAll("{{checkin}}", formatDate(quotation.checkin))
      .replaceAll("{{checkout}}", formatDate(quotation.checkout))
      .replaceAll("{{nights}}", String(quotation.nights ?? 0))
      .replaceAll("{{guestsCount}}", String(totalGuests))
      .replaceAll("{{items}}", itemsHtml)
      .replaceAll("{{roomTotal}}", lkr(quotation.roomTotal))
      .replaceAll("{{mealTotal}}", lkr(quotation.mealTotal))
      .replaceAll("{{addonTotal}}", lkr(quotation.addonTotal))
      .replaceAll("{{discount}}", lkr(quotation.discount))
      .replaceAll("{{totalAmount}}", lkr(totalAmount))
      .replaceAll("{{quoteDate}}", formatDate(new Date().toISOString()))
      .replaceAll(
        "{{validUntil}}",
        formatDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        )
      );

    return NextResponse.json({ html });
  } catch (err: any) {
    console.error("quotation-html error:", err);
    return NextResponse.json(
      { html: "", error: err?.message || "Failed to render quotation HTML" },
      { status: 500 }
    );
  }
}