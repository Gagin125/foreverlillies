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

  const colorImages = useMemo(() => {
    const one = {
      pink: "/products/product_1_pink.png",
      "dark-red": "/products/product_1_dark_red.png",
      burgundy: "/products/product_1_burgundy.png",
      blue: "/products/product_1_blue_no_red_v2.png",
      white: "/products/product_1_soft_white.png",
      purple: "/products/product_1_purple.png"
    } as const;

    const three = {
      pink: "/products/bouquet_pink.png",
      "dark-red": "/products/bouquet_dark_red.png",
      burgundy: "/products/bouquet_burgundy.png",
      blue: "/products/bouquet_blue.png",
      white: "/products/bouquet_soft_white_like_single.png",
      purple: "/products/bouquet_purple.png"
    } as const;

    const five = {
      pink: "/products/bouquet2_pink.png",
      "dark-red": "/products/bouquet2_dark_red.png",
      burgundy: "/products/bouquet2_burgundy.png",
      blue: "/products/bouquet2_blue.png",
      white: "/products/bouquet2_soft_white_like_single.png",
      purple: "/products/bouquet2_purple.png"
    } as const;

    return { one, three, five };
  }, []);

  const colorKeys = ["pink", "dark-red", "burgundy", "blue", "white", "purple"] as const;

  const galleryImages = useMemo(() => {
    if (isCustom) return activeProduct.images;
    return colorKeys
      .map((key) => colorImages[selectedBundle]?.[key])
      .filter(Boolean) as string[];
  }, [activeProduct.images, colorImages, isCustom, options.color, selectedBundle]);

  const activeColorIndex = useMemo(() => {
    const index = colorKeys.indexOf(options.color as (typeof colorKeys)[number]);
    return index >= 0 ? index : 0;
  }, [options.color, colorKeys]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <ProductGallery
          images={galleryImages}
          alt={activeProduct.name[lang]}
          activeIndex={activeColorIndex}
          onActiveChange={(index) => {
            if (isCustom) return;
            const key = colorKeys[index];
            if (key) {
              setOptions((prev) => ({ ...prev, color: key }));
            }
          }}
        />
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
