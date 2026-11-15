"use client";

import { useEffect, useRef, useState } from "react";
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

const VIDEO_SRC = "https://organoeste-biometano.pages.dev/video/master.m3u8";

function UvroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = VIDEO_SRC;
      return;
    }
    let hls: { destroy: () => void } | undefined;
    let cancelled = false;
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !Hls.isSupported()) return;
      const instance = new Hls();
      instance.loadSource(VIDEO_SRC);
      instance.attachMedia(video);
      hls = instance;
    });
    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, []);

  return (
    <video
      ref={ref}
      className="np-video-el"
      controls
      playsInline
      preload="none"
      poster="/images/uvro-poster.webp"
      aria-label="Vídeo do processo de biogás em rota seca do projeto UVRO-SECA"
    />
  );
}

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
    | { kind: "video"; alt: string };
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
    media: { kind: "video", alt: "Vídeo do processo UVRO-SECA" },
  },
];

const STATS = [
  { value: "5.000 t/mês", label: "de resíduos agroindustriais orgânicos recebidos" },
  { value: "500 t/mês", label: "de biomassa vegetal processada" },
  { value: "100.000 t", label: "de adubo orgânico disponível" },
  { value: "até 10 dias", label: "para a bioconversão pelas larvas — 4× mais rápida que a compostagem" },
];

type StepIcon = "recepcao" | "compostagem" | "beneficiamento" | "energia" | "bioconversao";
type FlowStep = { name: string; desc: string; icon: StepIcon; isNew?: boolean };
type Flow = { id: string; label: string; isNew?: boolean; summary: string; steps: FlowStep[] };

const FLOWS: Flow[] = [
  {
    id: "hoje",
    label: "Hoje",
    summary:
      "O processo atual da Organoeste Campo Grande/MS: os resíduos orgânicos são recebidos, compostados e beneficiados até virarem o fertilizante OrganoSuper.",
    steps: [
      { name: "Recepção", desc: "Recebimento e triagem dos resíduos orgânicos", icon: "recepcao" },
      { name: "Compostagem", desc: "Leiras controladas transformam o resíduo em composto", icon: "compostagem" },
      { name: "Beneficiamento", desc: "Peneiramento e preparo do fertilizante OrganoSuper", icon: "beneficiamento" },
    ],
  },
  {
    id: "uvro",
    label: "UVRO-SECA",
    isNew: true,
    summary:
      "Com o UVRO-SECA, antes da compostagem o resíduo passa pelas garagens de digestão anaeróbica em rota seca e gera biometano como combustível veicular.",
    steps: [
      { name: "Recepção", desc: "Recebimento e triagem dos resíduos orgânicos", icon: "recepcao" },
      { name: "Geração energética em garagens", desc: "Garagens vedadas captam o biogás e geram biometano", icon: "energia", isNew: true },
      { name: "Compostagem", desc: "Leiras controladas transformam o resíduo em composto", icon: "compostagem" },
      { name: "Beneficiamento", desc: "Peneiramento e preparo do fertilizante OrganoSuper", icon: "beneficiamento" },
    ],
  },
  {
    id: "biofrass",
    label: "BioFrass",
    isNew: true,
    summary:
      "Com o BioFrass, as larvas da mosca-soldado-negra fazem a bioconversão do resíduo em até 10 dias, gerando o frass — base do biofertilizante de nova geração.",
    steps: [
      { name: "Recepção", desc: "Recebimento e triagem dos resíduos orgânicos", icon: "recepcao" },
      { name: "Bioconversão / vermicompostagem", desc: "Larvas convertem o resíduo em frass em até 10 dias", icon: "bioconversao", isNew: true },
      { name: "Beneficiamento", desc: "Inoculação dos microrganismos e preparo do produto", icon: "beneficiamento" },
    ],
  },
];

function StepIconSvg({ icon }: { icon: StepIcon }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 26,
    height: 26,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  switch (icon) {
    case "recepcao":
      return (
        <svg {...common}>
          <path d="M12 3v10" />
          <path d="m7.5 9.5 4.5 4 4.5-4" />
          <path d="M3.5 15.5h4l1.7 2.6h5.6l1.7-2.6h4" />
          <path d="M4.5 21h15" />
        </svg>
      );
    case "compostagem":
      return (
        <svg {...common}>
          <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
          <path d="M21.5 3.5v4h-4" />
        </svg>
      );
    case "beneficiamento":
      return (
        <svg {...common}>
          <path d="M12 21v-7" />
          <path d="M12 14c0-3.8 2.9-5.9 7.5-5.9 0 4.6-2.1 7.4-7.5 5.9Z" />
          <path d="M12 14c0-3.8-2.9-5.9-7.5-5.9 0 4.6 2.1 7.4 7.5 5.9Z" />
        </svg>
      );
    case "energia":
      return (
        <svg {...common}>
          <path d="M13 2.5 4.5 13.5H11L9.8 21.5l8.7-11H12l1-8Z" />
        </svg>
      );
    case "bioconversao":
      return (
        <svg {...common}>
          <circle cx="12" cy="5.5" r="2" />
          <rect x="8" y="8.5" width="8" height="10" rx="4" />
          <path d="M8.5 12H4.8M8.5 16.5l-3 2M15.5 12h3.7M15.5 16.5l3 2" />
        </svg>
      );
  }
}

