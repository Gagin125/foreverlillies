export type Language = "en" | "lt";

export const translations = {
  en: {
    nav: {
      home: "Home",
      collection: "Collection",
      custom: "Custom Order",
      faq: "FAQ",
      contact: "Contact",
      cart: "Cart"
    },
    hero: {
      title: "Handmade Lilies That Last Forever",
      subtitle: "Elegant, thoughtful, and crafted with care. A perfect gift for every occasion.",
      cta: "Order Now",
      secondary: "Custom order"
    },
    sections: {
      collection: "Our collection",
      story: "Made with patient, floral care",
      faq: "FAQ",
      reviews: "Kind words",
      custom: "Custom orders",
      contact: "Contact"
    },
    realBouquets: {
      kicker: "Real bouquets",
      title: "Freshly crafted lilies in the studio",
      subtitle: "A peek at recent orders and custom colorways."
    },
    product: {
      benefitHeadline: "Soft, sculpted lilies designed to last for years.",
      soldNote: "Loved by 30+ happy buyers",
      addToCart: "Add to cart",
      buyNow: "Checkout now",
      bundleLabel: "Choose your bundle",
      bundleSave: "Save",
      color: "Color",
      size: "Size",
      packaging: "Packaging",
      giftMessage: "Add a message",
      qty: "Quantity",
      trust: {
        secure: "Secure checkout",
        shipping: "Baltic shipping + pickup",
        handmade: "Handmade in small batches"
      },
      description: "Description",
      materials: "Materials + dimensions",
      shipping: "Shipping + pickup",
      returns: "Returns + guarantee",
      materialsCopy: "Pipe cleaners, floral wire, soft wrapping paper. Stems approx 25-35 cm.",
      shippingCopy: "Ships across the Baltics or pickup by arrangement. Packed in a protective gift box.",
      returnsCopy: "14-day satisfaction promise. Reach out and I will make it right.",
      customLabel: "Custom",
      customCta: "Request",
      customPrice: "Price on request",
      light: "Light (+2€)",
      faq: "FAQ",
      reviews: "Reviews",
      related: "You may also love"
    },
    cart: {
      title: "Your cart",
      empty: "Your cart is feeling a little empty.",
      subtotal: "Subtotal",
      shippingNote: "Shipping calculated at checkout.",
      checkout: "Go to checkout",
      continue: "Continue shopping",
      close: "Close",
      remove: "Remove"
    },
    checkout: {
      title: "Checkout",
      intro: "Complete your order with secure payment.",
      orderSummary: "Order summary",
      payment: "Payment details",
      customerDetails: "Customer details",
      deliveryMethod: "Delivery method",
      pickup: "Pickup (free)",
      pickupNote: "Pickup details will be sent by email after payment.",
      locker: "Delivery to post machine",
      lockerNote: "Choose your locker location and carrier.",
      deliveryCountry: "Country",
      deliveryCarrier: "Carrier",
      city: "City",
      selectCity: "Select city",
      searchCityPlaceholder: "Search city…",
      noCities: "No cities found.",
      selectCarrierFirst: "Select a carrier to see cities.",
      polandLockersSoon: "Poland parcel lockers will be added later.",
      postMachine: "Post machine (name / address / ID)",
      postMachinePlaceholder: "E.g. OMNIVA Vilnius Akropolis #123",
      searchLockerPlaceholder: "Search locker by name or address…",
      noLockers: "No lockers found.",
      selectCityFirst: "Select a city to see lockers.",
      change: "Change",
      lockerRequired: "Please select a parcel locker to continue.",
      select: "Select",
      required: "Required",
      name: "Name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      eta: "Estimated delivery:",
      paypalPlaceholder: "PayPal will appear here.",
      comingSoon: "Coming soon.",
      missingFields: "Please fill in the required fields.",
      addOns: "Add-ons",
      tax: "Tax (3%)",
      shipping: "Shipping",
      total: "Total",
      cardNumber: "Card number",
      expiry: "Expiration date",
      cvc: "Security code",
      country: "Country",
      pay: "Pay now",
      loading: "Loading secure payment...",
      missingKeys: "PayPal keys are missing in .env.local.",
      processing: "Processing..."
    },
    success: {
      title: "Payment confirmed",
      subtitle: "Thank you for your order. Your lilies are on the way soon.",
      back: "Back to home",
      paidLabel: "Paid"
    },
    customForm: {
      title: "Request a custom bouquet",
      intro: "Tell me your colors, size, and occasion. I will reply with options and pricing.",
      name: "Name",
      email: "Email",
      colors: "Desired colors",
      quantity: "Quantity",
      delivery: "Pickup or shipping",
      pickup: "Pickup",
      shipping: "Shipping",
      country: "Country",
      carrier: "Carrier",
      countryLt: "Lithuania",
      countryPl: "Poland",
      city: "City",
      cityPlaceholder: "Enter city",
      postMachine: "Post machine (name / address / ID)",
      postMachinePlaceholder: "E.g. DPD Vilnius Akropolis",
      notes: "Notes",
      submit: "Send request",
      success: "Thank you! Your request has been sent. I will reply soon.",
      errorGeneric: "Something went wrong. Please try again.",
      sheetsMissing: "Google Sheets is not configured."
    },
    contact: {
      title: "Let's create something special",
      subtitle: "Email hello@foreverlilies.com for collaborations or gifting questions.",
      cta: "Email us"
    },
    footer: {
      line: "Handmade pipe-cleaner lilies, crafted with care.",
      shipping: "Shipping across the Baltics",
      privacy: "Privacy",
      returns: "Returns"
    },
    copy: {
      productDescription:
        "Soft, sculpted pipe-cleaner lilies shaped petal by petal, designed to keep their beauty for years.",
      bullets: [
        "Lasts forever, no water or wilting",
        "Handmade in ~45 minutes per lily",
        "Gift-ready packaging with a thank you card",
        "Ships across the Baltics or easy local pickup",
        "Custom colors and personal notes available"
      ],
      shippingBlurb:
        "Each bouquet is boxed with protective filling, bubble wrap, and a handwritten thank you card.",
      guaranteeBlurb: "14-day satisfaction promise. If it is not perfect, I will make it right.",
      faqs: [
        {
          q: "How much do the lilies cost?",
          a: "1 Lily EUR 4.50, 3 Lilies EUR 13.00, 5 Lilies EUR 20.00. Custom orders depend on size and design, with pricing confirmed before payment."
        },
        {
          q: "Can I request different colors?",
          a: "Yes. Cherry red is the signature, but you can request other shades in the order notes."
        },
        {
          q: "Do you ship or offer pickup?",
          a: "Both. I ship to Lithuania & Poland and offer local pickup by arrangement."
        },
        {
          q: "How long do they last and how do I care for them?",
          a: "They last for years. Keep them dry and dust gently with a soft brush."
        },
        {
          q: "How long does it take to make my order?",
          a: "Each lily takes about 45 minutes. Small bouquets ship in a few days, larger pieces take a bit longer."
        },
        {
          q: "Do you take custom orders?",
          a: "Absolutely. Share your idea and I will confirm a custom design and quote."
        }
      ],
      testimonials: [
        {
          quote: "Wow!! Perfectly crafted flowers, simply wonderful, thank you!",
          name: "Dominykas"
        },
        {
          quote: "Amazing bouquet, crafted with care, great price, thank you so much.",
          name: "Karina"
        },
        {
          quote: "Wonderful flowers, great quality, my girlfriend was really happy!",
          name: "Kajus"
        }
      ]
    }
  },
  lt: {
    nav: {
      home: "Pradžia",
      collection: "Kolekcija",
      custom: "Individualus užsakymas",
      faq: "DUK",
      contact: "Kontaktai",
      cart: "Krepšelis"
    },
    hero: {
      title: "Rankų darbo lelijos, kurios išlieka amžinai",
      subtitle: "Elegantiška, apgalvota ir kruopščiai pagaminta. Puiki dovana kiekvienai progai.",
      cta: "Peržiūrėti kolekciją",
      secondary: "Individualus užsakymas"
    },
    sections: {
      collection: "Kolekcija",
      story: "Kuriamos su kantriu gėlių jausmu",
      faq: "DUK",
      reviews: "Atsiliepimai",
      custom: "Individualūs užsakymai",
      contact: "Kontaktai"
    },
    realBouquets: {
      kicker: "Tikros puokštės",
      title: "Šviežiai pagamintos lelijos studijoje",
      subtitle: "Žvilgsnis į naujausius užsakymus ir individualiai pritaikytas spalvų pasirinkimus."
    },
    product: {
      benefitHeadline: "Švelnios, formuotos lelijos, kurios džiugina metų metus.",
      soldNote: "Pamiltos 30+ laimingų pirkėjų",
      addToCart: "Įdėti į krepšelį",
      buyNow: "Pirkti dabar",
      bundleLabel: "Pasirinkite rinkinį",
      bundleSave: "Sutaupykite",
      color: "Spalva",
      size: "Dydis",
      packaging: "Įpakavimas",
      giftMessage: "Pridėti žinutę",
      qty: "Kiekis",
      trust: {
        secure: "Saugus apmokėjimas",
        shipping: "Siuntimas Baltijos šalyse + atsiėmimas",
        handmade: "Rankų darbo mažais kiekiais"
      },
      description: "Aprašymas",
      materials: "Medžiagos ir matmenys",
      shipping: "Pristatymas ir atsiėmimas",
      returns: "Grąžinimas ir garantija",
      materialsCopy:
        "Šeniliniai vamzdeliai, floristinė viela, švelnus popierius. Stiebeliai apie 25-35 cm.",
      shippingCopy:
        "Siunčiama Baltijos šalyse arba atsiėmimas vietoje. Supakuojama į apsauginę dėžę.",
      returnsCopy: "14 dienų pasitenkinimo pažadas. Jei kas ne taip, sutvarkysiu.",
      customLabel: "Individualu",
      customCta: "Užsakyti",
      customPrice: "Kaina pagal užklausą",
      faq: "DUK",
      reviews: "Atsiliepimai",
      related: "Jums taip pat patiks",
      light: "Švieselė (+2€)"
    },
    cart: {
      title: "Jūsų krepšelis",
      empty: "Krepšelis dar tuščias.",
      subtotal: "Suma",
      shippingNote: "Pristatymas apskaičiuojamas apmokėjimo metu.",
      checkout: "Eiti į apmokėjimą",
      continue: "Toliau apsipirkti",
      close: "Uždaryti",
      remove: "Šalinti"
    },
    checkout: {
      title: "Apmokėjimas",
      intro: "Užsakymo apmokėjimas saugiu būdu.",
      orderSummary: "Užsakymo suvestinė",
      payment: "Mokėjimo duomenys",
      customerDetails: "Kliento duomenys",
      deliveryMethod: "Pristatymo būdas",
      pickup: "Atsiėmimas (nemokamai)",
      pickupNote: "Atsiėmimo informaciją atsiųsime el. paštu po apmokėjimo.",
      locker: "Pristatymas į paštomatą",
      lockerNote: "Pasirinkite paštomatą ir kurjerį.",
      deliveryCountry: "Šalis",
      deliveryCarrier: "Kurjeris",
      city: "Miestas",
      selectCity: "Pasirinkite miestą",
      searchCityPlaceholder: "Ieškokite miesto…",
      noCities: "Miestų nerasta.",
      selectCarrierFirst: "Pasirinkite kurjerį, kad matytumėte miestus.",
      polandLockersSoon: "Lenkijos paštomatai bus pridėti vėliau.",
      postMachine: "Paštomatas (pavadinimas / adresas / ID)",
      postMachinePlaceholder: "Pvz. OMNIVA Vilnius Akropolis #123",
      searchLockerPlaceholder: "Ieškokite paštomato pagal pavadinimą ar adresą…",
      noLockers: "Paštomatų nerasta.",
      selectCityFirst: "Pasirinkite miestą, kad matytumėte paštomatus.",
      change: "Keisti",
      lockerRequired: "Pasirinkite paštomatą, kad galėtumėte tęsti.",
      select: "Pasirinkite",
      required: "Privaloma",
      name: "Vardas",
      lastName: "Pavardė",
      email: "El. paštas",
      phone: "Telefonas",
      eta: "Numatomas pristatymas:",
      paypalPlaceholder: "PayPal bus rodomas čia.",
      comingSoon: "Jau greitai.",
      missingFields: "Užpildykite privalomus laukus.",
      addOns: "Papildymai",
      tax: "Mokestis (3%)",
      shipping: "Pristatymas",
      total: "Iš viso",
      cardNumber: "Kortelės numeris",
      expiry: "Galiojimo pabaigos data",
      cvc: "Saugos kodas",
      country: "Šalis",
      pay: "Mokėti dabar",
      loading: "Kraunamas saugus apmokėjimas...",
      missingKeys: "Trūksta PayPal raktų .env.local faile.",
      processing: "Apmokama..."
    },
    success: {
      title: "Mokėjimas patvirtintas",
      subtitle: "Ačiū už užsakymą. Jūsų lelijos jau gaminamos.",
      back: "Grįžti į pradžią",
      paidLabel: "Sumokėta"
    },
    customForm: {
      title: "Individualus užsakymas",
      intro: "Parašykite norimas spalvas, dydį ir progą. Atsakysiu su pasiūlymais ir kaina.",
      name: "Vardas",
      email: "El. paštas",
      colors: "Norimos spalvos",
      quantity: "Kiekis",
      delivery: "Atsiimti ar pristatyti",
      pickup: "Atsiimti",
      shipping: "Pristatymas",
      country: "Šalis",
      carrier: "Kurjeris",
      countryLt: "Lietuva",
      countryPl: "Lenkija",
      city: "Miestas",
      cityPlaceholder: "Įrašykite miestą",
      postMachine: "Paštomatas (pavadinimas / adresas / ID)",
      postMachinePlaceholder: "Pvz. DPD Vilnius Akropolis",
      notes: "Pastabos",
      submit: "Siųsti užklausą",
      success: "Ačiū! Jūsų užklausa gauta. Greitai atsakysiu.",
      errorGeneric: "Kažkas nepavyko. Bandykite dar kartą.",
      sheetsMissing: "Google Sheets nėra sukonfigūruotas."
    },
    contact: {
      title: "Sukurkime ką nors ypatingo",
      subtitle: "Rašykite hello@foreverlilies.com dėl dovanų ar bendradarbiavimo.",
      cta: "Parašyti"
    },
    footer: {
      line: "Rankų darbo lelijomis kvepianti dovana, kurta su meile.",
      shipping: "Siunčiu Baltijos šalyse",
      privacy: "Privatumas",
      returns: "Grąžinimas"
    },
    copy: {
      productDescription:
        "Švelnios pipe-cleaner lelijos, formuojamos žiedlapiu po žiedlapio, kad grožis išliktų metų metus.",
      bullets: [
        "Išlieka amžinai, nereikia vandens",
        "Rankų darbo, apie 45 minutes vienai lelijai",
        "Dovanai paruoštas įpakavimas su padėkos kortele",
        "Siunčiama Baltijos šalyse arba patogus atsiėmimas",
        "Galimos individualios spalvos ir žinutės"
      ],
      shippingBlurb:
        "Kiekviena puokštė supakuojama dėžutėje su apsauginiu užpildu, burbuline plėvele ir padėkos kortele.",
      guaranteeBlurb: "14 dienų pasitenkinimo pažadas. Jei nebus tobula, ištaisysiu.",
      faqs: [
        {
          q: "Kiek kainuoja lelijos?",
          a: "1 lelija EUR 4.50, 3 lelijos EUR 13.00, 5 lelijos EUR 20.00. Individuali kaina derinama pagal dydį ir dizainą."
        },
        {
          q: "Ar galima pasirinkti kitas spalvas?",
          a: "Taip. Vyšninė raudona yra pagrindinė, bet galima užsakyti ir kitas spalvas."
        },
        {
          q: "Ar yra pristatymas ar atsiėmimas?",
          a: "Abi galimybės. Siunčiu į Lietuvą ir Lenkiją, galimas ir atsiėmimas vietoje."
        },
        {
          q: "Kiek ilgai jos laikosi ir kaip prižiūrėti?",
          a: "Laiko metų metus. Laikykite sausai, o dulkes nuvalykite švelniu šepetėliu."
        },
        {
          q: "Kiek trunka pagaminti užsakymą?",
          a: "Viena lelija užtrunka apie 45 minutes. Maži užsakymai iškeliauja per kelias dienas."
        },
        {
          q: "Ar atliekami individualūs užsakymai?",
          a: "Taip. Parašykite idėją ir suderinsime dizainą bei kainą."
        }
      ],
      testimonials: [
        {
          quote: "Wow!! Puikiai padarytos gėlės, tiesiog nuostabu, ačiū!",
          name: "Dominykas"
        },
        {
          quote: "Nuostabi puokštė, labai kruopščiai padaryta, puiki kaina, ačiū labai.",
          name: "Karina"
        },
        {
          quote: "Nuostabios gėlės, kokybiškai padarytos, mergina liko labai laiminga!",
          name: "Kajus"
        }
      ]
    }
  }
} as const;

export type TranslationDictionary = typeof translations.en;

export const getTranslation = (lang: Language, path: string) => {
  const parts = path.split(".");
  let current: any = translations[lang];
  for (const key of parts) {
    if (current && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return current;
};
