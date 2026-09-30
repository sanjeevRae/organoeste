"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const WA_LINK = "https://wa.me/5567992401937";
const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Soluções", href: "/solucoes" },
  { label: "Produtos", href: "https://www.fertipower.com.br/", external: true },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/#contato" },
];

function WhatsappMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
    </svg>
  );
}

function ArrowMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      className="navbar-cta-arrow"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5" />
    </svg>
  );
}
const TOP_EPS = 4;
const LOGO_BAR = "/images/logo.png";
const LOGO_OVERLAY = "/images/logo-transparent.png";

type NavbarProps = {
  overlay?: boolean;
};

export default function Navbar({ overlay = false }: NavbarProps) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [floating, setFloating] = useState(overlay);
  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const sync = (y: number, prev: number) => {
      setFloating(overlay && y <= TOP_EPS);
      if (y > 140 && y > prev + 4) {
        setHidden(true);
      } else if (y < prev - 4 || y <= 140) {
        setHidden(false);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        sync(y, lastY.current);
        lastY.current = y;
      });
    };

    sync(lastY.current, lastY.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overlay]);

  const classes = ["navbar"];
  if (floating) classes.push("navbar-overlay");
  if (hidden) classes.push("navbar-hidden");

  return (
    <header ref={headerRef} className={classes.join(" ")}>
      <div className="navbar-inner">
        <a className="navbar-brand" href="/" aria-label="Organoeste, página inicial">
          <img
            src={floating ? LOGO_OVERLAY : LOGO_BAR}
            alt="Organoeste"
            width={640}
            height={320}
            decoding="async"
          />
        </a>
        <nav className="navbar-links" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => {
            const [path, hash] = link.href.split("#");
            const active = !link.external && !hash && path === pathname;
            return (
              <a
                key={link.label}
                href={link.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
        <a className="navbar-cta" href={WA_LINK} target="_blank" rel="noopener noreferrer">
          <WhatsappMark />
          Fale Conosco
          <ArrowMark />
        </a>
      </div>
    </header>
  );
}
