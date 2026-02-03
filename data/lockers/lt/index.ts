// TODO: Replace the sample lists with the full Omniva/DPD LT locker datasets.
// Keep the JSON shape aligned with ParcelLocker and the file names intact.

import omnivaData from "./omniva.json";
import dpdData from "./dpd.json";

export type ParcelLocker = {
  id: string;
  carrier: "omniva" | "dpd";
  country: "LT";
  city: string;
  name: string;
  address: string;
  postalCode?: string;
};

const omnivaLockers = omnivaData as ParcelLocker[];
const dpdLockers = dpdData as ParcelLocker[];

export const getLockersByCarrier = (carrier: ParcelLocker["carrier"]) =>
  carrier === "omniva" ? omnivaLockers : dpdLockers;

export const getCitiesByCarrier = (carrier: ParcelLocker["carrier"]) => {
  const lockers = getLockersByCarrier(carrier);
  const cities = Array.from(new Set(lockers.map((locker) => locker.city)));
  return cities.sort((a, b) => a.localeCompare(b, "lt"));
};

export const searchLockers = (input: {
  carrier: ParcelLocker["carrier"];
  city: string;
  query: string;
  limit?: number;
}) => {
  const { carrier, city, query, limit = 50 } = input;
  if (!carrier || !city) return [] as ParcelLocker[];

  const base = getLockersByCarrier(carrier).filter((locker) => locker.city === city);
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return base.slice(0, limit);

  return base
    .filter((locker) => {
      const haystack = `${locker.name} ${locker.address} ${locker.postalCode ?? ""} ${locker.id}`.toLowerCase();
      return haystack.includes(trimmed);
    })
    .slice(0, limit);
};

export const findLockerById = (carrier: ParcelLocker["carrier"], id: string) =>
  getLockersByCarrier(carrier).find((locker) => locker.id === id);

export const isLockerValid = (carrier: ParcelLocker["carrier"], city: string, id: string) => {
  const locker = findLockerById(carrier, id);
  return Boolean(locker && locker.city === city);
};
