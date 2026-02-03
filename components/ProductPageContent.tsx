"use client";

import { useMemo, useState } from "react";
import { products, Product } from "@/lib/products";
import { useLanguage } from "@/components/LanguageProvider";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";

export default function ProductPageContent({ product }: { product: Product }) {
  const { lang } = useLanguage();
  const isCustom = product.slug === "custom-order";

  const bundleProducts = useMemo(() => {
    const one = products.find((item) => item.slug === "1-lily") as Product;
    const three = products.find((item) => item.slug === "3-lilies") as Product;
    const five = products.find((item) => item.slug === "5-lilies") as Product;
    return { one, three, five };
  }, []);

  const slugToBundle = {
    "1-lily": "one",
    "3-lilies": "three",
    "5-lilies": "five"
  } as const;

  type BundleKey = keyof typeof bundleProducts;

  const [selectedBundle, setSelectedBundle] = useState<BundleKey>(() => {
    if (isCustom) return "one";
    return slugToBundle[product.slug as keyof typeof slugToBundle] ?? "one";
  });

  const activeProduct = isCustom ? product : bundleProducts[selectedBundle];
  const bundles = [
    { key: "one" as const, product: bundleProducts.one },
    { key: "three" as const, product: bundleProducts.three },
    { key: "five" as const, product: bundleProducts.five }
  ];

  const [options, setOptions] = useState({
    color: "pink",
    size: "medium",
    packaging: "gift",
    giftMessage: "",
    quantity: 1,
    light: false
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={activeProduct.images} alt={activeProduct.name[lang]} />
        <ProductInfo
          product={activeProduct}
          options={options}
          onOptionsChange={(next) => setOptions((prev) => ({ ...prev, ...next }))}
          bundles={bundles}
          selectedBundle={selectedBundle}
          onBundleChange={setSelectedBundle}
        />
      </div>
    </main>
  );
}
