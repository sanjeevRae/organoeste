"use client";

import { useRef } from "react";
import { Poppins } from "next/font/google";
import Reveal from "./Reveal";
import { useAosReveal } from "./useAosReveal";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const WA = "https://wa.me/5567992401937";
const waText = (text: string) => `${WA}?text=${encodeURIComponent(text)}`;
const WA_QUOTE = waText("Olá! Gostaria de solicitar um orçamento do OrganoSuper.");

const KITS = [
  {
    name: "Kit Mais Vendido",
    units: "2 unidades",
    tagline:
      "O kit perfeito para transformar mais ambientes da sua casa com o melhor custo-benefício.",
    img: "/images/fertipower-kit2.png",
    wa: waText("Olá! Quero saber mais sobre o Kit Mais Vendido (2 unidades) do Fertipower."),
  },
  {
    name: "Kit Casa Viva",
    units: "3 unidades",
    tagline: "Mais vida, beleza e equilíbrio para todos os ambientes.",
    img: "/images/fertipower-kit3.png",
    wa: waText("Olá! Quero saber mais sobre o Kit Casa Viva (3 unidades) do Fertipower."),
  },
  {
    name: "Kit Premium",
    units: "4 unidades",
    tagline: "A experiência completa para quem quer ambientes realmente vivos.",
    img: "/images/fertipower-kit4.png",
    wa: waText("Olá! Quero saber mais sobre o Kit Premium (4 unidades) do Fertipower."),
  },
];

const POUCH_POINTS = [
  "Produto esterilizado e natural",
  "Isento de patógenos e sementes daninhas",
  "Rico em macro e micronutrientes",
  "Ideal para todas as espécies de plantas",
];

const FORMATS = [
  {
    tag: "Produtor rural",
    title: "Vendas a granel",
    description:
      "Para produtores rurais, HF e cooperativas agrícolas. Pode ser enriquecido com fontes minerais (organomineral). Serve para todas as culturas: pastagem, HF, fruticultura, grãos e cana-de-açúcar. Rico em ácidos orgânicos, húmicos e fúlvicos.",
    img: "/images/produtos-granel.jpg",
    alt: "Caminhão da Organoeste carregado para vendas a granel",
    audience: ["Produtores rurais", "Viveiros de mudas", "Cooperativas", "Grandes áreas"],
  },
  {
    tag: "Floricultura e paisagismo",
    title: "Sacos de 40 kg",
    description:
      "Para floricultura, jardinagem, hortas e paisagismo. Vendemos direto na fábrica e em casas agropecuárias.",
    img: "/images/produtos-sacos.jpg",
    alt: "Sacos de fertilizante orgânico na fábrica da Organoeste",
    audience: ["Viveiros", "Floriculturas", "Paisagismo", "Casas agropecuárias"],
  },
];

type BenefitIconName =
  | "nitrogenio"
  | "carbono"
  | "decomposicao"
  | "crescimento"
  | "solo"
  | "nutrientes"
  | "soluvel"
  | "raizes"
  | "agua";

const BENEFITS: { title: string; text: string; icon: BenefitIconName }[] = [
  { icon: "nitrogenio", title: "Fixação do nitrogênio", text: "Potencializa a absorção do nitrogênio presente no ar, em frações disponíveis para a planta." },
  { icon: "carbono", title: "Rico em carbono e ácidos orgânicos", text: "Cria um ciclo virtuoso de recuperação do solo e da sua capacidade produtiva." },
  { icon: "decomposicao", title: "Acelera a decomposição da matéria orgânica", text: "Libera nutrientes e ácidos que ajudam a reter água e proteger os nutrientes." },
  { icon: "crescimento", title: "Produção de fito-hormônios de crescimento", text: "Microrganismos produzem hormônios semelhantes aos vegetais, estimulando o crescimento." },
  { icon: "solo", title: "Tratamento e recuperação do solo", text: "Reequilíbrio físico, químico e biológico da biota do solo." },
  { icon: "nutrientes", title: "Nutrição com macro e micronutrientes", text: "Fornece seis macronutrientes e seis micronutrientes essenciais." },
  { icon: "soluvel", title: "Solubilização de fósforo e potássio", text: "Torna o fósforo e o potássio mais facilmente absorvíveis pelas plantas." },
  { icon: "raizes", title: "Maior capacidade de enraizamento", text: "Os microrganismos estimulados promovem um enraizamento mais forte." },
  { icon: "agua", title: "Capacidade de retenção de água", text: "Planta mais resistente a veranicos e estiagem." },
];

