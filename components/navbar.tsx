/* Navbar — fixed header with logo, main navigation and WhatsApp CTA.
   Slides out of view while scrolling down (navbar-hidden) and returns on scroll up. */
"use client";

import { useEffect, useRef, useState } from "react";

const WA_LINK = "https://wa.me/5567992401937";

const NAV_LINKS = [
  { label: "Sobre", href: "https://www.youtube.com/watch?v=i2hexNUtN9Y&t=2s", external: true },
  { label: "Soluções", href: "/solucoes", external: false },
  { label: "Produtos", href: "https://www.fertipower.com.br", external: true },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const prev = lastY.current;
        // Hide once scrolled past the bar itself; show again on any upward
        // scroll or when back near the top.
        if (y > 140 && y > prev + 4) setHidden(true);
        else if (y < prev - 4 || y <= 140) setHidden(false);
        lastY.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={hidden ? "navbar navbar-hidden" : "navbar"}>
      <div className="navbar-inner">
        <a className="navbar-brand" href="/" aria-label="Organoeste — início">
         <img src="/images/logo.png" alt="Organoeste" width={640} height={320} decoding="async" />
        </a>
        <nav className="navbar-links" aria-label="Navegação principal">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ),
          )}
        </nav>
        <a className="navbar-cta" href={WA_LINK} target="_blank" rel="noopener noreferrer">
          Fale conosco
        </a>
      </div>
    </header>
  );
}
