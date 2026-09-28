/* Heading — top band of the home page (before Hero): the OLAM trucks artwork
   (public/images/solution.png) as the full-width background, carrying the main
   headline, the two CTAs, the trust badges and the four segments card.
   Styles are namespaced as .heading-* in app/site.css.
   The band copy flies up once on load: the first frame after mount swaps
   `heading-enter` for `heading-loaded` (same pattern as the sol-page Hero),
   and the staggered transitions in app/site.css take over. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useAosReveal } from "./useAosReveal";

const WA_LINK = "https://wa.me/5567992401937";

const POINTS = [
  { icon: "shield", lines: ["Segurança e", "Responsabilidade"] },
  { icon: "users", lines: ["Atendimento", "Personalizado"] },
];

const TRUSTED_LOGOS = [
  { src: "/images/adm.png", alt: "ADM" },
  { src: "/images/berpram.png", alt: "Berpram" },
  { src: "/images/suzano.png", alt: "Suzano" },
  { src: "/images/pereira.png", alt: "Pereira" },
  { src: "/images/camva.png", alt: "Camva" },
  { src: "/images/cocacola.png", alt: "Coca-Cola" },
  { src: "/images/jbs.png", alt: "JBS" },
  { src: "/images/aurora.png", alt: "Aurora" },
];

const SEGMENTS = [
  {
    icon: "factory",
    label: "Indústrias",
    description: "Soluções para seu setor.",
  },
  {
    icon: "cart",
    label: "Supermercados",
    description: "Coleta segura de resíduos.",
  },
  {
    icon: "snowflake",
    label: "Frigoríficos",
    description: "Gestão de grandes volumes.",
  },
  {
    icon: "utensils",
    label: "Restaurantes",
    description: "Gestão responsável de resíduos.",
  },
];

/* --- inline icon set (stroke style, currentColor) ----------------------- */

const PATHS: Record<string, React.ReactNode> = {
  shield: (
    <>
      <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="7" rx="1.5" />
      <rect x="17" y="13" width="4" height="7" rx="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
      <circle cx="16.8" cy="9.5" r="2.5" />
      <path d="M16.5 14.6c2.2.2 3.7 1.6 4.1 4" />
    </>
  ),
  factory: (
    <>
      <path d="M2 20h20" />
      <path d="M4 20v-9l5 3V9l5 3V4h6v16" />
      <path d="M8 17h2M13 17h2M17 17h1" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M3 3h2l2.5 12.5a1 1 0 0 0 1 .5h8.5a1 1 0 0 0 1-.8L20 8H6" />
    </>
  ),
  snowflake: (
    <path
      d="M 50 10 L 50 90 M 15 30 L 85 70 M 15 70 L 85 30 M 50 22 L 43 15 M 50 22 L 57 15 M 50 78 L 43 85 M 50 78 L 57 85 M 25 36 L 16 39 M 25 36 L 24 26 M 75 64 L 84 61 M 75 64 L 76 74 M 25 64 L 24 74 M 25 64 L 16 61 M 75 36 L 76 26 M 75 36 L 84 39"
      transform="scale(0.24)"
      strokeWidth={5}
    />
  ),
  utensils: (
    <>
      <path d="M7 3v8M4 3v4a3 3 0 0 0 6 0V3M7 13v8" />
      <path d="M17 3c-2 2-2.5 5-2.5 8H17v10M17 3v10" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.6 15.6 12 10 15.4Z" />
    </>
  ),
  arrow: <path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5" />,
};

/* Bootstrap Icons `bi-leaf` (MIT): the 16x16 solid leaf mark, drawn filled
   with currentColor and scaled by `size` — used wherever the icon named "leaf"
   or "sprout" is requested (the dividers, badges and service cards). */
function LeafMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1.4 1.7c.216.289.65.84 1.725 1.274 1.093.44 2.884.774 5.834.528l.37-.023c1.823-.06 3.117.598 3.956 1.579C14.16 6.082 14.5 7.41 14.5 8.5c0 .58-.032 1.285-.229 1.997q.198.248.382.54c.756 1.2 1.19 2.563 1.348 3.966a1 1 0 0 1-1.98.198c-.13-.97-.397-1.913-.868-2.77C12.173 13.386 10.565 14 8 14c-1.854 0-3.32-.544-4.45-1.435-1.125-.887-1.89-2.095-2.391-3.383C.16 6.62.16 3.646.509 1.902L.73.806zm-.05 1.39c-.146 1.609-.008 3.809.74 5.728.457 1.17 1.13 2.213 2.079 2.961.942.744 2.185 1.22 3.83 1.221 2.588 0 3.91-.66 4.609-1.445-1.789-2.46-4.121-1.213-6.342-2.68-.74-.488-1.735-1.323-1.844-2.308-.023-.214.237-.274.38-.112 1.4 1.6 3.573 1.757 5.59 2.045 1.227.215 2.21.526 3.033 1.158.058-.39.075-.782.075-1.158 0-.91-.288-1.988-.975-2.792-.626-.732-1.622-1.281-3.167-1.229l-.316.02c-3.05.253-5.01-.08-6.291-.598a5.3 5.3 0 0 1-1.4-.811" />
    </svg>
  );
}

function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  if (name === "leaf" || name === "sprout") return <LeafMark size={size} />;
  return (
    <svg
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
      {PATHS[name]}
    </svg>
  );
}

function WhatsappGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.2.4-.4.5-.5.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3M12.1 21.8h-.1a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 0 1-1.5-5.3c0-5.4 4.4-9.9 9.9-9.9 2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.4-4.4 9.9-9.9 9.9m8.4-18.3A11.8 11.8 0 0 0 12.1 0C5.5 0 .2 5.3.1 11.9c0 2.1.6 4.1 1.6 6L0 24l6.3-1.7c1.8 1 3.7 1.4 5.7 1.4h.1c6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4Z" />
    </svg>
  );
}

/* --- section ------------------------------------------------------------ */

export default function Heading() {
  const [loaded, setLoaded] = useState(false);
  const aosRef = useRef<HTMLElement | null>(null);
  useAosReveal(aosRef);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <section className={"heading-section" + (loaded ? " heading-loaded" : " heading-enter")} ref={aosRef as any}>

      <div className="heading-photo">
        <div className="heading-canvas">
          <h1
            className="heading-title"
            style={{ fontSize: "clamp(25px, 2.8vw, 41px)", fontWeight: 900, WebkitTextStroke: "0.4px currentColor" }}
          >
            <span>Transformamos</span>
            <strong>Resíduos em Valor</strong>
            <span>para sua Empresa</span>
          </h1>

          <p className="heading-subtitle">
            Soluções completas para coleta, transporte, tratamento e destinação
            sustentável de resíduos orgânicos.
          </p>

          <div className="heading-ctas">
            <a
              className="heading-btn heading-btn-wa"
              style={{ fontSize: "13px", minHeight: "47px", padding: "0 23px" }}
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappGlyph />
              Fale pelo WhatsApp
              <Glyph name="arrow" size={16} />
            </a>
            <a
              className="heading-btn heading-btn-ghost"
              style={{ fontSize: "13px", minHeight: "47px", padding: "0 23px" }}
              href="/solucoes#como-funciona"
            >
              <Glyph name="play" size={16} />
              Cómo funciona
            </a>
          </div>

          <ul className="heading-points" style={{ transform: "translateY(9px)" }}>
            {POINTS.map((point) => (
              <li key={point.icon}>
                <Glyph name={point.icon} size={23} />
                <span className="heading-points-label">
                  <span>{point.lines[0]}</span>
                  <span>{point.lines[1]}</span>
                </span>
              </li>
            ))}
          </ul>

          <ul className="heading-segments">
            {SEGMENTS.map((segment) => (
              <li key={segment.label} className="heading-segment">
                <span className="heading-segment-icon">
                  <Glyph name={segment.icon} size={22} />
                </span>
                <div className="heading-segment-body">
                  <p className="heading-segment-title">
                    {segment.label}
                    <Glyph name="arrow" size={15} />
                  </p>
                  <p className="heading-segment-text">{segment.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="trusted-strip" data-aos="fade-up" aria-label="Empresas que confiam na Organoeste">
        <p className="trusted-strip-label">Empresas que confiam na Organoeste</p>
        <div className="trusted-marquee">
          <div className="trusted-track">
            {TRUSTED_LOGOS.map((logo) => (
              <img key={logo.src} src={logo.src} alt={logo.alt} className="trusted-logo" loading="lazy" />
            ))}
            {TRUSTED_LOGOS.map((logo) => (
              <img key={"dup-" + logo.src} src={logo.src} alt="" aria-hidden="true" className="trusted-logo" loading="lazy" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