const GUARANTEES: { item: string; value: string }[] = [
  { item: "Umidade (máx.)", value: "50%" },
  { item: "Carbono orgânico", value: "15%" },
  { item: "Relação C/N (máx.)", value: "20" },
  { item: "pH", value: "6,0" },
  { item: "Nitrogênio total", value: "0,5%" },
  { item: "CTC", value: "80 mmolc/kg" },
];


/** Benefit icons: official Lucide icon paths (lucide-static, ISC licensed). */
function BenefitIcon({ icon }: { icon: BenefitIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 25,
    height: 25,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  switch (icon) {
    case "nitrogenio":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1" />
          <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" />
          <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />
        </svg>
      );
    case "carbono":
      return (
        <svg {...common}>
          <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" />
          <path d="M6.453 15h11.094" />
          <path d="M8.5 2h7" />
        </svg>
      );
    case "decomposicao":
      return (
        <svg {...common}>
          <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
          <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
          <path d="m14 16-3 3 3 3" />
          <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
          <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
          <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
        </svg>
      );
    case "crescimento":
      return (
        <svg {...common}>
          <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" />
          <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" />
          <path d="M5 21h14" />
        </svg>
      );
    case "solo":
      return (
        <svg {...common}>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "nutrientes":
      return (
        <svg {...common}>
          <path d="M2 22 16 8" />
          <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
          <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
          <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
          <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
        </svg>
      );
    case "soluvel":
      return (
        <svg {...common}>
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case "raizes":
      return (
        <svg {...common}>
          <path d="M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3" />
          <path d="M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7" />
          <path d="m8 15-2.58-2.58" />
        </svg>
      );
    case "agua":
      return (
        <svg {...common}>
          <path d="M2 12q2.5 2 5 0t5 0 5 0 5 0" />
          <path d="M2 19q2.5 2 5 0t5 0 5 0 5 0" />
          <path d="M2 5q2.5 2 5 0t5 0 5 0 5 0" />
        </svg>
      );
  }
}

export default function ProdutosClient() {
  const rootRef = useRef<HTMLElement | null>(null);
  useAosReveal(rootRef);

  return (
    <main ref={rootRef} className={`np-page ${poppins.variable}`}>
      {/* ---------- HERO ---------- */}
      <section className="np-hero">
        <div className="np-wrap">
          <div className="np-hero-content">
            <span className="np-eyebrow">Fertilizante orgânico de alta performance</span>
            <h1>
              ORGANO<span className="np-lime">SUPER</span>
            </h1>
            <p>
              Nossos fertilizantes promovem o crescimento de microrganismos
              benéficos no solo. Um só produto registrado, em três formas de
              compra.
            </p>
            <a className="np-btn" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">
              Solicite orçamento <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="np-hero-media" aria-hidden="true">
          <img src="/images/produtos-hero.jpg" alt="" />
        </div>
      </section>

      {/* ---------- COMO COMPRAR ---------- */}
      <section className="np-section">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head np-head-wide">
              <span className="np-eyebrow np-eyebrow-brown">Como comprar</span>
              <h2 className="np-title">Escolha a forma ideal para você</h2>
            </div>
          </Reveal>

          {/* Fertipower — feature band */}
          <article className="np-feature">
            <div className="np-feature-visual">
              <img
                src="/images/fertipower-pouch.png"
                alt="Embalagem de 1 kg do Fertipower, fertilizante orgânico Classe A"
              />
              <span className="np-feature-chip">NPK+9 Orgânico · Classe A · 1 kg</span>
            </div>
            <div className="np-feature-body">
              <span className="np-tag np-tag-static">Casa e jardim</span>
              <h3>Fertipower</h3>
              <p>
                Composto orgânico multivitamínico concentrado de alta
                performance para as suas verdinhas. Ideal para vasos, jardins e
                hortas.
              </p>
              <div className="np-kits">
                {KITS.map((kit) => (
                  <div className="np-kit" key={kit.name}>
                    <img src={kit.img} alt="" aria-hidden="true" />
                    <div className="np-kit-info">
                      <strong>
                        {kit.name} <span>· {kit.units}</span>
                      </strong>
                      <small>{kit.tagline}</small>
                    </div>
                    <a
                      className="np-kit-btn"
                      href={kit.wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Pedir o ${kit.name} no WhatsApp`}
                    >
                      →
                    </a>
                  </div>
                ))}
              </div>
              <ul className="np-checks">
                {POUCH_POINTS.map((point) => (
                  <li key={point}>✓ {point}</li>
                ))}
              </ul>
              <div className="np-aud np-aud-dark">
                <span className="np-partners-label">Ideal para</span>
                <div className="np-chips">
                  {["Casas e apartamentos", "Vasos e jardins", "Hortas domésticas", "Urban jungle"].map(
                    (chip) => (
                      <span className="np-chip np-chip-dark" key={chip}>
                        {chip}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="np-card-links">
                <a
                  className="np-link np-link-light"
                  href="https://www.instagram.com/fertipowerbrasil"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @fertipowerbrasil
                </a>
                <a className="np-btn np-btn-sm" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">
                  Solicite orçamento
                </a>
              </div>
            </div>
            <div className="np-feature-reel">
              <iframe
                src="https://www.instagram.com/reel/DXqDcHHlbdx/embed"
                title="Reel do Fertipower no Instagram"
                loading="lazy"
                allowFullScreen
                scrolling="no"
              />
            </div>
          </article>

          {/* Granel + 40 kg */}
          <div className="np-grid2 np-formats-row">
            {FORMATS.map((f) => (
              <article className="np-card" key={f.title}>
                <div className="np-card-media">
                  <img src={f.img} alt={f.alt} />
                  <span className="np-tag">{f.tag}</span>
                </div>
                <div className="np-card-body">
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                  <div className="np-aud">
                    <span className="np-partners-label">Ideal para</span>
                    <div className="np-chips">
                      {f.audience.map((chip) => (
                        <span className="np-chip" key={chip}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="np-card-links">
                    <a className="np-link" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">
                      Solicite orçamento
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- BENEFÍCIOS ---------- */}
      <section className="np-section np-section-alt">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head">
              <span className="np-eyebrow np-eyebrow-brown">Por que OrganoSuper</span>
              <h2 className="np-title">Nove benefícios para o seu solo</h2>
            </div>
          </Reveal>
          <div className="np-bgrid">
            {BENEFITS.map((b, i) => (
              <article className="np-benefit" key={b.title}>
                <div className="np-benefit-top">
                  <span className="np-bicon">
                    <BenefitIcon icon={b.icon} />
                  </span>
                  <span className="np-bindex">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h4>{b.title}</h4>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- GARANTIAS / MAPA ---------- */}
      <section className="np-section">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head">
              <span className="np-eyebrow np-eyebrow-brown">Garantias do registro MAPA</span>
              <h2 className="np-title">Fertilizante Orgânico Composto, Classe A</h2>
            </div>
          </Reveal>
          <div className="np-guar">
            <div className="np-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Garantia</th>
                  </tr>
                </thead>
                <tbody>
                  {GUARANTEES.map((g) => (
                    <tr key={g.item}>
                      <td>{g.item}</td>
                      <td>{g.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <aside className="np-mapa">
              <span className="np-mapa-badge" aria-hidden="true">
                ✓
              </span>
              <h4>Registrado no MAPA</h4>
              <div className="np-mapa-row">
                <span>Estabelecimento</span>
                <strong>EP MS 000993-8</strong>
              </div>
              <div className="np-mapa-row">
                <span>Produto</span>
                <strong>MS 000993-8.000001</strong>
              </div>
              <p className="np-mapa-note">
                Registro no Ministério da Agricultura e Pecuária (MAPA).
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="np-cta">
        <div className="np-wrap">
          <h2>Pronto para mais produtividade?</h2>
          <p>Fale com a nossa equipe e receba um orçamento.</p>
          <a className="np-btn" href={WA_QUOTE} target="_blank" rel="noopener noreferrer">
            Solicite orçamento no WhatsApp <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
