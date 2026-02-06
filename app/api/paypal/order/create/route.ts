import { NextResponse } from "next/server";
import { buildCartSummary } from "@/lib/cart";
import { createPayPalOrder } from "@/lib/paypal";
import { DeliveryMethod, getShipping, LockerCarrier, LockerCountry } from "@/lib/shipping";
import { findLockerById, isLockerValid } from "@/data/lockers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : Array.isArray(body.cart) ? body.cart : [];
    const details = body.checkoutDetails || {};

    const missingFields: string[] = [];
    if (!details.name) missingFields.push("name");
    if (!details.lastName) missingFields.push("lastName");
    if (!details.email) missingFields.push("email");
    if (!details.phone) missingFields.push("phone");

    const shipping = details.shipping || {};
    if (!shipping.method) missingFields.push("deliveryMethod");

    const deliveryMethod = (shipping.method as DeliveryMethod) || "pickup";
    const country = (shipping.country as LockerCountry) || "";
    const carrier = (shipping.carrier as LockerCarrier) || "";
    const city = (shipping.city as string) || "";
    const lockerId = (shipping.locker?.id as string) || "";

    if (deliveryMethod === "locker") {
      if (!country || !["LT", "PL"].includes(country)) missingFields.push("country");
      if (!carrier) missingFields.push("carrier");
      if (!city) missingFields.push("city");
      if (!lockerId) missingFields.push("locker");
      if (country === "LT" && carrier && !["omniva", "dpd"].includes(carrier)) missingFields.push("carrier");
      if (country === "PL" && carrier !== "dpd") missingFields.push("carrier");
    }

    if (missingFields.length > 0) {
      return NextResponse.json({ error: "MISSING_FIELDS", fields: missingFields }, { status: 400 });
    }

    if (
      deliveryMethod === "locker" &&
      country &&
      carrier &&
      city &&
      lockerId &&
      !isLockerValid(country as "LT" | "PL", carrier as "omniva" | "dpd", city, lockerId)
    ) {
      return NextResponse.json({ error: "INVALID_LOCKER", fields: ["locker"] }, { status: 400 });
    }

    const summary = buildCartSummary(items);
    const shippingCost = getShipping({ method: deliveryMethod, country, carrier });
    const taxValue = ((summary.subtotal + shippingCost.cost) * 0.03).toFixed(2);
    const totalValue = (summary.subtotal + shippingCost.cost + Number(taxValue)).toFixed(2);
    const itemTotalValue = summary.subtotal.toFixed(2);
    const shippingValue = shippingCost.cost.toFixed(2);

    const deliveryLine =
      deliveryMethod === "pickup"
        ? "Delivery: Pickup"
        : `Delivery: Locker (${carrier.toUpperCase()}, ${country})`;

    const locker =
      deliveryMethod === "locker" && country && carrier
        ? findLockerById(country as "LT" | "PL", carrier as "omniva" | "dpd", lockerId)
        : null;
    const lockerLabel =
      deliveryMethod === "locker"
        ? `${locker?.name ?? "Locker"} | ${locker?.address ?? ""} | ${city} | ${lockerId}`
        : "N/A";
    const description = `${deliveryLine} | Locker: ${lockerLabel}`;
    const fullName = [details.name, details.lastName].filter(Boolean).join(" ").trim();
    const note = `${fullName || details.name || ""} | ${details.email} | ${details.phone}`;

    const order = await createPayPalOrder({
      total: totalValue,
      items: summary.items,
      itemTotal: itemTotalValue,
      shipping: shippingCost.cost > 0 ? shippingValue : undefined,
      tax: Number(taxValue) > 0 ? taxValue : undefined,
      description,
      note
    });

    return NextResponse.json({ orderId: order.id, total: totalValue });
  } catch (error: any) {
    const message = error.message || "PayPal order failed";
    const status = message === "Invalid cart" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
