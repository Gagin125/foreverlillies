"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

export default function StickyAddToCartBar({ product }: { product: Product }) {
  const { t, lang } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (product.slug === "custom-order") {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-40 w-[94%] -translate-x-1/2 rounded-full bg-white shadow-soft transition md:hidden ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <div>
          <p className="text-xs font-semibold text-ink">{product.name[lang]}</p>
          <p className="text-xs text-cherry">{formatPrice(product.basePrice)}</p>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById("primary-add")?.click()}
          className="rounded-full bg-cherry px-4 py-2 text-xs font-semibold text-white"
        >
          {t("product.addToCart")}
        </button>
      </div>
    </div>
  );
}