export default function PesquisaClient() {
  const rootRef = useRef<HTMLElement | null>(null);
  useAosReveal(rootRef);
  const [activeFlow, setActiveFlow] = useState(1);
  const flow = FLOWS[activeFlow];

  return (
    <main ref={rootRef} className={`np-page ${poppins.variable}`}>
      {/* ---------- HERO ---------- */}
      <section className="np-hero">
        <div className="np-wrap">
          <div className="np-hero-content">
            <span className="np-eyebrow">Inovação é o que nos move</span>
            <h1>Pesquisa &amp; Desenvolvimento</h1>
            <p>
              Com a aprovação dos projetos, o processo da Organoeste Campo
              Grande/MS (hoje recepção, compostagem e beneficiamento) passa a
              incluir duas novas fases produtivas.
            </p>
          </div>
        </div>
        <div className="np-hero-media" aria-hidden="true">
          <img src="/images/pd-hero.jpg" alt="" />
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
                    <UvroVideo />
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

      {/* ---------- ECONOMIA CIRCULAR / NÚMEROS ---------- */}
      <section className="np-section np-section-white">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head">
              <span className="np-eyebrow np-eyebrow-brown">Economia circular</span>
              <h2 className="np-title">Do resíduo ao recurso</h2>
            </div>
          </Reveal>
          <div className="np-cycle">
            <div className="np-cycle-img">
              <img
                src="/images/pd-ciclo.jpg"
                alt="Diagrama da economia circular: resíduos orgânicos viram fertilizante, proteína e energia"
              />
            </div>
            <div>
              <p className="np-cycle-text">
                A Organoeste já transforma resíduos orgânicos em fertilizante.
                Com os dois projetos aprovados, o mesmo resíduo passa a gerar
                ainda mais valor: biometano como combustível renovável
                (UVRO-SECA) e um biofertilizante de nova geração a partir da
                bioconversão pelas larvas da mosca-soldado-negra (BioFrass) —
                fechando o ciclo do resíduo ao recurso.
              </p>
              <div className="np-stats">
                {STATS.map((s) => (
                  <div className="np-stat" key={s.label}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PROCESSO INTERATIVO ---------- */}
      <section className="np-section np-section-alt">
        <div className="np-wrap">
          <Reveal>
            <div className="np-section-head">
              <span className="np-eyebrow np-eyebrow-brown">Como o processo muda</span>
              <h2 className="np-title">Duas novas fases produtivas</h2>
              <p className="np-section-sub">
                Toque em cada fluxo e veja, passo a passo, como o processo
                evolui com os projetos aprovados.
              </p>
            </div>
          </Reveal>
          <div className="np-ptabs" role="tablist" aria-label="Fluxos do processo">
            {FLOWS.map((f, i) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={i === activeFlow}
                className={i === activeFlow ? "np-ptab np-ptab-active" : "np-ptab"}
                onClick={() => setActiveFlow(i)}
                type="button"
              >
                {f.label}
                {f.isNew ? <span className="np-ptab-dot">Novo</span> : null}
              </button>
            ))}
          </div>
          <div className="np-pflow" key={flow.id}>
            {flow.steps.map((step, i) => (
              <div className="np-pstep-wrap" key={step.name} style={{ animationDelay: `${i * 130}ms` }}>
                <div className={step.isNew ? "np-pstep np-pstep-new" : "np-pstep"}>
                  <span className="np-pstep-icon">
                    <StepIconSvg icon={step.icon} />
                  </span>
                  <strong>
                    {step.name}
                    {step.isNew ? <em className="np-new-tag">Nova fase</em> : null}
                  </strong>
                  <small>{step.desc}</small>
                </div>
                {i < flow.steps.length - 1 ? (
                  <span className="np-parrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <p className="np-pflow-summary">{flow.summary}</p>
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
