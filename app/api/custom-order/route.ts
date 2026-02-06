import { NextResponse } from "next/server";
import { appendCustomOrderRow } from "@/lib/googleSheets";
import { buildCustomOrderRow, type CustomOrderInput } from "@/lib/orderLog";
import { findLockerById, isLockerValid, type LockerCarrier, type LockerCountry } from "@/data/lockers";

type CustomOrderPayload = {
  name?: string;
  email?: string;
  colors?: string;
  quantity?: number | string;
  notes?: string;
  deliveryMethod?: "pickup" | "shipping";
  shipping?: {
    country?: LockerCountry;
    carrier?: LockerCarrier;
    city?: string;
    locker?: {
      id?: string;
      name?: string;
      address?: string;
      postalCode?: string;
    } | null;
  };
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CustomOrderPayload;

    const name = String(payload.name ?? "").trim();
    const email = String(payload.email ?? "").trim();
    const colors = String(payload.colors ?? "").trim();
    const notes = String(payload.notes ?? "").trim();
    const quantity = Number(payload.quantity ?? 1);
    const deliveryMethod = payload.deliveryMethod === "shipping" ? "shipping" : "pickup";

    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!email) missing.push("email");
    if (Number.isNaN(quantity) || quantity < 1) missing.push("quantity");

    const shipping = payload.shipping;
    let locker:
      | {
          id: string;
          name?: string;
          address?: string;
          postalCode?: string;
        }
      | null
      | undefined = null;

    if (deliveryMethod === "shipping") {
      const country = shipping?.country ?? "LT";
      const carrier = shipping?.carrier ?? "";
      const city = String(shipping?.city ?? "").trim();
      const lockerId = String(shipping?.locker?.id ?? "").trim();

      if (!carrier) missing.push("carrier");
      if (!city) missing.push("city");
      if (!lockerId) missing.push("postMachine");

      if (carrier && city && lockerId) {
        const valid = isLockerValid(country, carrier, city, lockerId);
        if (!valid) {
          return NextResponse.json(
            { error: "INVALID_LOCKER", fields: ["postMachine"] },
            { status: 400 }
          );
        }
        const found = findLockerById(country, carrier, lockerId);
        locker = found
          ? {
              id: found.id,
              name: found.name,
              address: found.address,
              postalCode: found.postalCode
            }
          : { id: lockerId };
      }

      payload.shipping = {
        country,
        carrier: carrier || undefined,
        city,
        locker
      };
    }

    if (missing.length > 0) {
      return NextResponse.json({ error: "MISSING_FIELDS", fields: missing }, { status: 400 });
    }

    const orderId = `CUSTOM-${Date.now()}`;
    const date = new Date().toISOString();

    const shippingForLog: CustomOrderInput["shipping"] =
      deliveryMethod === "shipping"
        ? {
            country: payload.shipping?.country,
            carrier: payload.shipping?.carrier,
            city: payload.shipping?.city,
            locker: locker ? { ...locker } : undefined
          }
        : undefined;

    const row = buildCustomOrderRow({
      orderId,
      date,
      name,
      email,
      colors,
      quantity,
      notes,
      deliveryMethod,
      shipping: shippingForLog
    });

    const result = await appendCustomOrderRow(row);
    if (result.skipped) {
      return NextResponse.json({ error: "SHEETS_NOT_CONFIGURED" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (error) {
    console.error("Custom order submit failed", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
