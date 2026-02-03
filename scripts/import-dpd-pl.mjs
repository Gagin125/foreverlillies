import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const RAW_PATH = path.join(ROOT, "data", "lockers", "pl", "dpd_raw.txt");
const OUT_PATH = path.join(ROOT, "data", "lockers", "pl", "dpd.json");

const buffer = await fs.readFile(RAW_PATH);
const utf8 = buffer.toString("utf8");

const CP1250_TABLE = [
  "€", "\uFFFD", "‚", "ƒ", "„", "…", "†", "‡", "ˆ", "‰", "Š", "‹", "Ś", "Ť", "Ž", "Ź",
  "\uFFFD", "‘", "’", "“", "”", "•", "–", "—", "˜", "™", "š", "›", "ś", "ť", "ž", "ź",
  "\u00A0", "ˇ", "˘", "Ł", "¤", "Ą", "¦", "§", "¨", "©", "Ş", "«", "¬", "\u00AD", "®", "Ż",
  "°", "±", "˛", "ł", "´", "µ", "¶", "·", "¸", "ą", "ş", "»", "Ľ", "˝", "ľ", "ż",
  "Ŕ", "Á", "Â", "Ă", "Ä", "Ĺ", "Ć", "Ç", "Č", "É", "Ę", "Ë", "Ě", "Í", "Î", "Ď",
  "Đ", "Ń", "Ň", "Ó", "Ô", "Ő", "Ö", "×", "Ř", "Ů", "Ú", "Ű", "Ü", "Ý", "Ţ", "ß",
  "ŕ", "á", "â", "ă", "ä", "ĺ", "ć", "ç", "č", "é", "ę", "ë", "ě", "í", "î", "ď",
  "đ", "ń", "ň", "ó", "ô", "ő", "ö", "÷", "ř", "ů", "ú", "ű", "ü", "ý", "ţ", "˙"
];

const decodeCP1250 = (buf) => {
  let out = "";
  for (const byte of buf) {
    if (byte < 0x80) {
      out += String.fromCharCode(byte);
    } else {
      out += CP1250_TABLE[byte - 0x80] ?? "\uFFFD";
    }
  }
  return out;
};

const raw = utf8.includes("\uFFFD") ? decodeCP1250(buffer) : utf8;
const lines = raw.split(/\r?\n/);

let currentCity = "";
const results = [];

const cleanCity = (value) => value.trim();

const slug = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  if (line.startsWith("#") || line.startsWith("//")) continue;
  if (line.startsWith("DPD Poland") || line.startsWith("Generated:")) continue;

  if (!line.startsWith("*")) {
    currentCity = cleanCity(line);
    continue;
  }

  if (!currentCity) continue;

  let cleaned = line.replace(/^\*\s*/, "");
  cleaned = cleaned.replace(/Pickup-\s*/g, "Pickup - ");
  cleaned = cleaned.replace(/\s+–\s+/g, " - ");

  const parts = cleaned.split(" - ").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) continue;

  const code = parts.pop() ?? "";
  const addressPart = parts.pop() ?? "";
  const namePart = parts.length ? parts.join(" - ") : addressPart;

  const [addressRaw, postalRaw] = addressPart.split(",").map((part) => part.trim());
  const postalCodeMatch = postalRaw?.match(/\d{2}-?\d{3}|\d{5}/);
  const postalCode = postalCodeMatch ? postalCodeMatch[0].replace("-", "") : undefined;

  const id = code || (postalCode ? `dpd-${postalCode}-${slug(namePart)}` : `dpd-${slug(namePart)}`);

  results.push({
    id,
    carrier: "dpd",
    country: "PL",
    city: currentCity,
    name: namePart,
    address: addressRaw || addressPart,
    postalCode
  });
}

await fs.writeFile(OUT_PATH, JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} DPD PL lockers to ${OUT_PATH}`);
