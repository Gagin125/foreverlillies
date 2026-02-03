"use client";

import CustomOrderForm from "@/components/CustomOrderForm";
import { useLanguage } from "@/components/LanguageProvider";

export default function CustomContent() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cherry">{t("sections.custom")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">{t("customForm.title")}</h1>
        <p className="mt-3 text-sm text-ink/70">{t("customForm.intro")}</p>
      </div>
      <CustomOrderForm />
    </div>
  );
}
