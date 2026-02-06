import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { appendOrderRow } from "@/lib/googleSheets";
import { buildCartSummary } from "@/lib/cart";
import { getShipping, type DeliveryMethod, type LockerCarrier, type LockerCountry } from "@/lib/shipping";
import { buildItemsSummary, buildOrderRow, type CheckoutDetailsInput, type CartItemInput } from "@/lib/orderLog";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const capture = await capturePayPalOrder(orderId);
    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed", status: capture.status }, { status: 502 });
    }

    const captureId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const payer = capture?.payer
      ? {
          email: capture.payer.email_address,
          name: `${capture.payer.name?.given_name ?? ""} ${capture.payer.name?.surname ?? ""}`.trim()
        }
      : null;

    const items = Array.isArray(body.items) ? (body.items as CartItemInput[]) : [];
    const details = (body.checkoutDetails || {}) as CheckoutDetailsInput;

    if (items.length > 0) {
      try {
        const summary = buildCartSummary(items);
        const shipping = details.shipping || {};
        const shippingCost = getShipping({
          method: (shipping.method as DeliveryMethod) || "pickup",
          country: (shipping.country as LockerCountry) || "",
          carrier: (shipping.carrier as LockerCarrier) || ""
        });
        const taxValue = ((summary.subtotal + shippingCost.cost) * 0.03).toFixed(2);
        const totalValue = (summary.subtotal + shippingCost.cost + Number(taxValue)).toFixed(2);
        const itemsSummary = buildItemsSummary(items);

        const row = buildOrderRow({
          orderId,
          date: new Date().toISOString(),
          details,
          itemsSummary,
          subtotal: summary.subtotal.toFixed(2),
          shippingCost: shippingCost.cost.toFixed(2),
          tax: taxValue,
          total: totalValue,
          paymentStatus: capture.status
        });

        await appendOrderRow(row);
      } catch (error) {
        console.error("Google Sheets append failed", error instanceof Error ? error.message : error);
      }
    }

    return NextResponse.json({ status: capture.status, captureId, payer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "PayPal capture failed" }, { status: 500 });
  }
}
