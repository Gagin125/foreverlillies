import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const RAW_PATH = path.join(ROOT, "data", "lockers", "lt", "omniva_raw.txt");
const OUT_PATH = path.join(ROOT, "data", "lockers", "lt", "omniva.json");

const raw = await fs.readFile(RAW_PATH, "utf8");

const lines = raw.split(/\r?\n/);
let currentCity = "";
const results = [];

const cleanCity = (value) => {
  let city = value.trim();
  city = city.replace(/\s*(mstl\.|m\.|k\.)$/gi, "").trim();
  city = city.replace(/\s*(mstl|m|k)$/gi, "").trim();
  if (city.endsWith(".")) city = city.slice(0, -1).trim();
  return city;
};

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

  if (parts.length < 3) continue;

  const code2 = parts[parts.length - 1];
  const code1 = parts[parts.length - 2];
  const name = parts[0];
  const address = parts.slice(1, -2).join(" — ");

  results.push({
    id: code1,
    carrier: "omniva",
    country: "LT",
    city: currentCity,
    name,
    address,
    postalCode: code2 || code1
  });
}

await fs.writeFile(OUT_PATH, JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} Omniva lockers to ${OUT_PATH}`);
