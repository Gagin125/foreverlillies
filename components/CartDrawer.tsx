"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPrice } from "@/lib/utils";
import { colorOptions, packagingOptions, products, sizeOptions } from "@/lib/products";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const { t, lang } = useLanguage();

  return (
    <div
      className={`fixed inset-0 z-[60] transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white p-6 shadow-soft transition ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{t("cart.title")}</h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-sm font-semibold text-ink/60"
          >
            {t("cart.close")}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-ink/60">{t("cart.empty")}</p>
          ) : (
            items.map((item) => {
              const product = products.find((productItem) => productItem.slug === item.productSlug);
              const productName = product?.name[lang] ?? item.name;
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-cream">
                    {product && (
                      <Image src={product.images[1]} alt={item.name} fill sizes="80px" className="object-contain" />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-ink">{productName}</p>
                    <p className="text-xs text-ink/60">
                      {[
                        colorOptions.find((opt) => opt.key === item.options.color)?.label[lang] ?? item.options.color,
                        sizeOptions.find((opt) => opt.key === item.options.size)?.label[lang] ?? item.options.size,
                        packagingOptions.find((opt) => opt.key === item.options.packaging)?.label[lang] ??
                          item.options.packaging,
                        item.options.light ? t("product.light") : null
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                    {item.options.giftMessage ? (
                      <p className="text-xs text-ink/50">"{item.options.giftMessage}"</p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded-full border border-black/10"
                      >
                        -
                      </button>
                      <span className="text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded-full border border-black/10"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-xs text-cherry"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 border-t border-black/5 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink/70">{t("cart.subtotal")}</span>
            <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-ink/60">{t("cart.shippingNote")}</p>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/checkout"
              onClick={closeCart}
              className="rounded-full bg-cherry px-4 py-2 text-center text-xs font-semibold text-white"
            >
              {t("cart.checkout")}
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"
            >
              {t("cart.continue")}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
