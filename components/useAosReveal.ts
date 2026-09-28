"use client";

import { useEffect, type RefObject } from "react";

export function useAosReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const els = Array.from(root.querySelectorAll("[data-aos]"));
    if (!els.length) return;
    els.forEach((node) =>
      (node as HTMLElement).style.setProperty(
        "--aos-delay",
        ((node as HTMLElement).dataset.aosDelay || "0") + "ms"
      )
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    els.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [rootRef]);
}
