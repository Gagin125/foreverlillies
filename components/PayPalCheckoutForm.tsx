"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import Image from "next/image";
import type { CartItem } from "@/components/CartProvider";
import { getShipping } from "@/lib/shipping";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getCitiesByCarrier,
  getCarriersByCountry,
  searchLockers,
  type ParcelLocker
} from "@/data/lockers";

type MethodKey = "card" | "paypal" | "apple" | "google";

type PayPalCheckoutFormProps = {
  items: CartItem[];
  subtotal: number;
  returnUrl: string;
  paypalEnabled: boolean;
  paypalClientId?: string;
  paypalClientToken?: string | null;
  checkoutDetails: {
    name: string;
    email: string;
    phone: string;
    shipping: {
      method: "pickup" | "locker";
      country: "LT" | "PL" | "";
      carrier: "omniva" | "dpd" | "";
      city: string;
      locker: ParcelLocker | null;
    };
  };
  onChangeCheckoutDetails: (next: {
    name: string;
    email: string;
    phone: string;
    shipping: {
      method: "pickup" | "locker";
      country: "LT" | "PL" | "";
      carrier: "omniva" | "dpd" | "";
      city: string;
      locker: ParcelLocker | null;
    };
  }) => void;
};

export default function PayPalCheckoutForm(props: PayPalCheckoutFormProps) {
  const { paypalClientId, paypalClientToken } = props;
  const hasClientId = Boolean(paypalClientId);

  useEffect(() => {
    if (!hasClientId) {
      console.error("PayPal not configured: NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing.");
    }
  }, [hasClientId]);

  if (!hasClientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        PayPal not configured. Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to `.env.local` and restart the dev server.
      </div>
    );
  }

  const options: Record<string, string> = {
    clientId: paypalClientId as string,
    currency: "EUR",
    intent: "capture",
    components: "buttons,card-fields"
  };

  if (paypalClientToken) {
    options.dataClientToken = paypalClientToken;
  }

  return (
    <PayPalScriptProvider options={options}>
      <PayPalCheckoutFormInner {...props} />
    </PayPalScriptProvider>
  );
}

