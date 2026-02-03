import { NextResponse } from "next/server";
import { getAccessToken, getPaypalBaseUrl } from "@/lib/paypal";

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

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "PAYPAL_CAPTURE_FAILED" }, { status: 500 });
  }
}
