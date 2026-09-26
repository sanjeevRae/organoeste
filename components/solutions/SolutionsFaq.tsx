/* Solutions FAQ + diagnosis CTA — accordion of common questions and the
   final WhatsApp call to action over the seedling photo. */
"use client";

import { useState } from "react";
import { WhatsappGlyph } from "./solutions-icons";
import { FAQS, WA_MAIN } from "./solutions-content";

export default function SolutionsFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="sol-section" aria-labelledby="sol-faq-titulo">
      <div className="sol-wrap">
        <p className="sol-eyebrow">Dúvidas frequentes</p>
        <h2 className="sol-title sol-title-narrow" id="sol-faq-titulo">
          Vamos <strong>encontrar</strong> a melhor <strong>solução</strong> para
          sua <strong>empresa</strong>?
        </h2>
        <div className="sol-faq" role="list">
          {FAQS.map((faq, index) => {
            const expanded = open === index;
            return (
              <div key={faq.question} className={"sol-faq-item" + (expanded ? " sol-faq-open" : "")} role="listitem">
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

        <aside className="sol-diagnosis" id="diagnostico" aria-labelledby="sol-diagnostico-titulo">
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
