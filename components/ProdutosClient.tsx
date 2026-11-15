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


function BenefitIcon({ icon }: { icon: BenefitIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 25,
    height: 25,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  switch (icon) {
    case "nitrogenio":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.4" />
          <circle cx="5.8" cy="6.2" r="1.7" />
          <circle cx="18.2" cy="6.2" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
          <path d="M10.2 10.2 7.2 7.6M13.8 10.2l3-2.6M12 14.4v2.9" />
        </svg>
      );
    case "carbono":
      return (
        <svg {...common}>
          <path d="M10 3h4M10.5 3v5L5.8 17a2.3 2.3 0 0 0 2 3.5h8.4a2.3 2.3 0 0 0 2-3.5L13.5 8V3" />
          <path d="M8 15h8" />
        </svg>
      );
    case "decomposicao":
      return (
        <svg {...common}>
          <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
          <path d="M21.5 3.5v4h-4" />
        </svg>
      );
    case "crescimento":
      return (
        <svg {...common}>
          <path d="M11 21v-7" />
          <path d="M11 14c0-3.6 2.7-5.6 7-5.6 0 4.3-2 6.9-7 5.6Z" />
          <path d="M11 14c0-3.6-2.7-5.6-7-5.6 0 4.3 2 6.9 7 5.6Z" />
          <path d="M19.5 8.5v-5M16.8 5.8l2.7-2.7 2.7 2.7" />
        </svg>
      );
    case "solo":
      return (
        <svg {...common}>
          <path d="M12 3l7 2.4v5.1c0 4.6-2.9 7.6-7 9.5-4.1-1.9-7-4.9-7-9.5V5.4L12 3Z" />
          <path d="m9 11.6 2.1 2.1 4-4.2" />
        </svg>
      );
    case "nutrientes":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <circle cx="9" cy="9" r="0.6" fill="currentColor" />
          <circle cx="15" cy="9" r="0.6" fill="currentColor" />
          <circle cx="9" cy="15" r="0.6" fill="currentColor" />
          <circle cx="15" cy="15" r="0.6" fill="currentColor" />
        </svg>
      );
    case "soluvel":
      return (
        <svg {...common}>
          <path d="M12 3.5s6.3 6.8 6.3 11.2a6.3 6.3 0 1 1-12.6 0C5.7 10.3 12 3.5 12 3.5Z" />
          <path d="M9.4 14.8a2.8 2.8 0 0 0 2 3" />
        </svg>
      );
    case "raizes":
      return (
        <svg {...common}>
          <path d="M4 4h16" />
          <path d="M12 4v5" />
          <path d="M12 9c-2.2 1.2-3.2 3.2-3.6 6.5M12 9c2.2 1.2 3.2 3.2 3.6 6.5M12 9v11" />
        </svg>
      );
    case "agua":
      return (
        <svg {...common}>
          <path d="M12 3s3.7 4.1 3.7 6.7a3.7 3.7 0 1 1-7.4 0C8.3 7.1 12 3 12 3Z" />
          <path d="M2.8 17.2c2.9-2.1 5.8-2.1 8.7 0 2.9-2.1 5.8-2.1 8.7 0M2.8 21c2.9-2.1 5.8-2.1 8.7 0 2.9-2.1 5.8-2.1 8.7 0" />
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
