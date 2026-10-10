"use client";

import { useState, type FormEvent } from "react";

const WA_LINK = "https://wa.me/5567992401937";

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "Por favor, informe seu nome.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      nextErrors.email = "Informe um e-mail válido.";
    if (message.trim().length < 10)
      nextErrors.message = "Sua mensagem precisa ter ao menos 10 caracteres.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const text = `Olá, sou ${name.trim()} (${email.trim()}).\n\n${message.trim()}`;
    window.open(
      `${WA_LINK}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setSent(true);
  }

  return (
    <section className="contact-section" id="contato" aria-labelledby="contact-title">
      <div className="block-overlay" />
      <div className="canvas">
        <div className="contact-intro">
          <p className="contact-eyebrow">
            <strong>Entre em Contato</strong>
          </p>
          <h2 className="contact-title" id="contact-title">
            É UM GRANDE GERADOR DE RESÍDUO ORGÂNICO?
          </h2>
          <p className="contact-description">
            Conte para a nossa equipe o volume, o segmento e a localização da sua
            operação e descubra a solução certa dentro do ecossistema Organoeste.
          </p>
        </div>

        {sent ? (
          <div className="contact-success" role="status">
            Obrigado, {name.trim()}! Sua mensagem foi registrada e nossa equipe
            entrará em contato em breve pelo WhatsApp.
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-content">
              <fieldset>
                <div className={`field-input${errors.name ? " has-error" : ""}`}>
                  <label className="field-label" htmlFor="contact-name">
                    Nome
                  </label>
                  <div className="field-control">
                    <input
                      id="contact-name"
                      className="input-control"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  {errors.name && <p className="field-message">{errors.name}</p>}
                </div>

                <div className={`field-input${errors.email ? " has-error" : ""}`}>
                  <label className="field-label" htmlFor="contact-email">
                    E-mail
                  </label>
                  <div className="field-control">
                    <input
                      id="contact-email"
                      className="input-control"
                      type="email"
                      placeholder="voce@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && <p className="field-message">{errors.email}</p>}
                </div>

                <div
                  className={`field-textarea${errors.message ? " has-error" : ""}`}
                >
                  <label className="field-label" htmlFor="contact-message">
                    Mensagem
                  </label>
                  <div className="field-control">
                    <textarea
                      id="contact-message"
                      className="input-control"
                      placeholder="Conte o volume, o segmento e a localização da sua operação."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  {errors.message && (
                    <p className="field-message">{errors.message}</p>
                  )}
                </div>
              </fieldset>

              <button type="submit" className="button-primary">
                <span>Fale Conosco</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}