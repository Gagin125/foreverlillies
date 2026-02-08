"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
  type ReactPayPalScriptOptions
} from "@paypal/react-paypal-js";
import Image from "next/image";
import Script from "next/script";
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
    lastName: string;
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
    lastName: string;
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

type ScriptState = {
  isResolved: boolean;
  isPending: boolean;
  isRejected: boolean;
};

export default function PayPalCheckoutForm(props: PayPalCheckoutFormProps) {
  const { paypalClientId, paypalClientToken, paypalEnabled } = props;
  const [sdkMode, setSdkMode] = useState<"full" | "basic">("full");
  const paypalReady =
    paypalEnabled && typeof paypalClientId === "string" && paypalClientId.length > 0;

  useEffect(() => {
    if (!paypalReady) {
      console.error("Payments temporarily disabled: PayPal client ID is missing.");
    }
  }, [paypalReady]);

  if (!paypalReady) {
    return (
      <PayPalCheckoutFormCore
        {...props}
        paypalReady={false}
        scriptState={{ isResolved: false, isPending: false, isRejected: true }}
        sdkMode="basic"
      />
    );
  }

  const options: ReactPayPalScriptOptions = {
    clientId: paypalClientId as string,
    currency: "EUR",
    intent: "capture",
    components:
      sdkMode === "full" ? "buttons,card-fields,applepay,googlepay" : "buttons,card-fields",
    enableFunding: sdkMode === "full" ? "applepay,googlepay" : undefined
  };

  if (paypalClientToken) {
    options.dataClientToken = paypalClientToken;
  }

  return (
    <PayPalScriptProvider key={sdkMode} options={options}>
      <Script
        src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://pay.google.com/gp/p/js/pay.js"
        strategy="afterInteractive"
      />
      <PayPalCheckoutFormWithSdk
        {...props}
        sdkMode={sdkMode}
        onScriptFailed={() => setSdkMode("basic")}
      />
    </PayPalScriptProvider>
  );
}

function PayPalCheckoutFormWithSdk(
  props: PayPalCheckoutFormProps & {
    sdkMode: "full" | "basic";
    onScriptFailed: () => void;
  }
) {
  const [scriptState] = usePayPalScriptReducer();
  return (
    <PayPalCheckoutFormCore
      {...props}
      paypalReady
      scriptState={scriptState}
      sdkMode={props.sdkMode}
      onScriptFailed={props.onScriptFailed}
    />
  );
}

