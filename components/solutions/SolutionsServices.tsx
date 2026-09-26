/* Solutions services — cost-vs-value teaser plus the five service cards. */
import SolIcon from "./solutions-icons";
import { SERVICES } from "./solutions-content";

export default function SolutionsServices() {
  return (
    <section className="sol-section" aria-labelledby="sol-servicos-titulo">
      <div className="sol-wrap">
        <p className="sol-kicker">
          Atendemos supermercados, indústrias, centros de distribuição,
          frigoríficos, restaurantes, hospitais, hotéis e grandes geradores de
          resíduos.
        </p>
        <h2 className="sol-title" id="sol-servicos-titulo">
          Seu <strong>resíduo</strong> está gerando <strong>custo</strong> ou{" "}
          <strong>valor</strong>?
        </h2>
        <p className="sol-divider" aria-hidden="true">
          <span />
          <SolIcon name="leaf" size={18} />
          <span />
        </p>
        <ul className="sol-cards">
          {SERVICES.map((service) => (
            <li key={service.title} className="sol-card">
              <span className="sol-card-icon" aria-hidden="true">
                <SolIcon name={service.icon} size={30} />
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
