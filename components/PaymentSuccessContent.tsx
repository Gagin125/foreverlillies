"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export default function PaymentSuccessContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6">
      <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">{t("success.title")}</h1>
        <p className="mt-3 text-sm text-ink/70">{t("success.subtitle")}</p>
        {amount && (
          <p className="mt-3 text-sm text-ink/60">
            {t("success.paidLabel")}: EUR {amount}
          </p>
        )}
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-cherry px-6 py-3 text-sm font-semibold text-white"
        >
          {t("success.back")}
        </Link>
      </div>
    </main>
  );
}
