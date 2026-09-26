/* Solutions results — composting photo plus the four outcome cards. */
import SolIcon from "./solutions-icons";
import { BENEFITS } from "./solutions-content";

export default function SolutionsResults() {
  return (
    <section className="sol-section" aria-labelledby="sol-resultados-titulo">
      <div className="sol-wrap">
        <p className="sol-divider" aria-hidden="true">
          <span />
          <SolIcon name="leaf" size={18} />
          <span />
        </p>
        <p className="sol-eyebrow">Resultados reais</p>
        <h2 className="sol-title sol-title-narrow" id="sol-resultados-titulo">
          Quando sua empresa escolhe a Organoeste
        </h2>
        <div className="sol-results">
          <figure className="sol-results-photo">
            <img
              src="/images/solucoes-compostagem.png"
              alt="Compostagem industrial da Organoeste"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <ul className="sol-benefits">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="sol-benefit">
                <span className="sol-benefit-icon" aria-hidden="true">
                  <SolIcon name={benefit.icon} size={28} />
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
