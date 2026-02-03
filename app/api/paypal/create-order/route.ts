import { NextResponse } from "next/server";
import { getAccessToken, getPaypalBaseUrl } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amountRaw = typeof body?.amount === "string" ? body.amount : String(body?.amount ?? "");
    const currencyRaw = typeof body?.currency === "string" ? body.currency : "";
    const amount = Number(amountRaw);
    const currency = currencyRaw.toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "INVALID_AMOUNT" }, { status: 400 });
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json({ error: "INVALID_CURRENCY" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            }
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "PAYPAL_CREATE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "PAYPAL_CREATE_FAILED" }, { status: 500 });
  }
}
