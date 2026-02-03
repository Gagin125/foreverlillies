"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const photoAlts: Record<number, string> = {
  1: "Pink lily bouquet wrapped in black paper",
  2: "Deep red lily cluster on yellow wrap",
  3: "Red lilies bouquet on marble surface",
  4: "Red lilies with white accents",
  5: "Red lilies wrapped in paper",
  6: "Blue lily stems tied with ribbon",
  7: "Crimson lilies bouquet detail",
  8: "Burgundy lily bouquet close-up",
  9: "Blue lilies on marble background",
  10: "Purple lilies with pink accents",
  11: "Handmade lily bouquet with soft wrap"
};

const photos = Array.from({ length: 11 }, (_, index) => {
  const number = index + 1;
  return {
    src: `/products/real-${number}.jpg`,
    alt: photoAlts[number] ?? `Bouquet ${number}`
  };
});

export default function RealCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDot, setActiveDot] = useState(0);
  const [dotTargets, setDotTargets] = useState<number[]>(
    Array.from({ length: 8 }, (_, i) => i)
  );
  const activeIndexRef = useRef(0);
  const autoDirRef = useRef<1 | -1>(1);
  const dotTargetsRef = useRef<number[]>(dotTargets);
  const didInitRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<HTMLElement[]>([]);
  const DOT_COUNT = 8;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const syncActiveDot = useCallback((index: number) => {
    const targets = dotTargetsRef.current;
    if (!targets.length) {
      setActiveDot(0);
      return;
    }
    let closest = 0;
    let minDiff = Number.POSITIVE_INFINITY;
    targets.forEach((target, i) => {
      const diff = Math.abs(index - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    });
    setActiveDot(closest);
  }, []);

  useEffect(() => {
    syncActiveDot(activeIndex);
  }, [activeIndex, syncActiveDot]);

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const slides = slidesRef.current;
    if (!viewport || !track || !slides.length) return;

    const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const target = Math.min(slides[index].offsetLeft, maxScroll);
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    viewport.scrollTo({
      left: target,
      behavior: smooth && !prefersReduced ? "smooth" : "auto"
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    slidesRef.current = Array.from(track.querySelectorAll<HTMLElement>(".real-card"));
    const slides = slidesRef.current;
    if (!slides.length) return;

    const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

    const getClosestIndex = () => {
      const scrollLeft = viewport.scrollLeft;
      let closest = 0;
      let minDiff = Number.POSITIVE_INFINITY;
      slides.forEach((slide, i) => {
        const diff = Math.abs(scrollLeft - slide.offsetLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closest = i;
        }
      });
      return closest;
    };

    const layout = () => {
      const w = window.innerWidth;
      const cols = w < 640 ? 1 : w < 1024 ? 2 : 3;
      const gap = w < 640 ? 16 : 22;
      const pad = w < 640 ? 10 : 12;

      track.style.gap = `${gap}px`;

      const inner = viewport.clientWidth - pad * 2;
      const cardWidth = (inner - gap * (cols - 1)) / cols;
      slides.forEach((slide) => {
        slide.style.width = `${cardWidth}px`;
      });

      const maxStart = Math.max(0, slides.length - cols);
      const dotCount = Math.min(DOT_COUNT, maxStart + 1);
      const targets = Array.from({ length: dotCount }, (_, i) => Math.min(i, maxStart));
      dotTargetsRef.current = targets;
      setDotTargets(targets);
      syncActiveDot(activeIndexRef.current);

      if (!didInitRef.current) {
        activeIndexRef.current = 0;
        setActiveIndex(0);
        scrollToIndex(0, false);
        didInitRef.current = true;
        return;
      }

      const clamped = clamp(activeIndexRef.current, 0, slides.length - 1);
      if (clamped !== activeIndexRef.current) {
        activeIndexRef.current = clamped;
        setActiveIndex(clamped);
      }
      scrollToIndex(clamped, false);
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const closest = getClosestIndex();
        if (closest !== activeIndexRef.current) {
          activeIndexRef.current = closest;
          setActiveIndex(closest);
        }
      });
    };

    let isDown = false;
    let startX = 0;
    let startLeft = 0;
    let pid: number | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDown = true;
      pid = e.pointerId;
      viewport.setPointerCapture(pid);
      startX = e.clientX;
      startLeft = viewport.scrollLeft;
      viewport.classList.add("real-dragging");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown || e.pointerId !== pid) return;
      const dx = e.clientX - startX;
      viewport.scrollLeft = startLeft - dx;
    };

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      viewport.classList.remove("real-dragging");
      try {
        if (pid !== null) viewport.releasePointerCapture(pid);
      } catch {}
      pid = null;
      const closest = getClosestIndex();
      activeIndexRef.current = closest;
      setActiveIndex(closest);
      scrollToIndex(closest, true);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", endDrag);

    layout();
    window.addEventListener("resize", layout);

    return () => {
      window.removeEventListener("resize", layout);
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("pointerleave", endDrag);
      cancelAnimationFrame(raf);
    };
  }, [scrollToIndex]);

  const goToDot = useCallback(
    (index: number, smooth: boolean) => {
      const targets = dotTargetsRef.current;
      if (!targets.length) return;
      const bounded = Math.max(0, Math.min(index, targets.length - 1));
      const targetIndex = targets[bounded] ?? 0;
      activeIndexRef.current = targetIndex;
      setActiveIndex(targetIndex);
      setActiveDot(bounded);
      scrollToIndex(targetIndex, smooth);
    },
    [scrollToIndex]
  );

  const handleDotClick = (index: number) => {
    goToDot(index, true);
  };

  useEffect(() => {
    if (dotTargets.length < 2) return;
    const id = window.setInterval(() => {
      const last = dotTargetsRef.current.length - 1;
      if (last < 1) return;
      let next = activeDot + autoDirRef.current;
      if (next > last) {
        autoDirRef.current = -1;
        next = Math.max(0, last - 1);
      } else if (next < 0) {
        autoDirRef.current = 1;
        next = Math.min(1, last);
      }
      goToDot(next, true);
    }, 3200);
    return () => window.clearInterval(id);
  }, [activeDot, dotTargets.length, goToDot]);

  return (
    <div className="real-frame">
      <div className="real-viewport" ref={viewportRef} aria-label="Real bouquets carousel">
        <div className="real-track" ref={trackRef}>
          {photos.map((photo, idx) => (
            <figure key={photo.src} className="real-card">
              <div className="real-mat">
                <div className="real-media">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 86vw, (max-width: 1024px) 46vw, 30vw"
                    className="real-img"
                    priority={idx === 0}
                  />
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
      <div className="real-tray">
        <div className="real-dots" aria-label="Carousel pagination">
          {dotTargets.map((target, idx) => (
            <button
              key={`dot-${target}`}
              type="button"
              aria-label={`Show image ${target + 1}`}
              aria-current={idx === activeDot}
              onClick={() => handleDotClick(idx)}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .real-frame {
          background: #d9d2c6;
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 18px 38px rgba(17, 17, 17, 0.12);
        }
        .real-viewport {
          --pad: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: var(--pad);
          border-radius: 18px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          touch-action: pan-y;
          cursor: grab;
          user-select: none;
        }
        .real-viewport::-webkit-scrollbar {
          display: none;
        }
        .real-viewport.real-dragging {
          cursor: grabbing;
        }
        .real-track {
          display: flex;
          gap: 22px;
          align-items: stretch;
          flex-wrap: nowrap;
        }
        .real-card {
          margin: 0;
          flex: 0 0 auto;
          min-width: 0;
          scroll-snap-align: start;
        }
        .real-mat {
          background: #fff;
          border-radius: 22px;
          padding: 14px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        }
        .real-media {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
        }
        .real-img {
          object-fit: cover;
        }
        .real-tray {
          margin-top: 16px;
          background: #fff;
          border-radius: 999px;
          height: 46px;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
        }
        .real-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
        }
        .real-dots button {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: none;
          background: #d6d6d6;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .real-dots button[aria-current="true"] {
          background: #8b0000;
          transform: scale(1.12);
        }
        .real-dots button:focus-visible {
          outline: 2px solid #8b0000;
          outline-offset: 2px;
        }
        @media (max-width: 1023px) {
          .real-frame {
            padding: 20px;
          }
          .real-mat {
            padding: 12px;
          }
        }
        @media (max-width: 640px) {
          .real-frame {
            padding: 16px;
          }
          .real-viewport {
            --pad: 10px;
          }
          .real-track {
            gap: 16px;
          }
          .real-mat {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}
