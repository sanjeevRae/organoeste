"use client";
import { useRef, useState } from "react";

import Reveal from "./Reveal";
import Hero from "./Hero";
import { useAosReveal } from "./useAosReveal";

const WA_MAIN = "https://wa.me/5567992401937";
const WA_SUPPORT = "https://wa.me/5567999915740";

type ServiceCard = { icon: string; title: string; description: string };

const SERVICES: ServiceCard[] = [
  {
    icon: "clipboard",
    title: "Gestão de coleta",
    description:
      "Planejamos e executamos a coleta dos resíduos de forma organizada e eficiente, garantindo regularidade, segurança operacional e conformidade ambiental.",
  },
  {
    icon: "truck",
    title: "Transporte OLAM",
    description:
      "Nossa divisão de logística ambiental realiza o transporte licenciado dos resíduos com frota própria, rastreabilidade e total segurança durante todo o percurso.",
  },
  {
    icon: "filter",
    title: "Triagem",
    description:
      "Realizamos a separação e classificação dos resíduos recebidos, assegurando o direcionamento correto para cada etapa do processo de tratamento.",
  },
  {
    icon: "recycle",
    title: "Compostagem",
    description:
      "Transformamos resíduos orgânicos em matéria-prima sustentável por meio de um processo controlado que reduz impactos ambientais e promove a economia circular.",
  },
  {
    icon: "sprout",
    title: "Fertilizante",
    description:
      "Produzimos fertilizantes orgânicos de alta qualidade, contribuindo para a recuperação do solo, aumento da produtividade e agricultura sustentável.",
  },
];

type Step = { icon: string; title: string; description: string; badge?: string; badgeIcon?: string; points?: string[]; image?: string };

const PROCESS_STEPS: Step[] = [
  {
    icon: "truck",
    title: "Transporte Licenciado de Resíduos",
    description:
      "Frota própria, motoristas treinados e monitoramento operacional para garantir segurança e eficiência em cada coleta.",
    badge: "100% regularizado",
    badgeIcon: "shield",
    image: "/images/leaf2.png",
  },
  {
    icon: "recycle",
    title: "Recebimento e Triagem",
    description:
      "Cada carga recebida passa por processos rigorosos de controle e separação.",
    points: ["Controle de qualidade", "Rastreabilidade total", "Separação por tipo"],
  },
  {
    icon: "sprout",
    title: "Compostagem Industrial",
    description:
      "Transformamos resíduos orgânicos em soluções sustentáveis por meio de processos controlados e tecnologia especializada.",
    badge: "Adubo de alta qualidade",
    badgeIcon: "leaf",
    image: "/images/leaf.png",
  },
];

type Benefit = { icon: string; title: string; description: string };

const BENEFITS: Benefit[] = [
  {
    icon: "badge-check",
    title: "Conformidade ambiental",
    description:
      "Garantimos que todo o processo de coleta, transporte e destinação dos resíduos esteja de acordo com a legislação ambiental vigente, proporcionando segurança e tranquilidade para sua empresa.",
  },
  {
    icon: "chart",
    title: "Redução de Custos Operacionais",
    description:
      "Transformamos a gestão de resíduos em um processo mais eficiente, reduzindo desperdícios, riscos e custos relacionados ao descarte inadequado.",
  },
  {
    icon: "file-check",
    title: "Certificados de Destinação",
    description:
      "Fornecemos documentação e certificados que comprovam a destinação correta dos resíduos, assegurando transparência e conformidade em auditorias e fiscalizações.",
  },
  {
    icon: "target",
    title: "Apoio às Metas ESG",
    description:
      "Contribuímos para que sua empresa fortaleça seus indicadores ambientais, sociais e de governança, gerando impacto positivo e agregando valor à sua marca.",
  },
];

type Faq = { question: string; answer: string };

