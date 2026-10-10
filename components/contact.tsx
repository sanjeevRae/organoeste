// Contact info card - static server component (no client JS needed).
import type { ReactNode } from "react";

const WA_LINK = "https://wa.me/5567992401937";
const EMAIL = "comerical@organoeste.com.br";
const PHONE_LABEL = "+55 (67) 99240-1937";
const PHONE_HREF = "tel:+5567992401937";

function TileIcon({ children }: { children: ReactNode }) {
  return (
    <span className="contact-tile-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {children}
      </svg>
    </span>
  );
}

const ICONS: Record<string, ReactNode> = {
  building: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
      <path d="M17 9h2a2 2 0 0 1 2 2v10" />
      <path d="M2 21h20" />
      <path d="M8 7h5M8 11h5M8 15h5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2.05Z" />
  ),
  leaf: (
    <>
      <path d="M5 21c0-8.5 4.5-13.5 14-14-.5 9.5-5.5 14-14 14Z" />
      <path d="M5 21c2.5-2.5 5.5-5.5 9-9" />
    </>
  ),
};

export default function Contact() {
  return (
    <section className="contact-section" id="contato" aria-labelledby="contact-title">
      <div className="block-overlay" />
      <div className="canvas">
        <div className="contact-intro">
          <p className="contact-eyebrow">
            <strong>Entre em Contato</strong>
          </p>
          <h2 className="contact-title" id="contact-title">
            É UM GRANDE GERADOR DE RESÍDUO ORGÂNICO?
          </h2>
          <p className="contact-description">
            Conte para a nossa equipe o volume, o segmento e a localização da sua
            operação e descubra a solução certa dentro do ecossistema Organoeste.
          </p>
        </div>
        <div className="contact-card">
          <div className="contact-tiles">
            <div className="contact-tile">
              <TileIcon>{ICONS.building}</TileIcon>
              <span className="contact-tile-text">Organoeste</span>
            </div>
            <a className="contact-tile" href={`mailto:${EMAIL}`}>
              <TileIcon>{ICONS.mail}</TileIcon>
              <span className="contact-tile-text">{EMAIL}</span>
            </a>
            <a className="contact-tile" href={PHONE_HREF}>
              <TileIcon>{ICONS.phone}</TileIcon>
              <span className="contact-tile-text">{PHONE_LABEL}</span>
            </a>
            <div className="contact-tile">
              <TileIcon>{ICONS.leaf}</TileIcon>
              <span className="contact-tile-text">Coleta e compostagem orgânica</span>
            </div>
          </div>
          <a
            className="contact-card-cta"
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fale Conosco
          </a>
        </div>
      </div>
    </section>
  );
}