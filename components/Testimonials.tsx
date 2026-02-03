"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function Testimonials() {
  const { t } = useLanguage();
  const testimonials = t("copy.testimonials") as { quote: string; name: string }[];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {testimonials.map((item) => (
        <div key={item.name} className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/80">"{item.quote}"</p>
          <p className="mt-3 text-sm font-semibold text-ink">{item.name}</p>
        </div>
      ))}
    </div>
  );
}
