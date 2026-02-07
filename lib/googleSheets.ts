import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const getEnv = (key: string) => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : null;
};

const normalizePrivateKey = (raw: string) =>
  raw
    .replace(/\\n/g, "\n")
    .replace(/^"|"$/g, "")
    .replace(/^'|'$/g, "");

export const getSheetsConfig = () => {
  const sheetId = getEnv("GOOGLE_SHEET_ID");
  const sheetTab = getEnv("GOOGLE_SHEET_TAB");
  const clientEmail = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyRaw = getEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  const privateKey = privateKeyRaw ? normalizePrivateKey(privateKeyRaw) : null;
  const enabled = Boolean(sheetId && sheetTab && clientEmail && privateKey);

  return {
    enabled,
    sheetId,
    sheetTab,
    clientEmail,
    privateKey
  };
};

export const getCustomSheetTab = () => getEnv("GOOGLE_SHEET_TAB_CUSTOM") || "CustomOrders";

let cachedAuth: { client: any; expiresAt: number } | null = null;

const getAuthClient = async () => {
  const config = getSheetsConfig();
  if (!config.sheetId || !config.clientEmail || !config.privateKey) {
    throw new Error("Google Sheets is not configured");
  }

  const now = Date.now();
  if (cachedAuth && cachedAuth.expiresAt > now) {
    return cachedAuth.client;
  }

  const client = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: SCOPES
  });

  await client.authorize();

  cachedAuth = {
    client,
    expiresAt: now + 50 * 60 * 1000
  };

  return client;
};

export const appendOrderRow = async (row: (string | number | null)[]) => {
  const config = getSheetsConfig();
  if (!config.enabled || !config.sheetId || !config.sheetTab) {
    return { skipped: true };
  }

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.sheetId,
    range: `${config.sheetTab}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row]
    }
  });

  return { skipped: false };
};

export const appendCustomOrderRow = async (row: (string | number | null)[]) => {
  const config = getSheetsConfig();
  const customTab = getCustomSheetTab();

  if (!config.sheetId || !config.clientEmail || !config.privateKey || !customTab) {
    return { skipped: true };
  }

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.sheetId,
    range: `${customTab}!A:N`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row]
    }
  });

  return { skipped: false };
};