function PayPalCheckoutFormInner({
  items,
  subtotal,
  returnUrl,
  paypalEnabled,
  checkoutDetails,
  onChangeCheckoutDetails
}: PayPalCheckoutFormProps) {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<MethodKey>("card");
  const [{ isResolved, isPending, isRejected }] = usePayPalScriptReducer();
  const sdkReady = isResolved;
  const sdkFailed = isRejected;
  const [cardEligible, setCardEligible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [touchedPay, setTouchedPay] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [lockerQuery, setLockerQuery] = useState("");
  const [lockerResults, setLockerResults] = useState<ParcelLocker[]>([]);
  const shippingInfo = getShipping({
    method: checkoutDetails.shipping.method,
    country: checkoutDetails.shipping.country,
    carrier: checkoutDetails.shipping.carrier
  });
  const paypalAvailable = paypalEnabled && sdkReady && !sdkFailed;
  const applePayEnabled = false;
  const googlePayEnabled = false;
  const totalAmount = useMemo(() => (subtotal + shippingInfo.cost).toFixed(2), [subtotal, shippingInfo.cost]);

  const itemsRef = useRef(items);
  const detailsRef = useRef(checkoutDetails);
  const cardFieldsRef = useRef<any>(null);

  const availableCities = useMemo(() => {
    if (!checkoutDetails.shipping.country) return [];
    if (!checkoutDetails.shipping.carrier) return [];
    return getCitiesByCarrier(checkoutDetails.shipping.country, checkoutDetails.shipping.carrier);
  }, [checkoutDetails.shipping.carrier, checkoutDetails.shipping.country]);

  const availableCarriers = useMemo(() => {
    if (!checkoutDetails.shipping.country) return [];
    return getCarriersByCountry(checkoutDetails.shipping.country).map((carrier) => ({
      value: carrier,
      label: carrier === "omniva" ? "Omniva" : "DPD"
    }));
  }, [checkoutDetails.shipping.country]);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return availableCities;
    const q = cityQuery.trim().toLowerCase();
    return availableCities.filter((city) => city.toLowerCase().includes(q));
  }, [availableCities, cityQuery]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[lockers] cities", availableCities.length, availableCities.slice(0, 20));
    }
  }, [availableCities]);

  useEffect(() => {
    if (!checkoutDetails.shipping.country || !checkoutDetails.shipping.carrier || !checkoutDetails.shipping.city) {
      setLockerResults([]);
      return;
    }
    const handle = setTimeout(() => {
      const country = checkoutDetails.shipping.country as "LT" | "PL";
      setLockerResults(
        searchLockers({
          country,
          carrier: checkoutDetails.shipping.carrier as "omniva" | "dpd",
          city: checkoutDetails.shipping.city ?? "",
          query: lockerQuery,
          limit: 50
        })
      );
    }, 180);
    return () => clearTimeout(handle);
  }, [checkoutDetails.shipping.carrier, checkoutDetails.shipping.city, lockerQuery]);

  useEffect(() => {
    setLockerQuery("");
  }, [checkoutDetails.shipping.carrier, checkoutDetails.shipping.city]);

  useEffect(() => {
    setCityQuery("");
  }, [checkoutDetails.shipping.carrier]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    detailsRef.current = checkoutDetails;
  }, [checkoutDetails]);

  const validateDetails = useCallback(() => {
    const details = detailsRef.current;
    const fields: string[] = [];
    if (!details.name) fields.push("name");
    if (!details.email) fields.push("email");
    if (!details.phone) fields.push("phone");
    if (!details.shipping?.method) fields.push("deliveryMethod");
    if (details.shipping?.method === "locker") {
      if (!details.shipping.country) fields.push("country");
      if (!details.shipping.carrier) fields.push("carrier");
      if (!details.shipping.city) fields.push("city");
      if (!details.shipping.locker?.id) fields.push("locker");
    }
    setMissingFields(fields);
    return fields;
  }, []);

  const createOrder = useCallback(async () => {
    const fields = validateDetails();
    if (fields.length > 0) {
      setTouchedPay(true);
      setError(t("checkout.missingFields"));
      throw new Error("MISSING_FIELDS");
    }
    const response = await fetch("/api/paypal/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: itemsRef.current, checkoutDetails: detailsRef.current })
    });
    const data = await response.json();
    if (!response.ok) {
      if (data?.error === "MISSING_FIELDS") {
        setMissingFields(Array.isArray(data.fields) ? data.fields : []);
        setTouchedPay(true);
        setError(t("checkout.missingFields"));
      } else if (data?.error === "INVALID_LOCKER") {
        setMissingFields(Array.isArray(data.fields) ? data.fields : ["locker"]);
        setTouchedPay(true);
        setError(t("checkout.lockerRequired"));
      }
      throw new Error(data.error || "Unable to create order");
    }
    return data.orderId as string;
  }, [checkoutDetails, validateDetails]);

  const captureOrder = useCallback(async (orderId: string) => {
    const response = await fetch("/api/paypal/order/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to capture payment");
    }
    return data;
  }, []);

  const createSimpleOrder = useCallback(async () => {
    const fields = validateDetails();
    if (fields.length > 0) {
      setTouchedPay(true);
      setError(t("checkout.missingFields"));
      throw new Error("MISSING_FIELDS");
    }
    const response = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount, currency: "EUR" })
    });
    const data = await response.json();
    if (!response.ok || !data?.id) {
      throw new Error(data?.error || "Unable to create PayPal order");
    }
    return data.id as string;
  }, [totalAmount, t, validateDetails]);

  const captureSimpleOrder = useCallback(async (orderID: string) => {
    const response = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Unable to capture PayPal order");
    }
    return data;
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal) return;

    const paypal = (window as any).paypal;

    if (!cardFieldsRef.current && paypal.CardFields) {
      const cardFields = paypal.CardFields({
        createOrder,
        onApprove: async (data: any) => {
          try {
            setIsLoading(true);
            setError(null);
            await captureOrder(data.orderID);
            setSuccess(true);
            if (returnUrl) window.location.href = returnUrl;
          } catch (err: any) {
            setError(err.message || "Payment failed");
          } finally {
            setIsLoading(false);
          }
        },
        onError: (err: any) => {
          setError(err?.message || "Payment failed");
        }
      });

      if (cardFields.isEligible()) {
        cardFields.NumberField().render("#pp-card-number");
        cardFields.ExpiryField().render("#pp-card-expiry");
        cardFields.CVVField().render("#pp-card-cvv");
        if (typeof cardFields.NameField === "function") {
          cardFields.NameField().render("#pp-card-name");
        }
        cardFieldsRef.current = cardFields;
        setCardEligible(true);
      } else {
        setCardEligible(false);
      }
    } else if (!paypal.CardFields) {
      setCardEligible(false);
    }
  }, [sdkReady, createOrder, captureOrder, returnUrl]);

  const handleCardSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouchedPay(true);
    const fields = validateDetails();
    if (fields.length > 0) {
      setError(t("checkout.missingFields"));
      return;
    }
    if (!cardFieldsRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      await cardFieldsRef.current.submit();
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!touchedPay) return;
    validateDetails();
  }, [checkoutDetails, touchedPay, validateDetails]);

  const requiredMissing = [
    checkoutDetails.name ? null : "name",
    checkoutDetails.email ? null : "email",
    checkoutDetails.phone ? null : "phone",
    checkoutDetails.shipping.method ? null : "deliveryMethod",
    checkoutDetails.shipping.method === "locker" && !checkoutDetails.shipping.country ? "country" : null,
    checkoutDetails.shipping.method === "locker" && !checkoutDetails.shipping.carrier ? "carrier" : null,
    checkoutDetails.shipping.method === "locker" && !checkoutDetails.shipping.city ? "city" : null,
    checkoutDetails.shipping.method === "locker" && !checkoutDetails.shipping.locker?.id ? "locker" : null
  ].filter(Boolean);

  const isFormValid = requiredMissing.length === 0;
  const isPaymentBlocked = !isFormValid;
  const updateShipping = (patch: Partial<typeof checkoutDetails.shipping>) => {
    onChangeCheckoutDetails({
      ...checkoutDetails,
      shipping: {
        ...checkoutDetails.shipping,
        ...patch
      }
    });
  };

  const handleCountryChange = (value: "LT" | "PL" | "") => {
    updateShipping({
      country: value,
      carrier: "",
      city: "",
      locker: null
    });
    setMissingFields((prev) => prev.filter((field) => !["country", "carrier", "city", "locker"].includes(field)));
    setCityQuery("");
    setLockerQuery("");
  };
  const handleCarrierChange = (value: "omniva" | "dpd" | "") => {
    updateShipping({
      carrier: value,
      city: "",
      locker: null
    });
    setMissingFields((prev) => prev.filter((field) => !["carrier", "city", "locker"].includes(field)));
  };
  const hasCountry = Boolean(checkoutDetails.shipping.country);
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white px-4 py-4">
        <h3 className="text-sm font-semibold text-ink">{t("checkout.customerDetails")}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-[12px] font-semibold text-ink/70">{t("checkout.name")}</label>
            <input
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink"
              value={checkoutDetails.name}
              onChange={(e) => onChangeCheckoutDetails({ ...checkoutDetails, name: e.target.value })}
            />
            {touchedPay && missingFields.includes("name") && (
              <p className="mt-1 text-xs text-cherry">{t("checkout.required")}</p>
            )}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-ink/70">{t("checkout.email")}</label>
            <input
              type="email"
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink"
              value={checkoutDetails.email}
              onChange={(e) => onChangeCheckoutDetails({ ...checkoutDetails, email: e.target.value })}
            />
            {touchedPay && missingFields.includes("email") && (
              <p className="mt-1 text-xs text-cherry">{t("checkout.required")}</p>
            )}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-ink/70">{t("checkout.phone")}</label>
            <input
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink"
              value={checkoutDetails.phone}
              onChange={(e) => onChangeCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
            />
            {touchedPay && missingFields.includes("phone") && (
              <p className="mt-1 text-xs text-cherry">{t("checkout.required")}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white px-4 py-4">
        <h3 className="text-sm font-semibold text-ink">{t("checkout.deliveryMethod")}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              updateShipping({
                method: "pickup",
                carrier: "",
                city: "",
                locker: null
              })
            }
            className={`rounded-xl border px-3 py-3 text-left text-sm ${
              checkoutDetails.shipping.method === "pickup" ? "border-[#C1121F]" : "border-black/10"
            }`}
          >
            <p className="font-semibold text-ink">{t("checkout.pickup")}</p>
            <p className="mt-1 text-xs text-ink/60">{t("checkout.pickupNote")}</p>
          </button>
          <button
            type="button"
            onClick={() =>
              updateShipping({
                method: "locker",
                country: "LT",
                carrier: "",
                city: "",
                locker: null
              })
            }
            className={`rounded-xl border px-3 py-3 text-left text-sm ${
              checkoutDetails.shipping.method === "locker" ? "border-[#C1121F]" : "border-black/10"
            }`}
          >
            <p className="font-semibold text-ink">{t("checkout.locker")}</p>
            <p className="mt-1 text-xs text-ink/60">{t("checkout.lockerNote")}</p>
          </button>
        </div>
        {touchedPay && missingFields.includes("deliveryMethod") && (
          <p className="mt-2 text-xs text-cherry">{t("checkout.required")}</p>
        )}

        {checkoutDetails.shipping.method === "locker" && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-[12px] font-semibold text-ink/70">{t("checkout.deliveryCountry")}</label>
                <select
                  className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink"
                  value={checkoutDetails.shipping.country || "LT"}
                  onChange={(e) => handleCountryChange(e.target.value as "LT" | "PL" | "")}
                >
                  <option value="LT">Lithuania</option>
                  <option value="PL">Poland</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink/70">{t("checkout.deliveryCarrier")}</label>
                <select
                  className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink"
                  value={checkoutDetails.shipping.carrier}
                  onChange={(e) => handleCarrierChange(e.target.value as "omniva" | "dpd" | "")}
                  disabled={!hasCountry}
                >
                  <option value="">{t("checkout.select")}</option>
                  {availableCarriers.map((carrier) => (
                    <option key={carrier.value} value={carrier.value}>
                      {carrier.label}
                    </option>
                  ))}
                </select>
                {touchedPay && missingFields.includes("carrier") && (
                  <p className="mt-1 text-xs text-cherry">{t("checkout.required")}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-[12px] font-semibold text-ink/70">{t("checkout.city")}</label>
                {checkoutDetails.shipping.city ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-3 py-3 text-sm text-ink">
                    <p className="font-semibold">{checkoutDetails.shipping.city}</p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-cherry"
                      onClick={() =>
                        updateShipping({
                          city: "",
                          locker: null
                        })
                      }
                    >
                      {t("checkout.change")}
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink disabled:bg-black/5"
                      placeholder={t("checkout.searchCityPlaceholder")}
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      disabled={!checkoutDetails.shipping.carrier}
                    />
                    <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-black/10 bg-white">
                      {checkoutDetails.shipping.carrier ? (
                        filteredCities.length > 0 ? (
                          <ul className="divide-y divide-black/5 text-sm">
                            {filteredCities.map((city) => (
                              <li key={city}>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left hover:bg-black/5"
                                  onClick={() =>
                                    updateShipping({
                                      city,
                                      locker: null
                                    })
                                  }
                                >
                                  {city}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.noCities")}</p>
                        )
                      ) : (
                        <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.selectCarrierFirst")}</p>
                      )}
                    </div>
                  </>
                )}
                {touchedPay && missingFields.includes("city") && (
                  <p className="mt-1 text-xs text-cherry">{t("checkout.required")}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-[12px] font-semibold text-ink/70">{t("checkout.postMachine")}</label>
                {checkoutDetails.shipping.locker ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-3 py-3 text-sm text-ink">
                    <div>
                      <p className="font-semibold">{checkoutDetails.shipping.locker.name}</p>
                      <p className="text-xs text-ink/60">
                        {checkoutDetails.shipping.locker.address}
                        {checkoutDetails.shipping.locker.postalCode
                          ? `, ${checkoutDetails.shipping.locker.postalCode}`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-cherry"
                      onClick={() => updateShipping({ locker: null })}
                    >
                      {t("checkout.change")}
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink disabled:bg-black/5"
                      placeholder={t("checkout.searchLockerPlaceholder")}
                      value={lockerQuery}
                      onChange={(e) => setLockerQuery(e.target.value)}
                      disabled={!checkoutDetails.shipping.city}
                    />
                    <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-black/10 bg-white">
                      {checkoutDetails.shipping.city ? (
                        lockerResults.length > 0 ? (
                          <ul className="divide-y divide-black/5 text-sm">
                            {lockerResults.map((locker) => (
                              <li key={locker.id}>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left hover:bg-black/5"
                                  onClick={() => {
                                    updateShipping({ locker });
                                    setLockerQuery("");
                                  }}
                                >
                                  <p className="font-semibold text-ink">{locker.name}</p>
                                  <p className="text-xs text-ink/60">
                                    {locker.address}
                                    {locker.postalCode ? `, ${locker.postalCode}` : ""}
                                  </p>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.noLockers")}</p>
                        )
                      ) : (
                        <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.selectCityFirst")}</p>
                      )}
                    </div>
                  </>
                )}
                {touchedPay && missingFields.includes("locker") && (
                  <p className="mt-1 text-xs text-cherry">{t("checkout.lockerRequired")}</p>
                )}
              </div>
              {shippingInfo.eta && (
                <p className="md:col-span-2 text-xs text-ink/60">
                  {t("checkout.eta")} {shippingInfo.eta}
                </p>
              )}
              {shippingInfo.note?.includes("TODO") && (
                <p className="md:col-span-2 text-xs text-ink/50">{shippingInfo.note}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedMethod("card")}
          aria-pressed={selectedMethod === "card"}
          className={`box-border h-[56px] w-[120px] rounded-xl border border-black/10 bg-white text-center transition hover:shadow-sm ${
            selectedMethod === "card" ? "outline outline-2 outline-[#C1121F] outline-offset-[-2px]" : ""
          }`}
        >
          <div className="flex h-full items-center justify-center">
            <Image src="/payments/card.png" alt="Card" width={54} height={28} />
            <span className="sr-only">Card</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => (paypalEnabled ? setSelectedMethod("paypal") : null)}
          aria-pressed={selectedMethod === "paypal"}
          disabled={!paypalEnabled}
          className={`box-border h-[56px] w-[120px] rounded-xl border border-black/10 bg-white text-center transition hover:shadow-sm ${
            selectedMethod === "paypal" ? "outline outline-2 outline-[#C1121F] outline-offset-[-2px]" : ""
          } ${paypalEnabled ? "" : "opacity-50"} disabled:cursor-not-allowed`}
        >
          <div className="flex h-full items-center justify-center">
            <Image src="/payments/paypal.png" alt="PayPal" width={60} height={26} />
            <span className="sr-only">PayPal</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => (googlePayEnabled ? setSelectedMethod("google") : null)}
          aria-pressed={selectedMethod === "google"}
          disabled={!googlePayEnabled}
          className={`box-border h-[56px] w-[120px] rounded-xl border border-black/10 bg-white text-center transition hover:shadow-sm ${
            selectedMethod === "google" ? "outline outline-2 outline-[#C1121F] outline-offset-[-2px]" : ""
          } ${googlePayEnabled ? "" : "opacity-50"} disabled:cursor-not-allowed`}
        >
          <div className="flex h-full items-center justify-center">
            <Image src="/payments/google-pay.png" alt="Google Pay" width={62} height={24} />
            <span className="sr-only">Google Pay</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => (applePayEnabled ? setSelectedMethod("apple") : null)}
          aria-pressed={selectedMethod === "apple"}
          disabled={!applePayEnabled}
          className={`box-border h-[56px] w-[120px] rounded-xl border border-black/10 bg-white text-center transition hover:shadow-sm ${
            selectedMethod === "apple" ? "outline outline-2 outline-[#C1121F] outline-offset-[-2px]" : ""
          } ${applePayEnabled ? "" : "opacity-50"} disabled:cursor-not-allowed`}
        >
          <div className="flex h-full items-center justify-center">
            <Image src="/payments/apple-pay.png" alt="Apple Pay" width={56} height={24} />
            <span className="sr-only">Apple Pay</span>
          </div>
        </button>
      </div>

      {error && <p className="text-xs text-cherry">{error}</p>}

      {selectedMethod === "card" && (
        <form onSubmit={handleCardSubmit} className="space-y-4">
          <div className="space-y-3 text-sm text-ink/70">
            <div>
              <p className="mb-2 text-[12px] font-semibold text-ink/70">{t("checkout.cardNumber")}</p>
              <div className="relative rounded-lg border border-black/10 bg-white px-4 py-3">
                {sdkReady && paypalEnabled ? (
                  <div id="pp-card-number" className="min-h-[20px]" />
                ) : (
                  <input
                    className="w-full text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                    placeholder="1234 1234 1234 1234"
                    disabled
                  />
                )}
                <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 gap-1">
                  <span className="rounded-md bg-black/5 px-2 py-1 text-[10px] text-ink/60">Visa</span>
                  <span className="rounded-md bg-black/5 px-2 py-1 text-[10px] text-ink/60">MC</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-2 text-[12px] font-semibold text-ink/70">{t("checkout.expiry")}</p>
                <div className="rounded-lg border border-black/10 bg-white px-4 py-3">
                  {sdkReady && paypalEnabled ? (
                    <div id="pp-card-expiry" className="min-h-[20px]" />
                  ) : (
                    <input
                      className="w-full text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                      placeholder="MM / YY"
                      disabled
                    />
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-semibold text-ink/70">{t("checkout.cvc")}</p>
                <div className="rounded-lg border border-black/10 bg-white px-4 py-3">
                  {sdkReady && paypalEnabled ? (
                    <div id="pp-card-cvv" className="min-h-[20px]" />
                  ) : (
                    <input
                      className="w-full text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                      placeholder="CVC"
                      disabled
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold text-ink/70">{t("checkout.country")}</p>
              <select
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-ink"
                defaultValue="LT"
                disabled={!sdkReady || !paypalEnabled}
              >
                <option value="LT">Lithuania</option>
                <option value="LV">Latvia</option>
                <option value="EE">Estonia</option>
                <option value="PL">Poland</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !cardEligible || !paypalEnabled || !sdkReady || !isFormValid}
            className="w-full rounded-full bg-[#C1121F] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? t("checkout.processing") : t("checkout.pay")}
          </button>
        </form>
      )}

      {selectedMethod === "paypal" && (
        <div className={`space-y-3 ${isPaymentBlocked ? "pointer-events-none opacity-60" : ""}`}>
          {paypalAvailable ? (
            <PayPalButtons
              style={{ layout: "vertical", shape: "pill" }}
              disabled={isPaymentBlocked}
              forceReRender={[totalAmount, isPaymentBlocked]}
              createOrder={async () => createSimpleOrder()}
              onApprove={async (data) => {
                try {
                  setIsLoading(true);
                  setError(null);
                  await captureSimpleOrder(data.orderID);
                  setSuccess(true);
                  if (returnUrl) window.location.href = returnUrl;
                } catch (err: any) {
                  setError(err.message || "Payment failed");
                } finally {
                  setIsLoading(false);
                }
              }}
              onError={(err) => setError((err as any)?.message || "Payment failed")}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-ink/60">
              {t("checkout.paypalPlaceholder")}
            </div>
          )}
        </div>
      )}

      {selectedMethod === "apple" && (
        <div className={`space-y-3 ${isPaymentBlocked ? "pointer-events-none opacity-60" : ""}`}>
          <div className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-ink/60">
            {t("checkout.comingSoon")}
          </div>
        </div>
      )}

      {selectedMethod === "google" && (
        <div className={`space-y-3 ${isPaymentBlocked ? "pointer-events-none opacity-60" : ""}`}>
          <div className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-ink/60">
            {t("checkout.comingSoon")}
          </div>
        </div>
      )}

      {success && <p className="text-xs text-emerald-600">Payment successful.</p>}
      {paypalEnabled && isPending && !error && process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-ink/50">{t("checkout.loading")}</p>
      )}
    </div>
  );
}
