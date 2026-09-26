/* Solutions hero — TRUST badge, headline, supporting copy, CTAs and the four
   segment cards, over the OLAM fleet photo. */
import SolIcon, { WhatsappGlyph } from "./solutions-icons";
import { WA_MAIN } from "./solutions-content";

const SEGMENTS = [
  { icon: "factory", label: "Indústrias" },
  { icon: "cart", label: "Supermercados" },
  { icon: "kit", label: "Frigoríficos" },
  { icon: "utensils", label: "Restaurantes" },
];

export default function SolutionsHero() {
  return (
    <section className="sol-hero">
      <div className="sol-wrap">
        <p className="sol-badge">
          <span className="sol-badge-dot" aria-hidden="true">
            <SolIcon name="leaf" size={12} />
          </span>
          Nós cuidamos de todo o processo.
        </p>
        <h1 className="sol-hero-title">
          Transformamos <strong>Resíduos</strong> em <strong>Valor</strong>
          <br />
          para sua <strong>Empresa</strong>
        </h1>
        <p className="sol-hero-sub">
          Soluções completas para coleta, transporte, tratamento e destinação
          sustentável de resíduos orgânicos.
        </p>
        <div className="sol-hero-ctas">
          <a className="sol-btn sol-btn-wa" href={WA_MAIN} target="_blank" rel="noopener noreferrer">
            <WhatsappGlyph />
            Fale pelo WhatsApp
          </a>
          <a className="sol-btn sol-btn-ghost" href="#como-funciona">
            Entender como funciona ↓
          </a>
        </div>
        <ul className="sol-hero-points" aria-label="Diferenciais">
          <li>
            <SolIcon name="shield" size={16} />
            Segurança e responsabilidade
          </li>
          <li>
            <SolIcon name="headset" size={16} />
            Atendimento personalizado
          </li>
        </ul>
        <ul className="sol-segments" aria-label="Segmentos atendidos">
          {SEGMENTS.map((seg) => (
            <li key={seg.label} className="sol-segment">
              <span className="sol-segment-icon" aria-hidden="true">
                <SolIcon name={seg.icon} size={26} />
              </span>
              <span>{seg.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
