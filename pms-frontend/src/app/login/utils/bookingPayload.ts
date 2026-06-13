export function buildBookingPayload({
  guest,
  idType,
  idNumber,
  sourceId,
  checkin,
  checkout,
  adults,
  children,
  selectedRooms,
  selectedAddons,
  selectedMealPlanId,
  mealPlans,
  totalAmount,
  discount,
  paymentMethod,
  paymentType,
  paidAmount,
}: any) {
  const finalTotal = totalAmount - discount;

  return {
    guest: {
      name: `${guest.firstName ?? ""} ${guest.lastName ?? ""}`.trim(),
      guestcode: guest.guestcode ?? "",
      idType,
      idNumber,
      phone: guest.phone,
      email: guest.email,
      address: `${guest.HomeAddress ?? ""}, ${guest.City ?? ""}`.trim(),
      country: guest.country,
    },

    sourceId: sourceId,

    checkinDate: new Date(checkin).toISOString(),
    checkoutDate: new Date(checkout).toISOString(),

    adalts: adults,
    children,
    discount,

    rooms: selectedRooms.map((r: any) => ({
      roomId: r.roomId,
      roomTypeId: r.roomTypeId,
      pricePerNight: r.pricePerNight,
    })),

    addons: selectedAddons.map((a: any) => ({
      addonId: a.addonId,
      price: a.price,
    })),

    mealPlans: selectedMealPlanId
      ? [
          {
            mealPlanId: Number(selectedMealPlanId),
            price:
              mealPlans.find(
                (m: any) => m.mealPlanId === Number(selectedMealPlanId)
              )?.price ?? 0,
          },
        ]
      : [],

    payment: {
      amount: paidAmount, // ✅ PAID amount
      method: paymentMethod,
      transactionId: paymentType || "",
      paymentDate: new Date().toISOString(),

      // Swagger accepts lowercase enum
      status:
        paidAmount === 0
          ? "pending"
          : paidAmount < finalTotal
          ? "advance"
          : "paid",
    },
  };
}