const FAQS: Faq[] = [
  {
    question: "Quais tipos de resíduos a Organoeste recebe?",
    answer:
      "Recebemos diversos tipos de resíduos orgânicos provenientes de supermercados, indústrias alimentícias, restaurantes, frigoríficos, centros de distribuição, hotéis e outros grandes geradores.",
  },
  {
    question: "A Organoeste realiza a coleta dos resíduos?",
    answer:
      "Sim. Contamos com a OLAM, nossa operação de logística ambiental, responsável pela coleta e transporte licenciado dos resíduos com segurança e rastreabilidade.",
  },
  {
    question: "Minha empresa recebe comprovante da destinação dos resíduos?",
    answer:
      "Sim. Emitimos relatórios e certificados de destinação que comprovam o tratamento adequado dos resíduos e auxiliam em auditorias e exigências ambientais.",
  },
  {
    question: "Como a destinação sustentável pode ajudar minha empresa?",
    answer:
      "Além de garantir conformidade ambiental, a destinação correta reduz riscos, fortalece as práticas ESG e demonstra compromisso com a sustentabilidade.",
  },
  {
    question: "A Organoeste atende apenas Mato Grosso do Sul?",
    answer:
      "Nossa operação está localizada em Campo Grande/MS e atende todo o estado, com capacidade de expansão para outras regiões conforme a demanda.",
  },
  {
    question: "Como solicitar uma avaliação para minha empresa?",
    answer:
      "Basta entrar em contato com nossa equipe. Analisamos sua operação, volume de resíduos e necessidades específicas para apresentar a melhor solução ambiental.",
  },
];

const HERO_SEGMENTS = [
  { icon: "factory", label: "Indústrias" },
  { icon: "cart", label: "Supermercados" },
  { icon: "kit", label: "Frigoríficos" },
  { icon: "utensils", label: "Restaurantes" },
];

const AUDIENCES = [
  {
    photo: "sol-segment-photo sol-segment-photo-coleta",
    icon: "truck",
    eyebrow: "COLETA E LOGÍSTICA",
    photoLabel: "Caminhão Organoeste no pátio de compostagem",
    title: "Atendimento para Grandes Geradores",
    description:
      "Atendemos empresas que geram grandes volumes de resíduos orgânicos com uma operação completa, segura e eficiente.",
    tags: ["Coleta", "Triagem", "Adubos"],
    href: WA_MAIN,
    linkLabel: "Falar sobre coleta",
  },
  {
    photo: "sol-segment-photo sol-segment-photo-esg",
    icon: "sprout",
    eyebrow: "CONSULTORIA AMBIENTAL",
    photoLabel: "Muda verde em solo fértil",
    title: "Consultoria Ambiental Estratégica",
    description:
      "Nossa equipe realiza diagnósticos, análises operacionais e orientações técnicas para otimizar a gestão de resíduos e reduzir riscos ambientais.",
    tags: ["Assessoria", "ESG", "Suporte"],
    href: WA_SUPPORT,
    linkLabel: "Falar sobre consultoria",
  },
];

/* --- inline icon set (stroke style, currentColor) ----------------------- */

const PATHS: Record<string, React.ReactNode> = {
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  truck: (
    <>
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4.5L21 14v2h-8" />
      <circle cx="6.5" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
      <path d="M6.5 18h7M13 16v-2h2" />
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
  kit: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M12 11v5M9.5 13.5h5" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8M4 3v4a3 3 0 0 0 6 0V3M7 13v8" />
      <path d="M17 3c-2 2-2.5 5-2.5 8H17v10M17 3v10" />
    </>
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
  "badge-check": (
    <>
      <circle cx="12" cy="10" r="6" />
      <path d="m9.5 10 1.8 1.8 3.2-3.6" />
      <path d="m9 15-1.5 6L12 19l4.5 2L15 15" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 15v3M12 10v8M17 6v12" />
    </>
  ),
  "file-check": (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  "truck-clock": (
    <>
      <path d="M13 17V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11h2" />
      <path d="M13 8h4l3 4v5h-2" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
      <circle cx="17" cy="9" r="4.5" />
      <path d="M17 7v2l1.5 1" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  at: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
};

/* Bootstrap Icons `bi-leaf` glyph (MIT): the 16x16 solid mark, drawn filled
   (not the site's old outline stroke) and scaled by `size`, so it stays the
   same physical size wherever it is used. Serves both the "leaf" and the
   "sprout" icon names. */
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

/* Bootstrap Icons `bi-funnel` glyph (MIT): the 16x16 funnel mark, drawn filled
   with currentColor and scaled by `size` — serves the "filter" / "funnel" icon
   names (the Triagem service card). */
function FunnelMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
    </svg>
  );
}

/* Two-tone recycle mark: 512x512 artwork filled edge to edge (dark #388E3C
   body sections + light #4CAF50 accents), scaled by `size` — serves the
   "recycle" icon name (the Compostagem service card). */
function RecycleMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#388E3C"
        d="M140 20L202 22C216 24 225 32 233 44L293 134L258 152C253 155 254 164 261 169L378 191C385 192 391 188 394 181L447 57C450 49 445 42 438 42L398 60L369 17C361 5 350 0 337 0H178C162 0 150 7 140 20Z"
      />
      <path
        fill="#388E3C"
        d="M511 287L483 313L470 320H342V283C342 278 337 275 333 278L237 397C233 402 234 408 238 413L326 511H334C339 511 342 506 342 501V469L379 467C397 465 410 456 419 443L508 312C513 304 513 295 511 287Z"
      />
      <path
        fill="#388E3C"
        d="M0 287L2 311L89 437C103 458 124 469 148 469H203C209 469 213 465 213 459V329C213 324 209 320 204 320H41L33 317C11 308 1 299 0 287Z"
      />
      <path
        fill="#4CAF50"
        d="M1 154C0 158 0 163 3 166L39 204L2 281C-1 288 2 296 8 302L33 316L41 319H145L164 281L198 298C205 302 213 297 213 289L162 161C160 154 155 150 148 150H8C4 150 1 151 1 154Z"
      />
      <path
        fill="#4CAF50"
        d="M139 21L86 90C83 95 85 101 90 104L207 170C213 173 220 170 224 165L268 101C271 97 270 93 267 89L229 41C220 29 208 22 196 22H139Z"
      />
      <path
        fill="#4CAF50"
        d="M450 181L348 234C341 238 339 245 343 252L385 319H474L510 286L506 273L460 191C458 185 454 182 450 181Z"
      />
    </svg>
  );
}

