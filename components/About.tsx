"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ABOUT_VIDEO_ID = "i2hexNUtN9Y";
const ABOUT_VIDEO_THUMBNAIL = `https://img.youtube.com/vi/${ABOUT_VIDEO_ID}/maxresdefault.jpg`;

export default function About() {
  const [videoOpen, setVideoOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const closeVideo = useCallback(() => setVideoOpen(false), []);
  const handlePlay = useCallback(() => setVideoOpen(true), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-aos]"));
    elements.forEach((element) => {
      element.style.setProperty(
        "--aos-delay",
        `${element.dataset.aosDelay || "0"}ms`
      );
    });

    if (typeof IntersectionObserver === "undefined") {
      elements.forEach((element) => element.classList.add("reveal-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVideo();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [videoOpen, closeVideo]);

  return (
    <div ref={rootRef} className="about-page-sections">
      <section className="about-section-top" id="sobre" style={{ marginTop: "32px" }}>
        <div className="block-overlay" />
        <div className="canvas">
          <div className="about-top-image" data-aos="fade-up" data-aos-delay="0">
            <div className="image-content" />
          </div>

          <div className="about-top-card-grey" data-aos="fade-up" data-aos-delay="70">
            <div className="card-content" />
            <div className="about-top-heading" data-aos="fade-up" data-aos-delay="420">
              <div className="title-content" style={{ fontSize: "25px", lineHeight: "1.25" }}>
                <h1 style={{ fontSize: "25px", lineHeight: "1.25" }}>
                  <span>
                    <span>
                      <b style={{ fontSize: "25px", lineHeight: "1.25" }}>
                        Da coleta à destinação final
                      </b>
                    </span>
                  </span>
                </h1>
              </div>
            </div>
            <div className="about-top-description" data-aos="fade-up" data-aos-delay="490">
              <div className="text-content">
                <p>
                  <span>
                    <span>
                      <b>Coleta com frota própria e rastreabilidade total.</b>
                    </span>
                  </span>
                </p>
                <p className="about-top-cta-line">
                  <a
                    className="about-top-cta-btn"
                    href="https://wa.me/5567992401937"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fale com a <span translate="no">OLAM</span>.
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="about-top-card-green" data-aos="fade-up" data-aos-delay="140">
            <div className="card-content" />
            <div className="about-top-eyebrow" data-aos="fade-up" data-aos-delay="280">
              <div className="text-content">
                <p>
                  <span>
                    <b>Coleta licenciada</b>
                  </span>
                </p>
              </div>
            </div>
            <div className="about-top-title" data-aos="fade-up" data-aos-delay="350">
              <div className="title-content">
                <h1>
                  <span>
                    <b>ORGÂNICA LOGÍSTICAS AMBIENTAIS</b>
                  </span>
                  <br />
                </h1>
              </div>
            </div>
            <div className="about-top-caption" data-aos="fade-up" data-aos-delay="560">
              <div className="text-content">
                <p>
                  <span>
                    <span>
                      <b>Coleta segura e rastreável, do início ao fim.</b>
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section-bottom" aria-label="Muito além do descarte">
        <div className="block-overlay" />
        <div className="canvas">
          <div className="about-bottom-media-wrap">
            <div className="about-bottom-media-card" data-aos="fade-up" data-aos-delay="0">
              <div
                className="card-content"
                style={{ backgroundImage: `url("${ABOUT_VIDEO_THUMBNAIL}")` }}
              />
            </div>

            <div className="about-bottom-cta" data-aos="fade-up" data-aos-delay="70">
              <a
                className="button-content"
                href="https://wa.me/5567992401937"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fale conosco
              </a>
            </div>

            <div className="about-bottom-play" data-aos="fade-up" data-aos-delay="140">
              <button
                type="button"
                className="about-play-button"
                onClick={handlePlay}
                aria-label="Assistir ao vídeo institucional"
                aria-haspopup="dialog"
                aria-expanded={videoOpen}
              >
                <span className="play-ripple" />
                <span className="play-ripple" />
                <span className="play-ripple" />
                <svg className="play-glyph" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                  <circle cx="32" cy="32" r="32" fill="#ffffff" />
                  <path d="M26.5 20.8 46 32 26.5 43.2Z" fill="#141414" />
                </svg>
              </button>
            </div>
          </div>

          <div className="about-bottom-info-card" data-aos="fade-up" data-aos-delay="210">
            <div className="card-content" />
          </div>
          <div className="about-bottom-description" data-aos="fade-up" data-aos-delay="280">
            <div className="text-content">
              <p>
                <span>
                  <span>
                    Metodologia própria de bioconversão transforma o resíduo em matéria-prima de alta qualidade, com controle técnico em todas as etapas.
                  </span>
                </span>
              </p>
              <p>
                <span>
                  <span>
                    <br />
                  </span>
                </span>
              </p>
              <p>
                <span>
                  <span>
                    <b>
                      Atendemos grandes geradores que precisam de destinação correta, e produtores que precisam de adubo de alta performance
                    </b>
                  </span>
                </span>
              </p>
            </div>
          </div>
          <div className="about-bottom-title" data-aos="fade-up" data-aos-delay="350">
            <div className="title-content">
              <h2>
                <span>MUITO ALÉM DO DESCARTE</span>
              </h2>
            </div>
          </div>
          <div className="about-bottom-divider" data-aos="fade-up" data-aos-delay="420">
            <div className="divider-v-content" />
          </div>
        </div>
      </section>

      {videoOpen && (
        <div
          className="about-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vídeo institucional"
          onClick={closeVideo}
        >
          <div className="about-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="about-lightbox-close"
              onClick={closeVideo}
              aria-label="Fechar vídeo"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <iframe
              className="about-lightbox-player"
              title="Vídeo institucional Organoeste"
              src={`https://www.youtube-nocookie.com/embed/${ABOUT_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
