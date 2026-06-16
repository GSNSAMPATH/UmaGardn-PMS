import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body  = await req.json();

    const data = body.quotation ?? body;

    console.log("Quotation data received:", data);

    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      "quotation.html"
    );

    let html = fs.readFileSync(
      templatePath,
      "utf8"
    );

    const items: any[] = [];

// Rooms
(data.rooms ?? []).forEach((room: any) => {
  items.push({
    desc: `Room ${room.roomNumber}${
      room.roomTypeName
        ? ` - ${room.roomTypeName}`
        : ""
    }`,
    qty: data.nights ?? 1,
    rate: room.pricePerNight ?? 0,
    amount:
      (room.pricePerNight ?? 0) *
      (data.nights ?? 1),
  });
});

// Meal Plan
if (data.mealPlan) {
  const qty =
    (data.guestsCount ?? 1) *
    (data.nights ?? 1);

  items.push({
    desc: `Meal Plan - ${data.mealPlan.name}`,
    qty,
    rate: data.mealPlan.price ?? 0,
    amount:
      (data.mealPlan.price ?? 0) * qty,
  });
}

// Addons
(data.addons ?? []).forEach(
  (addon: any) => {
    items.push({
      desc: addon.name,
      qty: 1,
      rate: addon.price ?? 0,
      amount: addon.price ?? 0,
    });
  }
);

const itemsHtml = items
  .map(
    (it, idx) => `
<tr>
  <td>${idx + 1}</td>
  <td>${it.desc}</td>
  <td style="text-align:right">${it.qty}</td>
  <td style="text-align:right">${it.rate}</td>
  <td style="text-align:right">${it.amount}</td>
</tr>
`
  )
  .join("");

    html = html
      .replaceAll("{{quoteNumber}}",data.quoteNumber ??String(data.id ?? ""))
      .replaceAll("{{guestName}}", data.guestName ?? "")
      .replaceAll("{{guestPhone}}", data.guestPhone ?? "")
      .replaceAll("{{guestIdType}}", data.guestIdType ?? "")
      .replaceAll("{{guestIdNumber}}", data.guestIdNumber ?? "")
      .replaceAll("{{checkin}}", data.checkin ?? "")
      .replaceAll("{{checkout}}", data.checkout ?? "")
      .replaceAll("{{nights}}", String(data.nights ?? 0))
      .replaceAll("{{guestsCount}}", String(data.guestsCount ?? 0))
      .replaceAll("{{roomTotal}}", String(data.roomTotal ?? 0))
      .replaceAll("{{mealTotal}}", String(data.mealTotal ?? 0))
      .replaceAll("{{addonTotal}}", String(data.addonTotal ?? 0))
      .replaceAll("{{discount}}", String(data.discount ?? 0))
      .replaceAll("{{totalAmount}}", String(data.totalAmount ?? 0))
      .replaceAll("{{quoteDate}}",data.quoteDate? new Date(data.quoteDate).toLocaleDateString("en-GB"): "")
      .replaceAll("{{validUntil}}",data.validUntil? new Date(data.validUntil).toLocaleDateString("en-GB"): "")
      .replaceAll("{{companyName}}", "Umar Garden")
      .replaceAll("{{companyAddress}}", "Kandy, Sri Lanka")
      .replaceAll("{{companyPhone}}", "+94 77 1234567")
      .replaceAll("{{companyEmail}}", "info@umargarden.com")
      .replaceAll("{{logoUrl}}", "https://res.cloudinary.com/dgm9hbcb1/image/upload/v1775286919/c79kbg4orwqwj9j3ftnp.png")
      .replaceAll("{{items}}", itemsHtml)

    return NextResponse.json({
      html,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}