function PayPalCheckoutFormCore({
  items,
  subtotal,
  returnUrl,
  paypalEnabled: paypalEnabledProp,
  checkoutDetails,
  onChangeCheckoutDetails,
  paypalReady,
  scriptState,
  sdkMode,
  onScriptFailed
}: PayPalCheckoutFormProps & {
  paypalReady: boolean;
  scriptState: ScriptState;
  sdkMode: "full" | "basic";
  onScriptFailed?: () => void;
}) {
  const { t, lang } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<MethodKey>("card");
  const { isResolved, isPending, isRejected } = scriptState;
  const sdkReady = isResolved;
  const sdkFailed = isRejected;
  const [cardEligible, setCardEligible] = useState(true);
  const [applePayEligible, setApplePayEligible] = useState(false);
  const [applePaySdkReady, setApplePaySdkReady] = useState(false);
  const [googlePayEligible, setGooglePayEligible] = useState(false);
  const [googlePaySdkReady, setGooglePaySdkReady] = useState(false);
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
  const paypalConfigured = paypalReady && paypalEnabledProp;
  const paypalEnabled = paypalConfigured;
  const paypalAvailable = paypalEnabled && sdkReady && !sdkFailed;
  const walletComponentsEnabled = sdkMode === "full";
  const cardFieldsReady = paypalEnabled && sdkReady && cardEligible;
  const applePaySelectable = walletComponentsEnabled && paypalAvailable;
  const applePayEnabled = applePaySelectable && applePayEligible;
  const googlePaySelectable = walletComponentsEnabled && paypalAvailable;
  const googlePayEnabled = googlePaySelectable && googlePayEligible;
  const fallbackTriggeredRef = useRef(false);
  const taxAmount = useMemo(
    () => Number(((subtotal + shippingInfo.cost) * 0.03).toFixed(2)),
    [subtotal, shippingInfo.cost]
  );
  const totalAmount = useMemo(
    () => (subtotal + shippingInfo.cost + taxAmount).toFixed(2),
    [subtotal, shippingInfo.cost, taxAmount]
  );

  const itemsRef = useRef(items);
  const detailsRef = useRef(checkoutDetails);
  const cardFieldsRef = useRef<any>(null);
  const applePayConfigRef = useRef<any>(null);
  const applePayButtonRef = useRef<HTMLDivElement | null>(null);
  const googlePayConfigRef = useRef<any>(null);
  const googlePayPaymentsClientRef = useRef<any>(null);
  const googlePayButtonRef = useRef<HTMLDivElement | null>(null);

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
    if (!details.lastName) fields.push("lastName");
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
      body: JSON.stringify({
        orderId,
        items: itemsRef.current,
        checkoutDetails: detailsRef.current
      })
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
      body: JSON.stringify({
        orderID,
        items: itemsRef.current,
        checkoutDetails: detailsRef.current
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Unable to capture PayPal order");
    }
    return data;
  }, []);

  useEffect(() => {
    if (sdkFailed && sdkMode === "full" && onScriptFailed && !fallbackTriggeredRef.current) {
      fallbackTriggeredRef.current = true;
      onScriptFailed();
    }
  }, [sdkFailed, sdkMode, onScriptFailed]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).ApplePaySession) {
      setApplePaySdkReady(true);
      return;
    }
    const interval = setInterval(() => {
      if ((window as any).ApplePaySession) {
        setApplePaySdkReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!paypalAvailable || !window.paypal) {
      applePayConfigRef.current = null;
      setApplePayEligible(false);
      return;
    }

    const paypal = (window as any).paypal;
    const ApplePaySession = (window as any).ApplePaySession;
    if (!applePaySdkReady || !ApplePaySession || !paypal?.Applepay) {
      applePayConfigRef.current = null;
      setApplePayEligible(false);
      return;
    }
    if (!ApplePaySession.canMakePayments()) {
      applePayConfigRef.current = null;
      setApplePayEligible(false);
      return;
    }

    paypal
      .Applepay()
      .config()
      .then((config: any) => {
        applePayConfigRef.current = config;
        setApplePayEligible(Boolean(config?.isEligible));
      })
      .catch(() => {
        applePayConfigRef.current = null;
        setApplePayEligible(false);
      });
  }, [applePaySdkReady, paypalAvailable]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.payments?.api) {
      setGooglePaySdkReady(true);
      return;
    }
    const interval = setInterval(() => {
      if ((window as any).google?.payments?.api) {
        setGooglePaySdkReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleGooglePayAuthorized = useCallback(
    async (paymentData: any) => {
      try {
        setIsLoading(true);
        setError(null);
        const orderId = await createSimpleOrder();
        const paypal = (window as any).paypal;
        const confirm = await paypal.Googlepay().confirmOrder({
          orderId,
          paymentMethodData: paymentData?.paymentMethodData
        });

        if (confirm?.status === "PAYER_ACTION_REQUIRED") {
          await paypal.Googlepay().initiatePayerAction({ orderId });
        }

        await captureSimpleOrder(orderId);
        setSuccess(true);
        if (returnUrl) window.location.href = returnUrl;
        return { transactionState: "SUCCESS" };
      } catch (err: any) {
        setError(err?.message || "Payment failed");
        return {
          transactionState: "ERROR",
          error: {
            intent: "PAYMENT_AUTHORIZATION",
            message: err?.message || "Payment failed"
          }
        };
      } finally {
        setIsLoading(false);
      }
    },
    [captureSimpleOrder, createSimpleOrder, returnUrl]
  );

  useEffect(() => {
    if (!googlePaySelectable || !googlePaySdkReady || !window.paypal) {
      googlePayConfigRef.current = null;
      googlePayPaymentsClientRef.current = null;
      setGooglePayEligible(false);
      return;
    }

    const paypal = (window as any).paypal;
    const googleApi = (window as any).google?.payments?.api;
    if (!paypal?.Googlepay || !googleApi) {
      googlePayConfigRef.current = null;
      googlePayPaymentsClientRef.current = null;
      setGooglePayEligible(false);
      return;
    }

    const paymentsClient =
      googlePayPaymentsClientRef.current ??
      new googleApi.PaymentsClient({
        environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
        paymentDataCallbacks: {
          onPaymentAuthorized: handleGooglePayAuthorized
        }
      });

    googlePayPaymentsClientRef.current = paymentsClient;

    paypal
      .Googlepay()
      .config()
      .then((config: any) => {
        googlePayConfigRef.current = config;
        return paymentsClient.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: config.allowedPaymentMethods
        });
      })
      .then((response: any) => {
        setGooglePayEligible(Boolean(response?.result));
      })
      .catch(() => {
        googlePayConfigRef.current = null;
        setGooglePayEligible(false);
      });
  }, [googlePaySelectable, googlePaySdkReady, handleGooglePayAuthorized]);

  const handleCardSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouchedPay(true);
    const fields = validateDetails();
    if (fields.length > 0) {
      setError(t("checkout.missingFields"));
      return;
    }
    if (!paypalConfigured || !sdkReady || !cardFieldsRef.current) {
      setError("Payments are not configured yet.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await cardFieldsRef.current.submit();
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setIsLoading(false);
    }
  };

  const startApplePay = useCallback(async () => {
    setTouchedPay(true);
    const fields = validateDetails();
    if (fields.length > 0) {
      setError(t("checkout.missingFields"));
      return;
    }
    if (!applePayEnabled || !applePayConfigRef.current) {
      setError(t("checkout.applePayUnavailable"));
      return;
    }

    const paypal = (window as any).paypal;
    const ApplePaySession = (window as any).ApplePaySession;
    if (!paypal?.Applepay || !ApplePaySession) {
      setError(t("checkout.applePayUnavailable"));
      return;
    }

    const config = applePayConfigRef.current;
    const currencyCode = config.currencyCode || "EUR";
    const paymentRequest = {
      countryCode: config.countryCode,
      merchantCapabilities: config.merchantCapabilities,
      supportedNetworks: config.supportedNetworks,
      currencyCode,
      total: {
        label: "Forever Lilies",
        type: "final",
        amount: totalAmount
      },
      lineItems: [
        { label: t("cart.subtotal"), amount: Number(subtotal).toFixed(2) },
        { label: t("checkout.shipping"), amount: shippingInfo.cost.toFixed(2) },
        { label: t("checkout.tax"), amount: taxAmount.toFixed(2) }
      ]
    };

    const session = new ApplePaySession(4, paymentRequest);

    session.onvalidatemerchant = async (event: any) => {
      try {
        const validation = await paypal.Applepay().validateMerchant({
          validationUrl: event.validationURL,
          displayName: "Forever Lilies"
        });
        session.completeMerchantValidation(validation.merchantSession);
      } catch (err: any) {
        setError(err?.message || "Apple Pay validation failed");
        session.abort();
      }
    };

    session.onpaymentauthorized = async (event: any) => {
      try {
        setIsLoading(true);
        setError(null);
        const orderId = await createSimpleOrder();
        await paypal.Applepay().confirmOrder({
          orderId,
          token: event.payment.token,
          billingContact: event.payment.billingContact
        });
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
        await captureSimpleOrder(orderId);
        setSuccess(true);
        if (returnUrl) window.location.href = returnUrl;
      } catch (err: any) {
        session.completePayment(ApplePaySession.STATUS_FAILURE);
        setError(err?.message || "Payment failed");
      } finally {
        setIsLoading(false);
      }
    };

    session.oncancel = () => {
      setIsLoading(false);
    };

    session.begin();
  }, [
    applePayEnabled,
    createSimpleOrder,
    captureSimpleOrder,
    returnUrl,
    shippingInfo.cost,
    subtotal,
    t,
    taxAmount,
    totalAmount,
    validateDetails
  ]);

  useEffect(() => {
    const container = applePayButtonRef.current;
    if (!container) return;

    container.innerHTML = "";
    if (!applePayEnabled) return;

    const button = document.createElement("apple-pay-button");
    button.setAttribute("buttonstyle", "black");
    button.setAttribute("type", "buy");
    button.setAttribute("locale", lang === "lt" ? "lt-LT" : "en-US");
    button.style.width = "100%";
    button.style.height = "44px";

    const handleClick = () => startApplePay();
    button.addEventListener("click", handleClick);
    container.appendChild(button);

    return () => {
      button.removeEventListener("click", handleClick);
      if (container.contains(button)) {
        container.removeChild(button);
      }
    };
  }, [applePayEnabled, lang, startApplePay]);

  const startGooglePay = useCallback(async () => {
    setTouchedPay(true);
    const fields = validateDetails();
    if (fields.length > 0) {
      setError(t("checkout.missingFields"));
      return;
    }
    if (!googlePayEnabled || !googlePayPaymentsClientRef.current || !googlePayConfigRef.current) {
      setError(t("checkout.googlePayUnavailable"));
      return;
    }

    const config = googlePayConfigRef.current;
    try {
      await googlePayPaymentsClientRef.current.loadPaymentData({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: config.allowedPaymentMethods,
        merchantInfo: config.merchantInfo,
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: totalAmount,
          currencyCode: config.currencyCode || "EUR"
        },
        callbackIntents: ["PAYMENT_AUTHORIZATION"]
      });
    } catch (err: any) {
      if (err?.statusCode === "CANCELED") return;
      setError(err?.message || "Payment failed");
      setIsLoading(false);
    }
  }, [googlePayEnabled, totalAmount, t, validateDetails]);

  useEffect(() => {
    const container = googlePayButtonRef.current;
    if (!container) return;

    container.innerHTML = "";
    if (!googlePayEnabled || !googlePayPaymentsClientRef.current) return;

    const button = googlePayPaymentsClientRef.current.createButton({
      buttonColor: "black",
      buttonType: "buy",
      onClick: startGooglePay
    });

    container.appendChild(button);

    return () => {
      if (container.contains(button)) {
        container.removeChild(button);
      }
    };
  }, [googlePayEnabled, startGooglePay]);

  useEffect(() => {
    if (!touchedPay) return;
    validateDetails();
  }, [checkoutDetails, touchedPay, validateDetails]);

  const requiredMissing = [
    checkoutDetails.name ? null : "name",
    checkoutDetails.lastName ? null : "lastName",
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
            <label className="text-[12px] font-semibold text-ink/70">{t("checkout.lastName")}</label>
            <input
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink"
              value={checkoutDetails.lastName}
              onChange={(e) => onChangeCheckoutDetails({ ...checkoutDetails, lastName: e.target.value })}
            />
            {touchedPay && missingFields.includes("lastName") && (
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
          onClick={() => (googlePaySelectable ? setSelectedMethod("google") : null)}
          aria-pressed={selectedMethod === "google"}
          disabled={!googlePaySelectable}
          className={`box-border h-[56px] w-[120px] rounded-xl border border-black/10 bg-white text-center transition hover:shadow-sm ${
            selectedMethod === "google" ? "outline outline-2 outline-[#C1121F] outline-offset-[-2px]" : ""
          } ${googlePaySelectable ? "" : "opacity-50"} disabled:cursor-not-allowed`}
        >
          <div className="flex h-full items-center justify-center">
            <Image src="/payments/google-pay.png" alt="Google Pay" width={62} height={24} />
            <span className="sr-only">Google Pay</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => (applePaySelectable ? setSelectedMethod("apple") : null)}
          aria-pressed={selectedMethod === "apple"}
          disabled={!applePaySelectable}
          className={`box-border h-[56px] w-[120px] rounded-xl border border-black/10 bg-white text-center transition hover:shadow-sm ${
            selectedMethod === "apple" ? "outline outline-2 outline-[#C1121F] outline-offset-[-2px]" : ""
          } ${applePaySelectable ? "" : "opacity-50"} disabled:cursor-not-allowed`}
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
                {cardFieldsReady ? (
                  <div id="pp-card-number" className="min-h-[20px]" />
                ) : (
                  <input
                    className="w-full text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                    placeholder="1234 1234 1234 1234"
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
                  {cardFieldsReady ? (
                    <div id="pp-card-expiry" className="min-h-[20px]" />
                  ) : (
                    <input
                      className="w-full text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                      placeholder="MM / YY"
                    />
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-semibold text-ink/70">{t("checkout.cvc")}</p>
                <div className="rounded-lg border border-black/10 bg-white px-4 py-3">
                  {cardFieldsReady ? (
                    <div id="pp-card-cvv" className="min-h-[20px]" />
                  ) : (
                    <input
                      className="w-full text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                      placeholder="CVC"
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
              >
                <option value="LT">Lithuania</option>
                <option value="PL">Poland</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid || (paypalConfigured ? !cardEligible || !sdkReady : false)}
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
          {applePayEnabled ? (
            <div
              ref={applePayButtonRef}
              className="rounded-xl border border-black/10 bg-white px-4 py-4"
            />
          ) : (
            <div className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-ink/60">
              {t("checkout.applePayUnavailable")}
            </div>
          )}
        </div>
      )}

      {selectedMethod === "google" && (
        <div className={`space-y-3 ${isPaymentBlocked ? "pointer-events-none opacity-60" : ""}`}>
          {googlePayEnabled ? (
            <div
              ref={googlePayButtonRef}
              className="rounded-xl border border-black/10 bg-white px-4 py-4"
            />
          ) : (
            <div className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-ink/60">
              {t("checkout.googlePayUnavailable")}
            </div>
          )}
        </div>
      )}

      {success && <p className="text-xs text-emerald-600">Payment successful.</p>}
      {paypalEnabled && isPending && !error && process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-ink/50">{t("checkout.loading")}</p>
      )}
    </div>
  );
}
