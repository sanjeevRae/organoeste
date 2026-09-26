/* Solutions segments — two audience cards with service tags. */
import SolIcon from "./solutions-icons";
import { WA_MAIN, WA_SUPPORT } from "./solutions-content";

const CARDS = [
  {
    photo: "sol-segment-photo sol-segment-photo-coleta",
    icon: "monitor",
    title: "Atendimento para Grandes Geradores",
    description:
      "Atendemos empresas que geram grandes volumes de resíduos orgânicos com uma operação completa, segura e eficiente",
    tags: ["Coleta", "Triagem", "Adubos"],
    href: WA_MAIN,
    linkLabel: "Falar sobre coleta",
  },
  {
    photo: "sol-segment-photo sol-segment-photo-esg",
    icon: "at",
    title: "Consultoria Ambiental Estratégica",
    description:
      "Nossa equipe realiza diagnósticos, análises operacionais e orientações técnicas para otimizar a gestão de resíduos e reduzir riscos ambientais.",
    tags: ["Assessoria", "ESG", "Suporte"],
    href: WA_SUPPORT,
    linkLabel: "Falar sobre consultoria",
  },
];

export default function SolutionsSegments() {
  return (
    <section className="sol-section sol-segments-section" aria-labelledby="sol-segmentos-titulo">
      <div className="sol-wrap">
        <p className="sol-eyebrow">Atendimento que se adapta a sua empresa</p>
        <h2 className="sol-title" id="sol-segmentos-titulo">
          Transformando <strong>resíduos</strong> em <strong>impacto positivo</strong>
        </h2>
        <p className="sol-divider" aria-hidden="true">
          <span />
          <SolIcon name="leaf" size={18} />
          <span />
        </p>
        <div className="sol-audiences">
          {CARDS.map((card) => (
            <article key={card.title} className="sol-audience">
              <div className={card.photo} aria-hidden="true" />
              <div className="sol-audience-body">
                <span className="sol-audience-icon" aria-hidden="true">
                  <SolIcon name={card.icon} size={30} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <ul className="sol-tags" aria-label={card.title}>
                  {card.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <a className="sol-audience-link" href={card.href} target="_blank" rel="noopener noreferrer">
                  {card.linkLabel} <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
