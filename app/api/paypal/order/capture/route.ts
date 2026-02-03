import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

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

    return NextResponse.json({ status: capture.status, captureId, payer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "PayPal capture failed" }, { status: 500 });
  }
}
