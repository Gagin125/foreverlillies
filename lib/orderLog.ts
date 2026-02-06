import { products } from "@/lib/products";

export type CheckoutShipping = {
  method: "pickup" | "locker";
  country: "LT" | "PL" | "";
  carrier: "omniva" | "dpd" | "";
  city: string;
  locker?: {
    id: string;
    name?: string;
    address?: string;
    postalCode?: string;
  } | null;
};

export type CheckoutDetailsInput = {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  shipping?: CheckoutShipping;
};

export type CartItemInput = {
  productSlug: string;
  quantity: number;
  options?: {
    color?: string;
    size?: string;
    packaging?: string;
    light?: boolean;
    giftMessage?: string;
  };
};

const splitName = (name: string | undefined) => {
  if (!name) return { first: "", last: "" };
  const parts = name.trim().split(/\s+/);
  const first = parts.shift() ?? "";
  const last = parts.join(" ");
  return { first, last };
};

const getProductName = (slug: string) =>
  products.find((product) => product.slug === slug)?.name.en ?? slug;

export const buildItemsSummary = (items: CartItemInput[]) => {
  return items
    .map((item) => {
      const qty = Number(item.quantity || 0);
      const name = getProductName(item.productSlug);
      const options: string[] = [];
      if (item.options?.color) options.push(`color:${item.options.color}`);
      if (item.options?.size) options.push(`size:${item.options.size}`);
      if (item.options?.packaging) options.push(`packaging:${item.options.packaging}`);
      if (item.options?.light) options.push("light");
      if (item.options?.giftMessage) options.push("gift message");
      const optionText = options.length ? ` (${options.join(", ")})` : "";
      return `${name}${optionText} x${qty}`;
    })
    .join("; ");
};

export const buildOrderRow = (input: {
  orderId: string;
  date: string;
  details: CheckoutDetailsInput;
  itemsSummary: string;
  subtotal: string;
  shippingCost: string;
  tax: string;
  total: string;
  paymentStatus: string;
}) => {
  const { first: splitFirst, last: splitLast } = splitName(input.details.name);
  const first = input.details.name ?? splitFirst;
  const last = input.details.lastName ?? splitLast;
  const shipping = input.details.shipping;
  const locker = shipping?.locker;

  return [
    "Order",
    input.orderId,
    input.date,
    first,
    last,
    input.details.email ?? "",
    input.details.phone ?? "",
    shipping?.method === "locker" ? "Delivery" : "Pickup",
    shipping?.country ?? "",
    shipping?.carrier ?? "",
    shipping?.city ?? "",
    locker?.name || locker?.id || "",
    input.itemsSummary,
    input.subtotal,
    input.shippingCost,
    input.tax,
    input.total,
    input.paymentStatus
  ];
};

export type CustomOrderInput = {
  orderId: string;
  date: string;
  name: string;
  email: string;
  colors?: string;
  quantity?: number;
  notes?: string;
  deliveryMethod: "pickup" | "shipping";
  shipping?: {
    country?: "LT" | "PL";
    carrier?: "omniva" | "dpd";
    city?: string;
    locker?: {
      id: string;
      name?: string;
      address?: string;
      postalCode?: string;
    } | null;
  };
};

export const buildCustomOrderRow = (input: CustomOrderInput) => {
  const { first, last } = splitName(input.name);
  const shipping = input.shipping;
  const locker = shipping?.locker;
  const qty = input.quantity ? String(input.quantity) : "";

  const itemsSummary = [
    input.colors ? `colors: ${input.colors}` : null,
    qty ? `qty: ${qty}` : null,
    input.notes ? `notes: ${input.notes}` : null
  ]
    .filter(Boolean)
    .join(" | ");

  return [
    "Custom Order",
    input.orderId,
    input.date,
    first,
    last,
    input.email,
    "",
    input.deliveryMethod === "shipping" ? "Delivery" : "Pickup",
    shipping?.country ?? "",
    shipping?.carrier ?? "",
    shipping?.city ?? "",
    locker?.name || locker?.id || "",
    itemsSummary,
    "",
    "",
    "",
    "",
    "Requested"
  ];
};