/* Waste-bin mark: 512x512 artwork scaled by `size`. The lid, handle and body
   are drawn with currentColor, so the bin takes the same green as the other
   icons (.sol-step-icon / .sol-card-icon color); the vertical ribs re-use the
   light green accent already present in the icon set. Serves the "bin-clock"
   icon name (the Recebimento e Triagem process step). */
function BinMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M72 126C72 99 94 78 121 78H391C418 78 440 99 440 126V139C440 143 437 146 433 146H79C75 146 72 143 72 139V126Z"
      />
      <path
        fill="currentColor"
        d="M188 55C188 42 199 32 212 32H300C313 32 324 42 324 55V62H188V55Z"
      />
      <path
        fill="currentColor"
        d="M95 162H415L394 431C391 459 368 480 340 480H170C142 480 119 459 116 431L95 162Z"
      />
      <path
        fill="#4CAF50"
        d="M177 182C177 178 180 175 184 175C188 175 191 178 191 182V427C191 431 188 434 184 434C180 434 177 431 177 427V182Z M248 182C248 178 251 175 255 175C259 175 262 178 262 182V427C262 431 259 434 255 434C251 434 248 431 248 427V182Z M319 182C319 178 322 175 326 175C330 175 333 178 333 182V427C333 431 330 434 326 434C322 434 319 431 319 427V182Z"
      />
    </svg>
  );
}

