"use client";

import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function CartIcon() {
  const { items, toggleCart } = useCart();
  const { t } = useLanguage();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative inline-flex items-center justify-center rounded-full border border-cherry px-3 py-1 text-sm font-semibold text-cherry hover:bg-cherry hover:text-white transition"
      aria-label="Cart"
    >
      <span className="mr-2 inline-flex">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M7 6h14l-1.6 8.2a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.2 4H3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="20" r="1.4" fill="currentColor" />
          <circle cx="18" cy="20" r="1.4" fill="currentColor" />
        </svg>
      </span>
      {t("nav.cart")}
      {count > 0 && (
        <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold text-xs font-semibold text-ink">
          {count}
        </span>
      )}
    </button>
  );
}
