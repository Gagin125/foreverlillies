import { NextResponse } from "next/server";
import { generatePayPalClientToken, getPayPalConfig } from "@/lib/paypal";

export async function GET() {
  try {
    const { env, clientId } = getPayPalConfig();
    if (!clientId) {
      return NextResponse.json({ env, clientId: "" }, { status: 500 });
    }

    let clientToken: string | null = null;
    try {
      clientToken = await generatePayPalClientToken();
    } catch {
      clientToken = null;
    }

    return NextResponse.json({ env, clientId, clientToken });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "PayPal config error" }, { status: 500 });
  }
}
