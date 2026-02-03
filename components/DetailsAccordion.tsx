"use client";

import { useState } from "react";

export default function DetailsAccordion({
  items
}: {
  items: { title: string; content: string }[];
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.title} className="rounded-2xl border border-black/5 bg-white">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold"
            aria-expanded={openIndex === index}
          >
            {item.title}
            <span className="text-gold">{openIndex === index ? "-" : "+"}</span>
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 text-sm text-ink/70">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
