"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { useCart } from "@/components/CartProvider";

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const isCustom = product.slug === "custom-order";

  const handleAdd = () => {
    addItem({
      productSlug: product.slug,
      name: product.name[lang],
      price: product.basePrice,
      quantity: 1,
      options: {
        color: "cherry",
        size: "standard",
        packaging: "minimal",
        giftMessage: ""
      }
    });
  };

  return (
    <div className="product-card halo-card rounded-2xl bg-white p-5 shadow-soft">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="product-media relative mx-auto flex h-48 w-full max-w-[220px] items-center justify-center">
          <Image
            src={product.images[1]}
            alt={product.name[lang]}
            fill
            sizes="200px"
            className="product-image object-contain"
          />
        </div>
        <div className="product-body mt-4">
          <h3 className="text-lg font-semibold text-ink">{product.name[lang]}</h3>
          <p className="product-desc text-sm text-ink/70">{product.shortDesc[lang]}</p>
          <p className="mt-2 text-sm text-ink/70">{product.accent[lang]}</p>
          <div className="mt-3 text-lg font-semibold text-cherry">
            {isCustom ? t("product.customLabel") : formatPrice(product.basePrice)}
          </div>
        </div>
      </Link>
      <div className="product-actions mt-auto pt-4">
        {isCustom ? (
          <Link
            href="/custom"
            className="inline-flex w-full items-center justify-center rounded-full border border-cherry px-4 py-2 text-sm font-semibold text-cherry transition hover:bg-cherry hover:text-white"
          >
            {t("product.customCta")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-full bg-cherry px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a40e1a]"
          >
            {t("product.addToCart")}
          </button>
        )}
      </div>
    </div>
  );
}
