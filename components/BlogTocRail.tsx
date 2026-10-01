"use client";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog";

export default function BlogTocRail({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="blg-rail-toc" aria-label="Neste artigo">
      <p className="blg-rail-title">Neste artigo</p>
      <ol>
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "blg-rail-h3" : undefined}>
            <a href={`#${item.id}`} className={item.id === active ? "is-active" : undefined}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
