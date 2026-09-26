/* Solutions end-to-end process — numbered steps inside the green band. */
import SolIcon from "./solutions-icons";
import { PROCESS_STEPS } from "./solutions-content";

export default function SolutionsProcess() {
  return (
    <section className="sol-section sol-process" id="como-funciona" aria-labelledby="sol-processo-titulo">
      <div className="sol-wrap">
        <p className="sol-eyebrow">A solução Organoeste</p>
        <h2 className="sol-title sol-title-light" id="sol-processo-titulo">
          <span className="sol-title-dim">Uma</span> operação completa{" "}
          <span className="sol-title-dim">do início ao fim</span>
        </h2>
        <p className="sol-divider sol-divider-light" aria-hidden="true">
          <span />
          <SolIcon name="sparkles" size={18} />
          <span />
        </p>
        <ol className="sol-steps">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title} className="sol-step">
              <span className="sol-step-number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="sol-step-icon" aria-hidden="true">
                <SolIcon name={step.icon} size={34} />
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
