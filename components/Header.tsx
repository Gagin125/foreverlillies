"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import CartIcon from "@/components/CartIcon";

export default function Header() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 md:px-6">
        <Link href="/" className="text-xl font-semibold text-ink">
          Forever <span className="text-cherry">Lilies</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-cherry transition">
            {t("nav.home")}
          </Link>
          <Link href="/products" className="hover:text-cherry transition">
            {t("nav.collection")}
          </Link>
          <Link href="/custom" className="hover:text-cherry transition">
            {t("nav.custom")}
          </Link>
          <Link href="/#faq" className="hover:text-cherry transition">
            {t("nav.faq")}
          </Link>
          <Link href="/#contact" className="hover:text-cherry transition">
            {t("nav.contact")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-black/10 bg-white text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLang("lt")}
              className={`px-3 py-1 rounded-full transition ${
                lang === "lt" ? "bg-cherry text-white" : "text-ink"
              }`}
              aria-pressed={lang === "lt"}
            >
              LT
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full transition ${
                lang === "en" ? "bg-cherry text-white" : "text-ink"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          <CartIcon />
        </div>
      </div>
      <div className="flex items-center justify-center gap-5 border-t border-black/5 py-2 text-xs font-medium md:hidden">
        <Link href="/products" className="hover:text-cherry transition">
          {t("nav.collection")}
        </Link>
        <Link href="/custom" className="hover:text-cherry transition">
          {t("nav.custom")}
        </Link>
        <Link href="/#faq" className="hover:text-cherry transition">
          {t("nav.faq")}
        </Link>
        <Link href="/#contact" className="hover:text-cherry transition">
          {t("nav.contact")}
        </Link>
      </div>
    </header>
  );
}
