export type DeliveryMethod = "pickup" | "locker";
export type LockerCountry = "LT" | "PL" | "";
export type LockerCarrier = "omniva" | "dpd" | "";

type ShippingResult = {
  cost: number;
  eta?: string;
  note?: string;
};

const LT_RATES: Partial<Record<Exclude<LockerCarrier, "">, { cost: number; eta: string }>> = {
  // TODO: set LT locker rates
  // omniva: { cost: 0, eta: "3–5 business days" },
  // dpd: { cost: 0, eta: "2–5 business days" }
};

export const getShipping = (input: {
  method: DeliveryMethod;
  country: LockerCountry;
  carrier: LockerCarrier;
}): ShippingResult => {
  if (input.method === "pickup") {
    return { cost: 0, note: "Pickup" };
  }

  if (input.country === "LT") {
    const rate = input.carrier ? LT_RATES[input.carrier as Exclude<LockerCarrier, "">] : undefined;
    if (rate) return { cost: rate.cost, eta: rate.eta };
    return { cost: 0, note: "TODO: set LT locker rates" };
  }

  if (input.country === "PL") {
    return { cost: 0, note: "TODO: Poland locker rates" };
  }

  return { cost: 0 };
};
