import { NextResponse } from "next/server";
import { getAccessToken, getPaypalBaseUrl } from "@/lib/paypal";
import { appendOrderRow } from "@/lib/googleSheets";
import { buildCartSummary } from "@/lib/cart";
import { getShipping, type DeliveryMethod, type LockerCarrier, type LockerCountry } from "@/lib/shipping";
import { buildItemsSummary, buildOrderRow, type CheckoutDetailsInput, type CartItemInput } from "@/lib/orderLog";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderID = typeof body?.orderID === "string" ? body.orderID : "";

    if (!orderID) {
      return NextResponse.json({ error: "INVALID_ORDER_ID" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "PAYPAL_CAPTURE_FAILED" }, { status: 500 });
    }

    const items = Array.isArray(body.items) ? (body.items as CartItemInput[]) : [];
    const details = (body.checkoutDetails || {}) as CheckoutDetailsInput;

    if (items.length > 0 && data?.status === "COMPLETED") {
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
          orderId: orderID,
          date: new Date().toISOString(),
          details,
          itemsSummary,
          subtotal: summary.subtotal.toFixed(2),
          shippingCost: shippingCost.cost.toFixed(2),
          tax: taxValue,
          total: totalValue,
          paymentStatus: data.status
        });

        await appendOrderRow(row);
      } catch (error) {
        console.error("Google Sheets append failed", error instanceof Error ? error.message : error);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "PAYPAL_CAPTURE_FAILED" }, { status: 500 });
  }
}
