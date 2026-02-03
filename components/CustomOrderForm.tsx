"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function CustomOrderForm() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  return (
    <form
      className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-soft"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.name")}</label>
        <input
          required
          className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.email")}</label>
        <input
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-ink">{t("customForm.colors")}</label>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink">{t("customForm.quantity")}</label>
          <input
            type="number"
            min={1}
            defaultValue={1}
            className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.delivery")}</label>
        <select className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm">
          <option>{t("customForm.pickup")}</option>
          <option>{t("customForm.shipping")}</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.notes")}</label>
        <textarea
          rows={3}
          className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-cherry px-4 py-2 text-sm font-semibold text-white"
      >
        {t("customForm.submit")}
      </button>
      {sent && (
        <p className="rounded-xl bg-cream px-3 py-2 text-xs text-ink">
          {t("customForm.success")}
        </p>
      )}
    </form>
  );
}
