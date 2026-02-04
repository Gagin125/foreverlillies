"use client";

import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useLanguage } from "@/components/LanguageProvider";

export default function ProductsContent() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cherry">{t("sections.collection")}</p>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">{t("hero.title")}</h1>
        <p className="max-w-2xl text-sm text-ink/70">{t("copy.productDescription")}</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </main>
  );
}
