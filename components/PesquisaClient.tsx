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
const WA_PROJECTS = `${WA}?text=${encodeURIComponent(
  "Olá! Gostaria de saber mais sobre os projetos de Pesquisa & Desenvolvimento da Organoeste."
)}`;

type Project = {
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
  highlight: { strong: string; rest: string };
  note?: string;
  partners: string[];
  media:
    | { kind: "image"; src: string; alt: string }
    | { kind: "video-slot"; poster: string; alt: string; label: string };
};

/** New approved projects are added here — the cards render from this list. */
const PROJECTS: Project[] = [
  {
    title: "BioFrass",
    subtitle:
      "Bioprospecção de microrganismos para promoção de crescimento e controle sanitário vegetal a partir do cultivo de mosca-soldado-negra",
    description:
      "Biofertilizante orgânico de nova geração a partir de resíduos agroindustriais transformados pelas larvas da mosca-soldado-negra. Usamos metagenômica para identificar os microrganismos mais promissores do próprio frass e os inoculamos de volta no produto, junto com o fungo Trichoderma harzianum.",
    badges: ["Aprovado"],
    highlight: {
      strong: "87%",
      rest: " do consumo brasileiro de fertilizantes é importado. Uma solução 100% nacional.",
    },
    note: "Potencial adicional: produção de proteína de inseto a partir da desidratação da larva.",
    partners: ["Organoeste", "Organo Compost", "ISI Biomassa (SENAI)"],
    media: {
      kind: "image",
      src: "/images/pd-biofrass.jpg",
      alt: "Larvas de mosca-soldado-negra cultivadas no projeto BioFrass",
    },
  },
  {
    title: "UVRO-SECA",
    subtitle:
      "Valorização da fração orgânica dos resíduos sólidos via digestão anaeróbica em rota seca, para produção de biometano como combustível veicular",
    description:
      "Captar biogás a partir de resíduos com menor umidade, por uma rota semi-sólida, compatível com a compostagem posterior. O material é acondicionado em “garagens” vedadas, com sistema de controle e circulação para captação do metano gerado.",
    badges: ["Aprovado", "Projeto aprovado – FINEP"],
    highlight: {
      strong: "Combustível renovável",
      rest: " para frotas logísticas: um passo rumo à transição energética e à descarbonização.",
    },
    partners: ["CIBiogás", "UTFPR"],
    media: {
      kind: "video-slot",
      poster: "/images/pd-uvro.jpg",
      alt: "Galpões da planta da Organoeste em Campo Grande/MS",
      label: "Vídeo do projeto em edição",
    },
  },
];

type Flow = { label: string; steps: { name: string; isNew?: boolean }[] };

const FLOWS: Flow[] = [
  {
    label: "Hoje",
    steps: [{ name: "Recepção" }, { name: "Compostagem" }, { name: "Beneficiamento" }],
  },
  {
    label: "UVRO-SECA",
    steps: [
      { name: "Recepção" },
      { name: "Geração energética em garagens", isNew: true },
      { name: "Compostagem" },
      { name: "Beneficiamento" },
    ],
  },
  {
    label: "BioFrass",
    steps: [
      { name: "Recepção" },
      { name: "Bioconversão / vermicompostagem", isNew: true },
      { name: "Beneficiamento" },
    ],
  },
];

export default function PesquisaClient() {
  const rootRef = useRef<HTMLElement | null>(null);
  useAosReveal(rootRef);

  return (
    <main ref={rootRef} className={`np-page ${poppins.variable}`}>
      {/* ---------- HERO ---------- */}
      <section className="np-hero">
        <div className="np-wrap np-hero-grid">
          <div>
            <span className="np-eyebrow">Inovação é o que nos move</span>
            <h1>Pesquisa &amp; Desenvolvimento</h1>
            <p>
              Com a aprovação dos projetos, o processo da Organoeste Campo
              Grande/MS (hoje recepção, compostagem e beneficiamento) passa a
              incluir duas novas fases produtivas.
            </p>
          </div>
          <div className="np-hero-img">
            <img
              src="/images/pd-hero.jpg"
              alt="Planta de compostagem da Organoeste em Campo Grande/MS"
            />
          </div>
        </div>
      </section>

      {/* ---------- PROJETOS ---------- */}
      <section className="np-section">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head">
              <span className="np-eyebrow np-eyebrow-brown">Nossos projetos</span>
              <h2 className="np-title">Dois projetos aprovados</h2>
            </div>
          </Reveal>
          <div className="np-grid2">
            {PROJECTS.map((p) => (
              <article className="np-card" key={p.title}>
                <div className="np-card-media">
                  {p.media.kind === "image" ? (
                    <img src={p.media.src} alt={p.media.alt} />
                  ) : (
                    <div className="np-video">
                      <img src={p.media.poster} alt={p.media.alt} />
                      <div className="np-video-overlay">
                        <span className="np-play" aria-hidden="true">
                          ▶
                        </span>
                        <span className="np-video-label">{p.media.label}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="np-card-body">
                  <div className="np-badges">
                    {p.badges.map((b, i) => (
                      <span className={i === 0 ? "np-badge" : "np-badge np-badge-alt"} key={b}>
                        {b}
                      </span>
                    ))}
                  </div>
                  <h3>{p.title}</h3>
                  <p className="np-subtitle">{p.subtitle}</p>
                  <p>{p.description}</p>
                  <div className="np-highlight">
                    <strong>{p.highlight.strong}</strong>
                    {p.highlight.rest}
                  </div>
                  {p.note ? <div className="np-note">{p.note}</div> : null}
                  <div className="np-partners">
                    <span className="np-partners-label">Parceiros</span>
                    <div className="np-chips">
                      {p.partners.map((name) => (
                        <span className="np-chip" key={name}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PROCESSO ---------- */}
      <section className="np-section np-section-alt">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head">
              <span className="np-eyebrow np-eyebrow-brown">Como o processo muda</span>
              <h2 className="np-title">Duas novas fases produtivas</h2>
            </div>
          </Reveal>
          <div className="np-flows">
            {FLOWS.map((flow) => (
              <div className="np-flow" key={flow.label}>
                <span className="np-flow-label">{flow.label}</span>
                <div className="np-steps">
                  {flow.steps.map((step, i) => (
                    <span className="np-step-wrap" key={step.name}>
                      <span className={step.isNew ? "np-step np-step-new" : "np-step"}>
                        {step.name}
                        {step.isNew ? <em className="np-new-tag">Nova fase</em> : null}
                      </span>
                      {i < flow.steps.length - 1 ? (
                        <span className="np-arrow" aria-hidden="true">
                          →
                        </span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="np-cta">
        <div className="np-wrap">
          <h2>Quer saber mais sobre nossos projetos?</h2>
          <p>Fale com a nossa equipe.</p>
          <a className="np-btn" href={WA_PROJECTS} target="_blank" rel="noopener noreferrer">
            Fale conosco no WhatsApp <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
