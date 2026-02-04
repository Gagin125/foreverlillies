export type DeliveryMethod = "pickup" | "locker";
export type LockerCountry = "LT" | "PL" | "";
export type LockerCarrier = "omniva" | "dpd" | "";

type ShippingResult = {
  cost: number;
  eta?: string;
  note?: string;
};

const LT_LOCKER_COST = 3;
const PL_LOCKER_COST = 7;

export const getShipping = (input: {
  method: DeliveryMethod;
  country: LockerCountry;
  carrier: LockerCarrier;
}): ShippingResult => {
  if (input.method === "pickup") {
    return { cost: 0, note: "Pickup" };
  }

  if (input.country === "LT") {
    return { cost: LT_LOCKER_COST };
  }

  if (input.country === "PL") {
    return { cost: PL_LOCKER_COST };
  }

  return { cost: 0 };
};
