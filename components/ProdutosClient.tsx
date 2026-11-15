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
const WA_QUOTE = `${WA}?text=${encodeURIComponent(
  "Olá! Gostaria de solicitar um orçamento do OrganoSuper."
)}`;

type Format = {
  tag: string;
  title: string;
  description: string;
  media:
    | { kind: "image"; src: string; alt: string }
    | { kind: "reel"; embedUrl: string; title: string };
  instagram?: { label: string; href: string };
};

const FORMATS: Format[] = [
  {
    tag: "Casa e jardim",
    title: "Fertipower",
    description:
      "Composto orgânico multivitamínico concentrado de alta performance para as suas verdinhas. Ideal para vasos, jardins e hortas.",
    media: {
      kind: "reel",
      embedUrl: "https://www.instagram.com/reel/DXqDcHHlbdx/embed",
      title: "Reel do Fertipower no Instagram",
    },
    instagram: {
      label: "@fertipowerbrasil",
      href: "https://www.instagram.com/fertipowerbrasil",
    },
  },
  {
    tag: "Produtor rural",
    title: "Vendas a granel",
    description:
      "Para produtores rurais, HF e cooperativas agrícolas. Pode ser enriquecido com fontes minerais (organomineral). Serve para todas as culturas: pastagem, HF, fruticultura, grãos e cana-de-açúcar. Rico em ácidos orgânicos, húmicos e fúlvicos.",
    media: {
      kind: "image",
      src: "/images/produtos-granel.jpg",
      alt: "Caminhão da Organoeste carregado para vendas a granel",
    },
  },
  {
    tag: "Floricultura e paisagismo",
    title: "Sacos de 40 kg",
    description:
      "Para floricultura, jardinagem, hortas e paisagismo. Vendemos direto na fábrica e em casas agropecuárias.",
    media: {
      kind: "image",
      src: "/images/produtos-sacos.jpg",
      alt: "Sacos de fertilizante orgânico na fábrica da Organoeste",
    },
  },
];

const BENEFITS: { title: string; text: string }[] = [
  {
    title: "Fixação do nitrogênio",
    text: "Potencializa a absorção do nitrogênio presente no ar, em frações disponíveis para a planta.",
  },
  {
    title: "Rico em carbono e ácidos orgânicos",
    text: "Cria um ciclo virtuoso de recuperação do solo e da sua capacidade produtiva.",
  },
  {
    title: "Acelera a decomposição da matéria orgânica",
    text: "Libera nutrientes e ácidos que ajudam a reter água e proteger os nutrientes.",
  },
  {
    title: "Produção de fito-hormônios de crescimento",
    text: "Microrganismos produzem hormônios semelhantes aos vegetais, estimulando o crescimento.",
  },
  {
    title: "Tratamento e recuperação do solo",
    text: "Reequilíbrio físico, químico e biológico da biota do solo.",
  },
  {
    title: "Nutrição com macro e micronutrientes",
    text: "Fornece seis macronutrientes e seis micronutrientes essenciais.",
  },
  {
    title: "Solubilização de fósforo e potássio",
    text: "Torna o fósforo e o potássio mais facilmente absorvíveis pelas plantas.",
  },
  {
    title: "Maior capacidade de enraizamento",
    text: "Os microrganismos estimulados promovem um enraizamento mais forte.",
  },
  {
    title: "Capacidade de retenção de água",
    text: "Planta mais resistente a veranicos e estiagem.",
  },
];

const GUARANTEES: { item: string; value: string }[] = [
  { item: "Umidade (máx.)", value: "50%" },
  { item: "Carbono orgânico", value: "15%" },
  { item: "Relação C/N (máx.)", value: "20" },
  { item: "pH", value: "6,0" },
  { item: "Nitrogênio total", value: "0,5%" },
  { item: "CTC", value: "80 mmolc/kg" },
];

export default function ProdutosClient() {
  const rootRef = useRef<HTMLElement | null>(null);
  useAosReveal(rootRef);

  return (
    <main ref={rootRef} className={`np-page ${poppins.variable}`}>
      {/* ---------- HERO ---------- */}
      <section className="np-hero">
        <div className="np-wrap np-hero-grid">
          <div>
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
          <div className="np-hero-img">
            <img
              src="/images/produtos-hero.jpg"
              alt="Muda brotando em solo fértil tratado com OrganoSuper"
            />
          </div>
        </div>
      </section>

      {/* ---------- COMO COMPRAR ---------- */}
      <section className="np-section">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head">
              <span className="np-eyebrow np-eyebrow-brown">Como comprar</span>
              <h2 className="np-title">Escolha a forma ideal para você</h2>
            </div>
          </Reveal>
          <div className="np-grid3">
            {FORMATS.map((f) => (
              <article className="np-card" key={f.title}>
                <div className="np-card-media">
                  {f.media.kind === "image" ? (
                    <img src={f.media.src} alt={f.media.alt} />
                  ) : (
                    <div className="np-reel">
                      <iframe
                        src={f.media.embedUrl}
                        title={f.media.title}
                        loading="lazy"
                        allowFullScreen
                        scrolling="no"
                      />
                    </div>
                  )}
                  <span className="np-tag">{f.tag}</span>
                </div>
                <div className="np-card-body">
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                  <div className="np-card-links">
                    {f.instagram ? (
                      <a
                        className="np-link"
                        href={f.instagram.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {f.instagram.label}
                      </a>
                    ) : null}
                    <a
                      className="np-link"
                      href={WA_QUOTE}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
                <span className="np-bnum">{i + 1}</span>
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
