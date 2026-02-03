"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <div className="text-xl font-semibold">
            Forever <span className="text-gold">Lilies</span>
          </div>
          <p className="mt-2 text-sm text-white/80">{t("footer.line")}</p>
          <p className="text-sm text-white/70">{t("footer.shipping")}</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex gap-4">
            <a href="#" className="hover:text-gold transition">
              Instagram
            </a>
            <a href="#" className="hover:text-gold transition">
              TikTok
            </a>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold transition">
              {t("footer.privacy")}
            </Link>
            <Link href="/returns" className="hover:text-gold transition">
              {t("footer.returns")}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        (c) {new Date().getFullYear()} Forever Lilies
      </div>
    </footer>
  );
}
