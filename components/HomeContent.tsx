"use client";

import Link from "next/link";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import FAQAccordion from "@/components/FAQAccordion";
import Testimonials from "@/components/Testimonials";
import { useLanguage } from "@/components/LanguageProvider";
import RealCarousel from "@/components/RealCarousel";

export default function HomeContent() {
  const { t } = useLanguage();
  const bullets = t("copy.bullets") as string[];

  return (
    <main>
      <section className="heroBrand" id="top">
        {/* Replace these image paths if your hero bouquet file differs. */}
        <img
          className="heroBrand__bouquet heroBrand__bouquet--left"
          src="/products/hero.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="heroBrand__bouquet heroBrand__bouquet--right"
          src="/products/hero.png"
          alt=""
          aria-hidden="true"
        />
        <div className="heroBrand__content">
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.subtitle")}</p>
          <div className="heroBrand__actions">
            <a className="heroBrand__btn" href="#collection">{t("hero.cta")}</a>
            <a className="heroBrand__btn heroBrand__btn--ghost" href="/custom">{t("hero.secondary")}</a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6" id="collection">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cherry">{t("sections.collection")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">{t("product.benefitHeadline")}</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-cherry">
            {t("nav.collection")}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-semibold text-ink md:text-3xl">{t("sections.story")}</h2>
              <p className="mt-4 text-sm text-ink/70">{t("copy.productDescription")}</p>
              <p className="mt-4 text-sm text-ink/70">{t("copy.shippingBlurb")}</p>
              <div className="mt-6 grid gap-3 text-sm text-ink/80">
                {bullets.slice(0, 3).map((bullet) => (
                  <div key={bullet} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gold" />
                    {bullet}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-cherry p-6 text-white shadow-soft">
              <h3 className="text-xl font-semibold">{t("product.soldNote")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {bullets.slice(3).map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <Link
                href="/products"
                className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-cherry"
              >
                {t("hero.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6" id="faq">
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">{t("sections.faq")}</h2>
        <div className="mt-6">
          <FAQAccordion />
        </div>
      </section>

      <section className="bg-white/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <h2 className="text-2xl font-semibold text-ink md:text-3xl">{t("sections.reviews")}</h2>
          <div className="mt-6">
            <Testimonials />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-cherry">
              {t("realBouquets.kicker")}
            </p>
            <h2 className="text-2xl font-semibold text-ink md:text-3xl">
              {t("realBouquets.title")}
            </h2>
            <p className="text-sm text-ink/70">{t("realBouquets.subtitle")}</p>
          </div>
        </div>
        <div className="mt-6">
          <RealCarousel />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6" id="contact">
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-ink md:text-3xl">{t("contact.title")}</h2>
          <p className="mt-3 text-sm text-ink/70">{t("contact.subtitle")}</p>
          <a
            href="mailto:hello@foreverlilies.com"
            className="mt-5 inline-flex rounded-full bg-cherry px-6 py-3 text-sm font-semibold text-white"
          >
            {t("contact.cta")}
          </a>
        </div>
      </section>
    </main>
  );
}
