"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getCarriersByCountry,
  getCitiesByCarrier,
  searchLockers,
  type LockerCountry,
  type LockerCarrier,
  type ParcelLocker
} from "@/data/lockers";

export default function CustomOrderForm() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [colors, setColors] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping">("shipping");
  const [country, setCountry] = useState<LockerCountry>("LT");
  const [carrier, setCarrier] = useState<LockerCarrier | "">("omniva");
  const [city, setCity] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [lockerQuery, setLockerQuery] = useState("");
  const [lockerResults, setLockerResults] = useState<ParcelLocker[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<ParcelLocker | null>(null);

  const availableCarriers = useMemo(
    () =>
      getCarriersByCountry(country).map((value) => ({
        value,
        label: value === "omniva" ? "Omniva" : "DPD"
      })),
    [country]
  );

  const availableCities = useMemo(() => {
    if (!carrier) return [];
    return getCitiesByCarrier(country, carrier);
  }, [country, carrier]);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return availableCities;
    const q = cityQuery.trim().toLowerCase();
    return availableCities.filter((item) => item.toLowerCase().includes(q));
  }, [availableCities, cityQuery]);

  useEffect(() => {
    if (!country || !carrier || !city) {
      setLockerResults([]);
      return;
    }
    const handle = setTimeout(() => {
      setLockerResults(
        searchLockers({
          country,
          carrier,
          city,
          query: lockerQuery,
          limit: 50
        })
      );
    }, 200);
    return () => clearTimeout(handle);
  }, [country, carrier, city, lockerQuery]);

  useEffect(() => {
    setCityQuery("");
  }, [carrier]);

  useEffect(() => {
    setLockerQuery("");
    setSelectedLocker(null);
  }, [carrier, city]);

  return (
    <form
      className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setSent(false);

        if (deliveryMethod === "shipping" && (!carrier || !city || !selectedLocker)) {
          setError(t("checkout.lockerRequired"));
          return;
        }

        try {
          setSubmitting(true);
          const response = await fetch("/api/custom-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName,
              lastName,
              email,
              phone,
              colors,
              quantity,
              notes,
              deliveryMethod,
              shipping:
                deliveryMethod === "shipping"
                  ? {
                      country,
                      carrier: carrier || undefined,
                      city,
                      locker: selectedLocker
                        ? {
                            id: selectedLocker.id,
                            name: selectedLocker.name,
                            address: selectedLocker.address,
                            postalCode: selectedLocker.postalCode
                          }
                        : null
                    }
                  : null
            })
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            if (data?.error === "MISSING_FIELDS") {
              setError(t("checkout.missingFields"));
            } else if (data?.error === "SHEETS_NOT_CONFIGURED") {
              setError(t("customForm.sheetsMissing"));
            } else {
              setError(t("customForm.errorGeneric"));
            }
            return;
          }

          setSent(true);
        } catch (err) {
          console.error("Custom order submit failed", err);
          setError(t("customForm.errorGeneric"));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-ink">{t("customForm.firstName")}</label>
          <input
            required
            className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink">{t("customForm.lastName")}</label>
          <input
            required
            className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.email")}</label>
        <input
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.phone")}</label>
        <input
          type="tel"
          required
          className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-ink">{t("customForm.colors")}</label>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
            value={colors}
            onChange={(event) => setColors(event.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink">{t("customForm.quantity")}</label>
          <input
            type="number"
            min={1}
            className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value) || 1)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.delivery")}</label>
        <select
          className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
          value={deliveryMethod}
          onChange={(event) => setDeliveryMethod(event.target.value as "pickup" | "shipping")}
        >
          <option value="pickup">{t("customForm.pickup")}</option>
          <option value="shipping">{t("customForm.shipping")}</option>
        </select>
      </div>
      {deliveryMethod === "shipping" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-ink">{t("customForm.country")}</label>
            <select
              className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
              value={country}
              onChange={(event) => {
                const nextCountry = event.target.value as LockerCountry;
                setCountry(nextCountry);
                const carriers = getCarriersByCountry(nextCountry);
                setCarrier(carriers[0] ?? "");
                setCity("");
                setSelectedLocker(null);
                setCityQuery("");
                setLockerQuery("");
              }}
            >
              <option value="LT">{t("customForm.countryLt")}</option>
              <option value="PL">{t("customForm.countryPl")}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">{t("customForm.carrier")}</label>
            <select
              className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
              value={carrier}
              onChange={(event) => {
                setCarrier(event.target.value as LockerCarrier);
                setCity("");
                setSelectedLocker(null);
                setCityQuery("");
                setLockerQuery("");
              }}
            >
              {availableCarriers.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">{t("customForm.city")}</label>
            {city ? (
              <div className="mt-2 flex items-center justify-between rounded-xl border border-black/10 bg-cream/40 px-3 py-2 text-sm">
                <span className="font-semibold text-ink">{city}</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-cherry"
                  onClick={() => {
                    setCity("");
                    setSelectedLocker(null);
                    setCityQuery("");
                    setLockerQuery("");
                  }}
                >
                  {t("checkout.change")}
                </button>
              </div>
            ) : (
              <>
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
                  placeholder={t("customForm.cityPlaceholder")}
                  value={cityQuery}
                  onChange={(event) => setCityQuery(event.target.value)}
                  disabled={!carrier}
                />
                <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-black/10 bg-white">
                  {carrier ? (
                    filteredCities.length > 0 ? (
                      <ul className="divide-y divide-black/5 text-sm">
                        {filteredCities.map((item) => (
                          <li key={item}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-cream/70"
                              onClick={() => {
                                setCity(item);
                                setSelectedLocker(null);
                                setCityQuery("");
                                setLockerQuery("");
                              }}
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.noCities")}</p>
                    )
                  ) : (
                    <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.selectCarrierFirst")}</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">{t("customForm.postMachine")}</label>
            {selectedLocker ? (
              <div className="mt-2 rounded-xl border border-black/10 bg-cream/40 px-3 py-2 text-sm">
                <p className="font-semibold text-ink">{selectedLocker.name}</p>
                <p className="text-xs text-ink/70">
                  {selectedLocker.address}
                  {selectedLocker.postalCode ? `, ${selectedLocker.postalCode}` : ""}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-cherry"
                  onClick={() => setSelectedLocker(null)}
                >
                  {t("checkout.change")}
                </button>
              </div>
            ) : (
              <>
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
                  placeholder={t("customForm.postMachinePlaceholder")}
                  value={lockerQuery}
                  onChange={(event) => setLockerQuery(event.target.value)}
                  disabled={!city}
                />
                <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-black/10 bg-white">
                  {city ? (
                    lockerResults.length > 0 ? (
                      <ul className="divide-y divide-black/5 text-sm">
                        {lockerResults.map((locker) => (
                          <li key={locker.id}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-cream/70"
                              onClick={() => {
                                setSelectedLocker(locker);
                                setLockerQuery("");
                              }}
                            >
                              <p className="font-semibold text-ink">{locker.name}</p>
                              <p className="text-xs text-ink/70">
                                {locker.address}
                                {locker.postalCode ? `, ${locker.postalCode}` : ""}
                              </p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.noLockers")}</p>
                    )
                  ) : (
                    <p className="px-3 py-3 text-xs text-ink/60">{t("checkout.selectCityFirst")}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div>
        <label className="text-sm font-semibold text-ink">{t("customForm.notes")}</label>
        <textarea
          rows={3}
          className="mt-2 w-full rounded-xl border border-black/10 bg-cream/60 px-3 py-2 text-sm"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-cherry px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? t("checkout.processing") : t("customForm.submit")}
      </button>
      {error && (
        <p className="rounded-xl bg-cream px-3 py-2 text-xs text-ink">{error}</p>
      )}
      {sent && (
        <p className="rounded-xl bg-cream px-3 py-2 text-xs text-ink">
          {t("customForm.success")}
        </p>
      )}
    </form>
  );
}
