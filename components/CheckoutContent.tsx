"use client";

import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPrice } from "@/lib/utils";
import { colorOptions, packagingOptions, products, sizeOptions } from "@/lib/products";
import PayPalCheckoutForm from "@/components/PayPalCheckoutForm";
import { getShipping } from "@/lib/shipping";
import type { DeliveryMethod, LockerCarrier, LockerCountry } from "@/lib/shipping";
import type { ParcelLocker } from "@/data/lockers";
import { useEffect, useMemo, useState } from "react";

export default function CheckoutContent() {
  const { items, subtotal } = useCart();
  const { t, lang } = useLanguage();
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    shipping: {
      method: "pickup" as DeliveryMethod,
      country: "LT" as LockerCountry,
      carrier: "" as LockerCarrier,
      city: "",
      locker: null as ParcelLocker | null
    }
  });
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string;
    clientToken?: string | null;
    enabled?: boolean;
  } | null>(null);
  const [paypalConfigError, setPaypalConfigError] = useState(false);
  const addOnsTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.options.light) {
          return sum + 2 * item.quantity;
        }
        return sum;
      }, 0),
    [items]
  );

  const shipping = useMemo(
    () =>
      getShipping({
        method: checkoutDetails.shipping.method,
        country: checkoutDetails.shipping.country,
        carrier: checkoutDetails.shipping.carrier
      }),
    [checkoutDetails.shipping.method, checkoutDetails.shipping.country, checkoutDetails.shipping.carrier]
  );

  const baseSubtotal = subtotal - addOnsTotal;
  const taxBase = subtotal + shipping.cost;
  const tax = useMemo(() => Number((taxBase * 0.03).toFixed(2)), [taxBase]);
  const total = subtotal + shipping.cost + tax;

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/payment-success?amount=${total.toFixed(2)}`
      : "";

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/paypal/config");
        const data = await response.json();
        if (!response.ok || !data?.clientId) {
          throw new Error("PayPal not configured");
        }
        if (active) {
          setPaypalConfig({
            clientId: data.clientId ?? "",
            clientToken: data.clientToken ?? null,
            enabled: Boolean(data.enabled)
          });
        }
      } catch (error: any) {
        if (active) {
          setPaypalConfigError(true);
          setPaypalConfig({
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
            clientToken: null,
            enabled: false
          });
        }
        if (process.env.NODE_ENV !== "production") {
          console.warn(error?.message || "PayPal config unavailable");
        }
      }
    };
    loadConfig();
    return () => {
      active = false;
    };
  }, []);

  const paypalClientId =
    paypalConfig?.clientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const paypalEnabled = Boolean(paypalClientId) && Boolean(paypalConfig?.enabled) && !paypalConfigError;

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-14 md:px-6">
        <h1 className="text-3xl font-semibold text-ink">{t("checkout.title")}</h1>
        <p className="mt-4 text-sm text-ink/70">{t("cart.empty")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{t("checkout.title")}</h1>
          <p className="mt-2 text-sm text-ink/70">{t("checkout.intro")}</p>
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink">{t("checkout.payment")}</h2>
            <div className="mt-4">
              <PayPalCheckoutForm
                items={items}
                subtotal={subtotal}
                returnUrl={returnUrl}
                paypalClientId={paypalClientId}
                paypalClientToken={paypalConfig?.clientToken ?? null}
                paypalEnabled={paypalEnabled}
                checkoutDetails={checkoutDetails}
                onChangeCheckoutDetails={(next) => setCheckoutDetails(next)}
              />
            </div>
          </div>
        </div>

        <aside className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
          <h2 className="text-sm font-semibold text-ink">{t("checkout.orderSummary")}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {items.map((item) => {
              const product = products.find((productItem) => productItem.slug === item.productSlug);
              const productName = product?.name[lang] ?? item.name;
              return (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{productName}</p>
                  <p className="text-xs text-ink/60">
                    {[
                      colorOptions.find((opt) => opt.key === item.options.color)?.label[lang] ?? item.options.color,
                      sizeOptions.find((opt) => opt.key === item.options.size)?.label[lang] ?? item.options.size,
                      packagingOptions.find((opt) => opt.key === item.options.packaging)?.label[lang] ??
                        item.options.packaging,
                      item.options.light ? t("product.light") : null
                    ]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                  <p className="text-xs text-ink/50">
                    {t("product.qty")} {item.quantity}
                  </p>
                  </div>
                  <p className="font-semibold text-ink">{formatPrice(item.price * item.quantity)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-black/5 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink/70">{t("cart.subtotal")}</span>
              <span className="font-semibold text-ink">{formatPrice(baseSubtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-ink/70">
              <span>{t("checkout.addOns")}</span>
              <span>{formatPrice(addOnsTotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-ink/70">
              <span>{t("checkout.shipping")}</span>
              <span>{formatPrice(shipping.cost)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-ink/70">
              <span>{t("checkout.tax")}</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-base font-semibold text-ink">
              <span>{t("checkout.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="mt-2 text-xs text-ink/60">{t("cart.shippingNote")}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
