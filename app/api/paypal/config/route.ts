import { NextResponse } from "next/server";
import { generatePayPalClientToken, getPayPalConfig } from "@/lib/paypal";

export async function GET() {
  try {
    const { env, clientId } = getPayPalConfig();
    const enabled = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && clientId);
    if (!enabled) {
      return NextResponse.json({ env, clientId: "", clientToken: null, enabled: false });
    }

    let clientToken: string | null = null;
    try {
      clientToken = await generatePayPalClientToken();
    } catch {
      clientToken = null;
    }

    return NextResponse.json({ env, clientId, clientToken, enabled: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "PayPal config error" }, { status: 500 });
  }
}
