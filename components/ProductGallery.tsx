"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [images]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 90vw, 480px"
          className="object-contain"
          priority
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {images.map((img, index) => (
          <button
            type="button"
            key={img}
            onClick={() => setActive(index)}
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
