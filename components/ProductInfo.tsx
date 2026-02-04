"use client";

import Link from "next/link";
import { Product, bundleSavings, colorOptions, packagingOptions, sizeOptions } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { useCart } from "@/components/CartProvider";

type ProductOptions = {
  color: string;
  size: string;
  packaging: string;
  giftMessage: string;
  quantity: number;
  light: boolean;
};

export default function ProductInfo({
  product,
  options,
  onOptionsChange,
  bundles,
  selectedBundle,
  onBundleChange
}: {
  product: Product;
  options: ProductOptions;
  onOptionsChange: (next: Partial<ProductOptions>) => void;
  bundles: { key: "one" | "three" | "five"; product: Product }[];
  selectedBundle: "one" | "three" | "five";
  onBundleChange: (next: "one" | "three" | "five") => void;
}) {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const isCustom = product.slug === "custom-order";
  const basePrice = product.basePrice;
  const lightPrice = options.light ? 2 : 0;
  const finalPrice = basePrice + lightPrice;

  const handleAdd = () => {
    if (isCustom) return;
    addItem({
      productSlug: product.slug,
      name: product.name[lang],
      price: finalPrice,
      quantity: options.quantity,
      options: {
        color: options.color,
        size: options.size,
        packaging: options.packaging,
        giftMessage: options.giftMessage,
        light: options.light
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-cherry">{t("product.soldNote")}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">
          {product.name[lang]}
        </h1>
        <p className="mt-3 text-base text-ink/70">{t("product.benefitHeadline")}</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="flex text-gold">*****</div>
          <span className="text-ink/60">4.9 (32)</span>
        </div>
      </div>

      <div>
        <p className="text-2xl font-semibold text-cherry">
          {isCustom ? t("product.customPrice") : formatPrice(finalPrice)}
        </p>
        {!isCustom && (
          <div className="mt-3 rounded-2xl border border-black/5 bg-white p-4">
            <p className="text-sm font-semibold text-ink">{t("product.bundleLabel")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle) => {
                const save = bundleSavings[bundle.product.slug as keyof typeof bundleSavings];
                return (
                  <button
                    key={bundle.key}
                    type="button"
                    onClick={() => onBundleChange(bundle.key)}
                    className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                      selectedBundle === bundle.key
                        ? "border-cherry bg-cherry/10"
                        : "border-black/10 hover:border-cherry"
                    }`}
                  >
                    <div className="font-semibold">{bundle.product.name[lang]}</div>
                    <div className="text-ink/70">{formatPrice(bundle.product.basePrice)}</div>
                    {save ? (
                      <div className="text-xs font-semibold text-gold">
                        {t("product.bundleSave")} {formatPrice(save)}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!isCustom && (
        <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-4">
          <div>
            <label className="text-sm font-semibold text-ink">{t("product.color")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onOptionsChange({ color: option.key })}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    options.color === option.key
                      ? "border-cherry bg-cherry text-white"
                      : "border-black/10 text-ink"
                  }`}
                >
                  {option.label[lang]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">{t("product.size")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onOptionsChange({ size: option.key })}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    options.size === option.key
                      ? "border-cherry bg-cherry text-white"
                      : "border-black/10 text-ink"
                  }`}
                >
                  {option.label[lang]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">{t("product.light")}</label>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => onOptionsChange({ light: !options.light })}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  options.light
                    ? "border-cherry bg-cherry text-white"
                    : "border-black/10 text-ink"
                }`}
              >
                {t("product.light")}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">{t("product.packaging")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {packagingOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onOptionsChange({ packaging: option.key })}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    options.packaging === option.key
                      ? "border-cherry bg-cherry text-white"
                      : "border-black/10 text-ink"
                  }`}
                >
                  {option.label[lang]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">{t("product.giftMessage")}</label>
            <textarea
              value={options.giftMessage}
              onChange={(event) => onOptionsChange({ giftMessage: event.target.value })}
              className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-ink">{t("product.qty")}</label>
            <input
              type="number"
              min={1}
              value={options.quantity}
              onChange={(event) => onOptionsChange({ quantity: Number(event.target.value) })}
              className="w-20 rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {!isCustom ? (
        <button
          id="primary-add"
          type="button"
          onClick={handleAdd}
          className="w-full rounded-full bg-cherry px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a40e1a]"
        >
          {t("product.addToCart")}
        </button>
      ) : (
        <Link
          href="/custom"
          className="inline-flex w-full items-center justify-center rounded-full border border-cherry px-6 py-3 text-sm font-semibold text-cherry transition hover:bg-cherry hover:text-white"
        >
          {t("product.customCta")}
        </Link>
      )}
    </div>
  );
}
