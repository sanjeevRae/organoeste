/* Heading — top band of the home page (before Hero): the OLAM trucks artwork
   (public/images/solution.png) as the full-width background, carrying the main
   headline, the two CTAs, the trust badges and the four segments card.
   Styles are namespaced as .heading-* in app/site.css. */

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
  leaf: (
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2.5 1.5 6.5-1.5 11-2 3-5.5 6-8.5 7Zm0 0c-1.5-4 1-9 5-11" />
  ),
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

function Glyph({ name, size = 20 }: { name: string; size?: number }) {
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
  return (
    <section className="heading-section">
      <div className="heading-photo">
        <div className="heading-canvas">
          <h1
            className="heading-title"
            style={{ fontSize: "clamp(30px, 3.4vw, 50px)", fontWeight: 900, WebkitTextStroke: "0.4px currentColor" }}
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
              style={{ fontSize: "14.5px", minHeight: "52px", padding: "0 26px" }}
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappGlyph />
              Fale pelo WhatsApp
              <Glyph name="arrow" size={18} />
            </a>
            <a
              className="heading-btn heading-btn-ghost"
              style={{ fontSize: "14.5px", minHeight: "52px", padding: "0 26px" }}
              href="/solucoes#como-funciona"
            >
              <Glyph name="play" size={18} />
              Cómo funciona
            </a>
          </div>

          <ul className="heading-points" style={{ transform: "translateY(10px)" }}>
            {POINTS.map((point) => (
              <li key={point.icon}>
                <Glyph name={point.icon} size={26} />
                <span className="heading-points-label">
                  <span>{point.lines[0]}</span>
                  <span>{point.lines[1]}</span>
                </span>
              </li>
            ))}
          </ul>

          <ul className="heading-segments" style={{ transform: "translateY(-10px)" }}>
            {SEGMENTS.map((segment) => (
              <li key={segment.label} className="heading-segment">
                <span className="heading-segment-icon">
                  <Glyph name={segment.icon} size={24} />
                </span>
                <div className="heading-segment-body">
                  <p className="heading-segment-title">
                    {segment.label}
                    <Glyph name="arrow" size={17} />
                  </p>
                  <p className="heading-segment-text">{segment.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="trusted-strip" aria-label="Empresas que confiam na Organoeste">
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

