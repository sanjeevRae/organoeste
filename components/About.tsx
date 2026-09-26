/* About section — two stacked bands: the OLAM block (licensed collection) and the
   bioconversion block, with scroll reveals (data-aos) and the video lightbox. */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const YT_ID = "i2hexNUtN9Y";

export default function About() {
  const [videoOpen, setVideoOpen] = useState(false);
  const closeVideo = useCallback(() => setVideoOpen(false), []);
  const rootRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === undefined) return;
    const els = Array.from(root.querySelectorAll('[data-aos]'));
    if (!els.length) return;
    els.forEach((node) => (node as HTMLElement).style.setProperty("--aos-delay", ((node as HTMLElement).dataset.aosDelay || "0") + "ms"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    els.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeVideo(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [videoOpen, closeVideo]);
  return (
    <div ref={rootRef as any}>
    <section className="about-section-top">
      <div className="block-overlay" />
      <div className="canvas">
        <div className="about-top-image" data-aos="fade-up" data-aos-delay="0"><div className="image-content" /></div>
        <div className="about-top-card-grey" data-aos="fade-up" data-aos-delay="70"><div className="card-content" /></div>
        <div className="about-top-card-green" data-aos="fade-up" data-aos-delay="140"><div className="card-content" /></div>
        <div className="about-top-whatsapp-icon" data-aos="fade-up" data-aos-delay="210"><a className="icon-content" href="https://wa.me/5567981242791" target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.116-.198.058-.372-.03-.52-.086-.148-.66-1.59-.905-2.174-.238-.57-.48-.494-.66-.503l-.56-.01c-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg></a></div>
        <div className="about-top-eyebrow" data-aos="fade-up" data-aos-delay="280"><div className="text-content"><p><span><b>Coleta licenciada</b></span></p></div></div>
        <div className="about-top-title" data-aos="fade-up" data-aos-delay="350"><div className="title-content"><h1><span><b>ORGÂNICA LOGÍSTICAS AMBIENTAIS</b></span><br /></h1></div></div>
        <div className="about-top-heading" data-aos="fade-up" data-aos-delay="420"><div className="title-content"><h1><span><span><b>Do recibo à destinação final</b></span></span></h1></div></div>
        <div className="about-top-description" data-aos="fade-up" data-aos-delay="490"><div className="text-content"><p><span><span><b>Coleta com frota própria e rastreabilidade total.</b></span></span></p><p><span><span><b> Fale com a OLAM.</b></span></span></p></div></div>
        <div className="about-top-caption" data-aos="fade-up" data-aos-delay="560"><div className="text-content"><p><span><span><b>Coleta segura e rastreável, do início ao fim.</b></span></span></p></div></div>
      </div>
    </section>
    <section className="about-section-bottom">
      <div className="block-overlay" />
      <div className="canvas">
        <div className="about-bottom-media-card" data-aos="fade-up" data-aos-delay="0"><div className="card-content" /></div>
        <div className="about-bottom-cta" data-aos="fade-up" data-aos-delay="70"><a className="button-content" href="https://wa.me/5567992401937">Fale conosco</a></div>
        <div className="about-bottom-play" data-aos="fade-up" data-aos-delay="140"><button type="button" className="about-play-button" onClick={() => setVideoOpen(true)} aria-label="Assistir ao vídeo institucional" aria-haspopup="dialog" /></div>
        <div className="about-bottom-info-card" data-aos="fade-up" data-aos-delay="210"><div className="card-content" /></div>
        <div className="about-bottom-description" data-aos="fade-up" data-aos-delay="280"><div className="text-content"><p><span><span>Metodologia própria de bioconversão transforma o resíduo em matéria-prima de alta qualidade, com controle técnico em todas as etapas.</span></span></p><p><span><span><br /></span></span></p><p><span><span><b>Atendemos grandes geradores que precisam de destinação correta, e produtores que precisam de adubo de alta performance</b></span></span></p></div></div>
        <div className="about-bottom-title" data-aos="fade-up" data-aos-delay="350"><div className="title-content"><h2><span>MUITO ALÉM DO DESCARTE</span></h2></div></div>
        <div className="about-bottom-divider" data-aos="fade-up" data-aos-delay="420"><div className="divider-v-content" /></div>
      </div>
    </section>
      {videoOpen && (
        <div className="about-lightbox" role="dialog" aria-modal="true" aria-label="Vídeo institucional" onClick={closeVideo}>
          <div className="about-lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="about-lightbox-close" onClick={closeVideo} aria-label="Fechar vídeo">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <iframe
              src={"https://www.youtube.com/embed/" + YT_ID + "?autoplay=1&rel=0"}
              title="Vídeo institucional Organoeste"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