function SolIcon({ name, size = 24 }: { name: string; size?: number }) {
  if (name === "leaf" || name === "sprout") return <LeafMark size={size} />;
  if (name === "filter" || name === "funnel") return <FunnelMark size={size} />;
  if (name === "recycle") return <RecycleMark size={size} />;
  if (name === "bin-clock") return <BinMark size={size} />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.116-.198.058-.372-.03-.52-.086-.148-.66-1.59-.905-2.174-.238-.57-.48-.494-.66-.503l-.56-.01c-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ServicesSection() {
  const aosRef = useRef<HTMLElement | null>(null);
  useAosReveal(aosRef);

  return (
    <section
      className="sol-section"
      aria-labelledby="sol-servicos-titulo"
      ref={aosRef as any}
    >
      <div className="sol-wrap sol-wrap-services">
        <p className="sol-kicker" data-aos="fade-up" data-aos-delay="0">
          Atendemos supermercados, indústrias, centros de distribuição,
          frigoríficos, restaurantes, hospitais, hotéis e grandes geradores de
          resíduos.
        </p>
        <h2
          className="sol-title"
          id="sol-servicos-titulo"
          data-aos="fade-up"
          data-aos-delay="70"
        >
          Seu <strong>resíduo</strong> está gerando <strong>custo</strong> ou{" "}
          <strong>valor</strong>?
        </h2>
        <p
          className="sol-divider"
          aria-hidden="true"
          data-aos="fade-up"
          data-aos-delay="140"
        >
          <span />
          <SolIcon name="leaf" size={16} />
          <span />
        </p>
        <ul className="sol-cards">
          {SERVICES.map((service, index) => (
            <li
              key={service.title}
              className="sol-card"
              data-aos="fade-up"
              data-aos-delay={index * 90}
            >
              <span className="sol-card-icon" aria-hidden="true">
                <SolIcon name={service.icon} size={27} />
              </span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a className="sol-card-link" href="#diagnostico">
                Saiba mais <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ProcessSection() {
  const aosRef = useRef<HTMLElement | null>(null);
  useAosReveal(aosRef);

  return (
    <section
      className="sol-section sol-process"
      id="como-funciona"
      aria-labelledby="sol-processo-titulo"
      ref={aosRef as any}
    >
      <div className="sol-wrap sol-process-wrap">
        <p className="sol-process-eyebrow" data-aos="fade-up" data-aos-delay="0">
          <span className="sol-process-eyebrow-line" aria-hidden="true" />
          <span>A SOLUÇÃO ORGANOESTE</span>
          <span className="sol-process-eyebrow-right" aria-hidden="true">
            <span className="sol-process-eyebrow-line" />
            <span className="sol-process-eyebrow-arrow" />
          </span>
        </p>
        <h2
          className="sol-process-title"
          id="sol-processo-titulo"
          data-aos="fade-up"
          data-aos-delay="70"
        >
          Uma operação completa do
          <br />
          <span>início ao fim</span>
        </h2>
        <p className="sol-process-sub" data-aos="fade-up" data-aos-delay="140">
          Da coleta ao adubo, cuidamos de todo o processo com tecnologia,
          <br />
          segurança e sustentabilidade.
        </p>
        <ol className="sol-steps">
          {PROCESS_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="sol-step"
              data-aos="fade-up"
              data-aos-delay={index * 110}
            >
              <div className="sol-step-body">
                <div className="sol-step-top">
                  <span className="sol-step-icon" aria-hidden="true">
                    <SolIcon name={step.icon} size={31} />
                  </span>
                  <span className="sol-step-num">
                    {"0" + (index + 1)}
                    <span className="sol-step-arrow" aria-hidden="true" />
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p className="sol-step-desc">{step.description}</p>
                {step.points ? (
                  <ul className="sol-step-points">
                    {step.points.map((point) => (
                      <li key={point}>
                        <span aria-hidden="true">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {step.badge ? (
                  <p className="sol-step-badge">
                    <SolIcon name={step.badgeIcon || "leaf"} size={14} />
                    {step.badge}
                  </p>
                ) : null}
              </div>
              {step.image ? (
                <span className="sol-step-photo" aria-hidden="true">
                  <img src={step.image} alt="" loading="lazy" decoding="async" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ResultsSection() {
  const aosRef = useRef<HTMLElement | null>(null);
  useAosReveal(aosRef);

  return (
    <section
      className="sol-section"
      aria-labelledby="sol-resultados-titulo"
      ref={aosRef as any}
    >
      <div className="sol-wrap">
        <p
          className="sol-divider"
          aria-hidden="true"
          data-aos="fade-up"
          data-aos-delay="0"
        >
          <span />
          <SolIcon name="leaf" size={16} />
          <span />
        </p>
        <p className="sol-eyebrow" data-aos="fade-up" data-aos-delay="70">
          Resultados reais
        </p>
        <h2
          className="sol-title sol-title-narrow"
          id="sol-resultados-titulo"
          data-aos="fade-up"
          data-aos-delay="140"
        >
          Quando sua empresa escolhe a Organoeste
        </h2>
        <div className="sol-results">
          <figure className="sol-results-photo" data-aos="fade-up" data-aos-delay="210">
            <img
              src="/images/solucoes-compostagem.png"
              alt="Compostagem industrial da Organoeste"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <ul className="sol-benefits">
            {BENEFITS.map((benefit, index) => (
              <li
                key={benefit.title}
                className="sol-benefit"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <span className="sol-benefit-icon" aria-hidden="true">
                  <SolIcon name={benefit.icon} size={25} />
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SegmentsSection() {
  const aosRef = useRef<HTMLElement | null>(null);
  useAosReveal(aosRef);

  return (
    <section
      className="sol-section sol-segments-section"
      aria-labelledby="sol-segmentos-titulo"
      ref={aosRef as any}
    >
      <div className="sol-wrap">
        <p className="sol-eyebrow" data-aos="fade-up" data-aos-delay="0">
          Atendimento que se adapta a sua empresa
        </p>
        <h2
          className="sol-title"
          id="sol-segmentos-titulo"
          data-aos="fade-up"
          data-aos-delay="70"
        >
          Transformando <strong>resíduos</strong> em <strong>impacto positivo</strong>
        </h2>
        <p
          className="sol-divider"
          aria-hidden="true"
          data-aos="fade-up"
          data-aos-delay="140"
        >
          <span />
          <SolIcon name="leaf" size={16} />
          <span />
        </p>
        <div className="sol-audiences">
          {AUDIENCES.map((card, index) => (
            <article
              key={card.title}
              className="sol-audience"
              data-aos="fade-up"
              data-aos-delay={index * 110}
            >
              <div className={card.photo} role="img" aria-label={card.photoLabel} />
              <div className="sol-audience-body">
                <p className="sol-audience-eyebrow">
                  <span className="sol-audience-icon" aria-hidden="true">
                    <SolIcon name={card.icon} size={23} />
                  </span>
                  {card.eyebrow}
                </p>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <ul className="sol-tags" aria-label={card.title}>
                  {card.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <a className="sol-audience-link" href={card.href} target="_blank" rel="noopener noreferrer">
                  {card.linkLabel}
                  <span className="sol-audience-arrow" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const aosRef = useRef<HTMLElement | null>(null);
  useAosReveal(aosRef);

  return (
    <section
      className="sol-section sol-faq-section"
      aria-labelledby="sol-faq-titulo"
      ref={aosRef as any}
    >
      <div className="sol-wrap">
        <div className="sol-faq-head" data-aos="fade-up" data-aos-delay="0">
          <p className="sol-faq-eyebrow">Dúvidas frequentes</p>
          <h2 className="sol-faq-title" id="sol-faq-titulo">
            Vamos <strong>encontrar</strong> a melhor <strong>solução</strong> para
            sua <strong>empresa</strong>?
          </h2>
        </div>
        <div className="sol-faq" role="list">
          {FAQS.map((faq, index) => {
            const expanded = open === index;
            return (
              <div
                key={faq.question}
                className={"sol-faq-item" + (expanded ? " sol-faq-open" : "")}
                role="listitem"
                data-aos="fade-up"
                data-aos-delay={index * 60}
              >
                <button
                  type="button"
                  className="sol-faq-toggle"
                  aria-expanded={expanded}
                  aria-controls={"sol-faq-panel-" + index}
                  id={"sol-faq-button-" + index}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className="sol-faq-plus" aria-hidden="true">
                    {expanded ? "–" : "+"}
                  </span>
                </button>
                <div
                  className="sol-faq-panel"
                  id={"sol-faq-panel-" + index}
                  role="region"
                  aria-labelledby={"sol-faq-button-" + index}
                  hidden={!expanded}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <aside
          className="sol-diagnosis"
          id="diagnostico"
          aria-labelledby="sol-diagnostico-titulo"
          data-aos="fade-up"
          data-aos-delay="120"
        >
          <div className="sol-diagnosis-copy">
            <h2 id="sol-diagnostico-titulo">Solicite um diagnóstico sem compromisso.</h2>
            <p>
              Nossa equipe está pronta para analisar sua operação e apresentar
              uma solução personalizada para sua necessidade.
            </p>
            <div className="sol-diagnosis-ctas">
              <a className="sol-btn sol-btn-wa" href={WA_MAIN} target="_blank" rel="noopener noreferrer">
                <WhatsappGlyph />
                Falar no WhatsApp
              </a>
              <a className="sol-btn sol-btn-outline" href={WA_MAIN} target="_blank" rel="noopener noreferrer">
                Quero falar com um especialista
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* --- page body ---------------------------------------------------------- */

export default function Solutions() {
  return (
    <>
      <Reveal delay={0}>
        <Hero />
      </Reveal>
      {/* The rest of the page reveals itself through data-aos (useAosReveal in
          each section): wrapping them in <Reveal> as well would hide the whole
          block while its own staggered children animate. */}
      <ServicesSection />
      <ProcessSection />
      <ResultsSection />
      <SegmentsSection />
      <FaqSection />
    </>
  );
}
