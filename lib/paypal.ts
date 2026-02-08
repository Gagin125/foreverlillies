type PayPalEnv = "sandbox" | "live";

const getEnv = (): PayPalEnv => (process.env.PAYPAL_ENV === "live" ? "live" : "sandbox");

export const getPaypalBaseUrl = () =>
  getEnv() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const buildPayPalError = (message: string, data: any) => {
  const error = new Error(message) as Error & { paypal?: any };
  error.paypal = data;
  return error;
};

const getAuthHeader = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal not configured");
  }
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${token}`;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export const getPayPalConfig = () => ({
  env: getEnv(),
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID ?? ""
});

export const getAccessToken = async () => {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 60_000) {
    return cachedAccessToken.token;
  }

  const response = await fetch(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildPayPalError(data?.error_description || "PayPal auth failed", data);
  }

  const expiresIn = typeof data?.expires_in === "number" ? data.expires_in : 300;
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000
  };

  return data.access_token as string;
};

export const getPayPalAccessToken = getAccessToken;

export const generatePayPalClientToken = async () => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${getPaypalBaseUrl()}/v1/identity/generate-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw buildPayPalError(data?.message || "PayPal client token failed", data);
  }
  return data.client_token as string;
};

export const createPayPalOrder = async ({
  total,
  items,
  itemTotal,
  shipping,
  tax,
  description,
  note
}: {
  total: string;
  items: Array<{
    name: string;
    sku?: string;
    quantity: string;
    unit_amount: { currency_code: "EUR"; value: string };
  }>;
  itemTotal?: string;
  shipping?: string;
  tax?: string;
  description?: string;
  note?: string;
}) => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          amount: {
            currency_code: "EUR",
            value: total,
            breakdown: {
              item_total: { currency_code: "EUR", value: itemTotal ?? total },
              ...(shipping ? { shipping: { currency_code: "EUR", value: shipping } } : {}),
              ...(tax ? { tax_total: { currency_code: "EUR", value: tax } } : {})
            }
          },
          items
        }
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        landing_page: "LOGIN",
        note_to_payer: note
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildPayPalError(data?.message || "PayPal order creation failed", data);
  }
  return data;
};

export const capturePayPalOrder = async (orderId: string) => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw buildPayPalError(data?.message || "PayPal capture failed", data);
  }
  return data;
};
