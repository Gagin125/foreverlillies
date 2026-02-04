"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  alt,
  activeIndex,
  onActiveChange
}: {
  images: string[];
  alt: string;
  activeIndex?: number;
  onActiveChange?: (nextIndex: number) => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof activeIndex === "number") {
      setActive(activeIndex);
    } else {
      setActive(0);
    }
  }, [images, activeIndex]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1024px) 50vw, 520px"
          className="object-contain"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
        {images.map((img, index) => (
          <button
            type="button"
            key={`${img}-${index}`}
            onClick={() => {
              setActive(index);
              onActiveChange?.(index);
            }}
            className={`relative aspect-square overflow-hidden rounded-xl border transition ${
              active === index ? "border-cherry" : "border-black/10"
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <Image src={img} alt={alt} fill sizes="80px" className="object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
