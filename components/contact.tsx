"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type Fields = { nome: string; email: string; mensagem: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  const [values, setValues] = useState<Fields>({ nome: "", email: "", mensagem: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const validate = (next: Fields): FieldErrors => {
    const found: FieldErrors = {};
    if (!next.nome.trim()) found.nome = "Informe seu nome.";
    if (!next.email.trim()) found.email = "Informe seu e-mail.";
    else if (!EMAIL_RE.test(next.email.trim())) found.email = "Informe um e-mail válido.";
    if (!next.mensagem.trim()) found.mensagem = "Escreva sua mensagem.";
    return found;
  };

  const handleChange = (field: keyof Fields) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) setErrors(validate(next));
      return next;
    });
  };

  const handleBlur = (field: keyof Fields) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ nome: true, email: true, mensagem: true });
    if (nextErrors.nome || nextErrors.email || nextErrors.mensagem) return;
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 600);
  };

  const fieldClass = (field: keyof Fields) =>
    `field-${field === "mensagem" ? "textarea" : "input"}${touched[field] && errors[field] ? " has-error" : ""}`;

  const describedBy = (field: keyof Fields) =>
    touched[field] && errors[field] ? `organoeste-${field}-error` : undefined;

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
        <div className="contact-form">
          {status === "sent" ? (
            <div className="contact-success" role="status">Enviado com sucesso!</div>
          ) : (
            <form className="form-content" onSubmit={handleSubmit} noValidate>
              <fieldset>
                <div className={fieldClass("nome")}>
                  <div className="field-control">
                    <input id="organoeste-nome" name="nome" type="text" className="input-control" placeholder="Nome" autoComplete="name" value={values.nome} onChange={handleChange("nome")} onBlur={handleBlur("nome")} aria-invalid={Boolean(touched.nome && errors.nome) || undefined} aria-describedby={describedBy("nome")} />
                  </div>
                  {touched.nome && errors.nome ? (<p className="field-message" id="organoeste-nome-error" role="alert">{errors.nome}</p>) : null}
                </div>
                <div className={fieldClass("email")}>
                  <div className="field-control">
                    <input id="organoeste-email" name="email" type="email" className="input-control" placeholder="* E-mail" autoComplete="email" required value={values.email} onChange={handleChange("email")} onBlur={handleBlur("email")} aria-invalid={Boolean(touched.email && errors.email) || undefined} aria-describedby={describedBy("email")} />
                  </div>
                  {touched.email && errors.email ? (<p className="field-message" id="organoeste-email-error" role="alert">{errors.email}</p>) : null}
                </div>
                <div className={fieldClass("mensagem")}>
                  <div className="field-control">
                    <textarea id="organoeste-mensagem" name="mensagem" className="input-control" placeholder="* Mensagem" rows={5} required value={values.mensagem} onChange={handleChange("mensagem")} onBlur={handleBlur("mensagem")} aria-invalid={Boolean(touched.mensagem && errors.mensagem) || undefined} aria-describedby={describedBy("mensagem")} />
                  </div>
                  {touched.mensagem && errors.mensagem ? (<p className="field-message" id="organoeste-mensagem-error" role="alert">{errors.mensagem}</p>) : null}
                </div>
              </fieldset>
              <button className="button-primary" type="submit" disabled={status === "sending"}>
                <span>{status === "sending" ? "Enviando..." : "Enviar agora mesmo"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
