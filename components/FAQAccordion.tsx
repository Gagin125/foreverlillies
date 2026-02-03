"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function FAQAccordion() {
  const { t } = useLanguage();
  const items = t("copy.faqs") as { q: string; a: string }[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.q} className="rounded-2xl border border-black/5 bg-white">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold"
            aria-expanded={openIndex === index}
          >
            {item.q}
            <span className="text-gold">{openIndex === index ? "-" : "+"}</span>
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 text-sm text-ink/70">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
