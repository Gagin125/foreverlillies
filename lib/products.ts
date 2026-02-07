import { Language } from "@/lib/i18n";

export type Product = {
  slug: string;
  sku: string;
  basePrice: number;
  images: string[];
  name: Record<Language, string>;
  shortDesc: Record<Language, string>;
  accent: Record<Language, string>;
};

export type Option = {
  key: string;
  label: Record<Language, string>;
};

export const colorOptions: Option[] = [
  { key: "pink", label: { en: "Pink", lt: "Rožinė" } },
  { key: "dark-red", label: { en: "Dark red", lt: "Tamsiai raudona" } },
  { key: "burgundy", label: { en: "Burgundy", lt: "Bordo" } },
  { key: "blue", label: { en: "Blue", lt: "Mėlyna" } },
  { key: "white", label: { en: "White", lt: "Balta" } },
  { key: "purple", label: { en: "Purple", lt: "Violetinė" } }
];

export const sizeOptions: Option[] = [
  { key: "small", label: { en: "Small", lt: "Mažas" } },
  { key: "medium", label: { en: "Medium", lt: "Vidutinis" } },
  { key: "large", label: { en: "Large", lt: "Didelis" } }
];

export const packagingOptions: Option[] = [
  { key: "gift", label: { en: "Gift box", lt: "Dovanų dėžė" } },
  { key: "minimal", label: { en: "Minimal wrap", lt: "Minimalus įpakavimas" } }
];

export const products: Product[] = [
  {
    slug: "1-lily",
    sku: "LILY-1",
    basePrice: 0.1,
    images: [
      "/products/lily-1.png",
      "/products/lily-1.png",
      "/products/lily-1.png",
      "/products/lily-1.png",
      "/products/lily-1.png"
    ],
    name: { en: "1 Lily", lt: "1 lelija" },
    shortDesc: {
      en: "A single stem with timeless charm.",
      lt: "Vienas stiebas ir elegiška dovana."
    },
    accent: { en: "Perfect for a thoughtful gesture.", lt: "Puiki subtiliai dovanai." }
  },
  {
    slug: "3-lilies",
    sku: "LILY-3",
    basePrice: 13,
    images: [
      "/products/lily-3.png",
      "/products/lily-3.png",
      "/products/lily-3.png",
      "/products/lily-3.png",
      "/products/lily-3.png"
    ],
    name: { en: "3 Lilies", lt: "3 lelijos" },
    shortDesc: {
      en: "A soft, romantic trio bouquet.",
      lt: "Švelni, romantiška trijų lelijų puokštė."
    },
    accent: { en: "Our most-loved gifting size.", lt: "Mylimiausias dovanos dydis." }
  },
  {
    slug: "5-lilies",
    sku: "LILY-5",
    basePrice: 20,
    images: [
      "/products/lily-5.png",
      "/products/lily-5.png",
      "/products/lily-5.png",
      "/products/lily-5.png",
      "/products/lily-5.png"
    ],
    name: { en: "5 Lilies", lt: "5 lelijos" },
    shortDesc: {
      en: "A full, statement bouquet.",
      lt: "Pilna, įspūdinga puokštė."
    },
    accent: { en: "Best value with premium impact.", lt: "Geriausias kainos ir įspūdžio santykis." }
  },
  {
    slug: "custom-order",
    sku: "CUSTOM",
    basePrice: 0,
    images: [
      "/products/productscustom_order.png"
    ],
    name: { en: "Custom Order", lt: "Individualus užsakymas" },
    shortDesc: {
      en: "Your colors, size, and story.",
      lt: "Jūsų spalvos, dydis ir istorija."
    },
    accent: { en: "Quote confirmed before crafting.", lt: "Kaina patvirtinama prieš gamybą." }
  }
];

export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);

export const bundleSavings = {
  "3-lilies": 0.5,
  "5-lilies": 2.5
};
