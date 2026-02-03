export const formatPrice = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  }).format(value);
};

export const sanitizeText = (value: string) => {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
};

export const buildItemKey = (values: Record<string, string | number | undefined>) => {
  return Object.entries(values)
    .map(([key, val]) => `${key}:${val ?? ""}`)
    .join("|");
};
