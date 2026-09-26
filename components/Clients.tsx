/* Clients — combined "empresas que já confiam" logo band plus the
   "leve a Organoeste para sua cidade" CTA (photo, cards and WhatsApp button). */

export default function Clients() {
  return (
    <div className="clients">
      <section className="clients-section">
        <div className="block-overlay" />
        <div className="canvas">
          <div className="clients-title"><div className="title-content"><h2><span>EMPRESAS QUE JÁ CONFIAM NO GRUPO ORGANOESTE</span></h2></div></div>
          <div className="clients-card"><div className="card-content" /></div>
          <div className="clients-logo-1"><div className="image-content" /></div>
          <div className="clients-logo-2"><div className="image-content" /></div>
          <div className="clients-logo-3"><div className="image-content" /></div>
          <div className="clients-logo-4"><div className="image-content" /></div>
          <div className="clients-logo-5"><div className="image-content" /></div>
          <div className="clients-description"><div className="text-content"><p><span>Atendemos desde grandes redes supermercadistas, indústrias alimentícias e agroindústrias até centrais de distribuição, cooperativas e instituições públicas </span></p></div></div>
          <div className="clients-logo-6"><div className="image-content" /></div>
          <div className="clients-logo-7"><div className="image-content" /></div>
          <div className="clients-logo-8"><div className="image-content" /></div>
        </div>
      </section>
      <section className="city-cta-section">
        <div className="block-overlay" />
        <div className="canvas">
          <div className="city-cta-card-back"><div className="card-content" /><div className="city-cta-image"><div className="image-content" /></div></div>
          <div className="city-cta-card-front"><div className="card-content" /></div>
          <div className="city-cta-contact-name"><div className="text-content"><p><span><b>Fábio Vaz | Diretor de Relações Governamentais e Institucionais</b></span></p></div></div>
          <div className="city-cta-title"><div className="title-content"><h2><span><span><b>Leve a Organoeste para sua cidade</b></span></span></h2></div></div>
          <div className="city-cta-description"><div className="text-content"><p><span>Atendemos municípios via licitação, com coleta, compostagem e destinação de resíduos orgânicos com frota própria, rastreabilidade e relatórios para sua gestão ambiental. Leve a Organoeste para sua cidade."</span></p></div></div>
          <div className="city-cta-button"><a className="button-content" href="https://wa.me/5561993791652">Quero saber mais</a></div>
        </div>
      </section>
    </div>
  );
}
