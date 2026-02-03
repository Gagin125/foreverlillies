import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const RAW_PATH = path.join(ROOT, "data", "lockers", "lt", "dpd_raw.txt");
const OUT_PATH = path.join(ROOT, "data", "lockers", "lt", "dpd.json");

const raw = await fs.readFile(RAW_PATH, "utf8");
const lines = raw.split(/\r?\n/);

let currentCity = "";
const results = [];

const cleanCity = (value) => {
  let city = value.trim();
  if (!city) return "";
  if (city.endsWith(".")) city = city.slice(0, -1).trim();
  return city;
};

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

  if (!line.includes("paštomatas")) {
    currentCity = cleanCity(line);
    continue;
  }

  if (!currentCity) continue;

  const parts = line
    .split("—")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) continue;

  const name = parts[0];
  let address = parts[1];

  const postalMatch = address.match(/LT-\d{4,5}/i);
  const postalCode = postalMatch ? postalMatch[0].replace(/LT-/i, "") : undefined;
  address = address.replace(/,?\s*LT-\d{4,5}.*/i, "").trim();

  const idCandidate = parts.findLast((part) => /^\d+$/.test(part));
  const id =
    idCandidate ||
    (postalCode ? `dpd-${postalCode}-${slug(name)}` : `dpd-${slug(currentCity)}-${slug(name)}`);

  results.push({
    id,
    carrier: "dpd",
    country: "LT",
    city: currentCity,
    name,
    address,
    postalCode
  });
}

await fs.writeFile(OUT_PATH, JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} DPD lockers to ${OUT_PATH}`);
