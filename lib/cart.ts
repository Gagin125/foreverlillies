import { products } from "@/lib/products";

type CartItemInput = {
  productSlug: string;
  quantity: number;
  options?: {
    light?: boolean;
  };
};

const formatAmount = (value: number) => value.toFixed(2);

export const buildCartSummary = (items: CartItemInput[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid cart");
  }

  let total = 0;
  let addOns = 0;
  const orderItems = items.map((item) => {
    const product = products.find((productItem) => productItem.slug === item.productSlug);
    const quantity = Number(item.quantity || 0);
    const light = Boolean(item?.options?.light);

    if (!product || product.basePrice <= 0 || quantity <= 0) {
      throw new Error("Invalid cart");
    }

    const unitPrice = product.basePrice + (light ? 2 : 0);
    if (light) {
      addOns += 2 * quantity;
    }
    total += unitPrice * quantity;

    return {
      name: product.name.en,
      sku: product.sku,
      quantity: String(quantity),
      unit_amount: { currency_code: "EUR" as const, value: formatAmount(unitPrice) }
    };
  });

  if (total <= 0) {
    throw new Error("Invalid cart");
  }

  return { subtotal: total, addOns, total: formatAmount(total), items: orderItems };
};
