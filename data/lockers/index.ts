import * as LT from "./lt";
import * as PL from "./pl";

export type LockerCountry = "LT" | "PL";
export type LockerCarrier = "omniva" | "dpd";

export type ParcelLocker =
  | LT.ParcelLocker
  | PL.ParcelLocker;

export const getCarriersByCountry = (country: LockerCountry) => {
  if (country === "LT") return ["omniva", "dpd"] as LockerCarrier[];
  if (country === "PL") return ["dpd"] as LockerCarrier[];
  return [] as LockerCarrier[];
};

export const getCitiesByCarrier = (country: LockerCountry, carrier: LockerCarrier) => {
  if (country === "LT") return LT.getCitiesByCarrier(carrier as LT.ParcelLocker["carrier"]);
  if (country === "PL") return PL.getCitiesByCarrier(carrier as PL.ParcelLocker["carrier"]);
  return [];
};

export const searchLockers = (input: {
  country: LockerCountry;
  carrier: LockerCarrier;
  city: string;
  query: string;
  limit?: number;
}) => {
  const { country, carrier, city, query, limit } = input;
  if (country === "LT") {
    return LT.searchLockers({
      carrier: carrier as LT.ParcelLocker["carrier"],
      city,
      query,
      limit
    });
  }
  if (country === "PL") {
    return PL.searchLockers({
      carrier: carrier as PL.ParcelLocker["carrier"],
      city,
      query,
      limit
    });
  }
  return [];
};

export const findLockerById = (country: LockerCountry, carrier: LockerCarrier, id: string) => {
  if (country === "LT") return LT.findLockerById(carrier as LT.ParcelLocker["carrier"], id);
  if (country === "PL") return PL.findLockerById(carrier as PL.ParcelLocker["carrier"], id);
  return undefined;
};

export const isLockerValid = (country: LockerCountry, carrier: LockerCarrier, city: string, id: string) => {
  if (country === "LT") return LT.isLockerValid(carrier as LT.ParcelLocker["carrier"], city, id);
  if (country === "PL") return PL.isLockerValid(carrier as PL.ParcelLocker["carrier"], city, id);
  return false;
};
