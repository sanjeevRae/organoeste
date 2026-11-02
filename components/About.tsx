"use client";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const VIDEO_1 = "--6H65KgVeg";
const VIDEO_2 = "5EzSC-bpC5c";

export default function About() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [overlayHidden, setOverlayHidden] = useState(false);
  const closeVideo = useCallback(() => {
    setVideoOpen(false);
    setOverlayHidden(false);
  }, []);
  const handlePlay = useCallback(() => {
    setOverlayHidden(true);
    setVideoOpen(true);
  }, []);
  const rootRef = useRef<HTMLElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const phaseRef = useRef(0);
  const transitionedRef = useRef(false);
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
  useEffect(() => {
    if (!videoOpen) {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
      phaseRef.current = 0;
      transitionedRef.current = false;
      return;
    }
    let cancelled = false;
    const init = () => {
      if (cancelled) return;
      if (!playerContainerRef.current || !window.YT || !window.YT.Player) return;
      if (playerRef.current) return;
      const player = new window.YT.Player(playerContainerRef.current, {
        videoId: VIDEO_1,
        playerVars: {
          start: 0,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          playsinline: 1,
          autoplay: 1,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onStateChange: (e: any) => {
            const YT = window.YT;
            const target = e?.target;
            if (!YT || !target) return;
            if (phaseRef.current === 0 && e.data === YT.PlayerState.ENDED) {
              if (transitionedRef.current) return;
              transitionedRef.current = true;
              phaseRef.current = 1;
              try { target.loadVideoById({ videoId: VIDEO_2, startSeconds: 7 }); } catch { /* ignore */ }
              setTimeout(() => { try { target.playVideo(); } catch { /* ignore */ } }, 300);
            } else if (phaseRef.current === 1 && (e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING)) {
              phaseRef.current = 2;
            } else if (phaseRef.current === 2 && e.data === YT.PlayerState.ENDED) {
              phaseRef.current = 3;
              try { target.stopVideo(); } catch { /* ignore */ }
            }
          },
          onError: () => { /* ignore */ },
        },
      });
      playerRef.current = player;
    };
    if (window.YT && window.YT.Player) {
      // small delay to ensure container mounted
      setTimeout(init, 50);
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) { try { prev(); } catch { /* ignore */ } }
        init();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.body.appendChild(tag);
      }
    }
    return () => {
      cancelled = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
  }, [videoOpen]);

  return (
    <div ref={rootRef as any}>
    <section className="about-section-top" id="sobre" style={{ marginTop: "32px" }}>
      <div className="block-overlay" />
      <div className="canvas">
        <div className="about-top-image" data-aos="fade-up" data-aos-delay="0">
          <div className="image-content" />
          </div>
        <div className="about-top-card-grey" data-aos="fade-up" data-aos-delay="70">
          <div className="card-content">
            <div className="about-top-heading" data-aos="fade-up" data-aos-delay="420">
              <div className="title-content" style={{ fontSize: "25px", lineHeight: "1.25" }}><h1 style={{ fontSize: "25px", lineHeight: "1.25" }}><span><span><b style={{ fontSize: "25px", lineHeight: "1.25" }}>Da coleta à destinação final</b>
          </span></span>
          </h1>
          </div>
          </div>
            <div className="about-top-description" data-aos="fade-up" data-aos-delay="490">
              <div className="text-content"><p><span><span><b>Coleta com frota própria e rastreabilidade total.</b>
          </span>
          </span>
          </p>
          <p className="about-top-cta-line"><a className="about-top-cta-btn" href="https://wa.me/5567992401937" target="_blank" rel="noopener noreferrer">Fale com a <span translate="no">OLAM</span>.</a></p></div>
            </div>
          </div>
        </div>
        <div className="about-top-card-green" data-aos="fade-up" data-aos-delay="140">
          <div className="card-content">
            <div className="about-top-eyebrow" data-aos="fade-up" data-aos-delay="280">
              <div className="text-content"><p><span><b>Coleta licenciada</b>
          </span>
          </p>
          </div>
          </div>
            <div className="about-top-title" data-aos="fade-up" data-aos-delay="350">
              <div className="title-content"><h1><span><b>ORGÂNICA LOGÍSTICAS AMBIENTAIS</b>
          </span>
          <br />
          </h1>
          </div>
          </div>
            <div className="about-top-caption" data-aos="fade-up" data-aos-delay="560">
              <div className="text-content">
                <p><span>
                  <span>
                  <b>Coleta segura e rastreável, do início ao fim.</b>
                  </span></span>
                  </p></div>
                  </div>
          </div>
        </div>
      </div>
    </section>


    
    <section className="about-section-bottom">
      <div className="block-overlay" />
      <div className="canvas">
        <div className="about-bottom-media-card" data-aos="fade-up" data-aos-delay="0">
          <div className="card-content" />
          </div>
        <div className="about-bottom-cta" data-aos="fade-up" data-aos-delay="70">
          <a className="button-content" href="https://wa.me/5567992401937">Fale conosco</a>
          </div>
        <div className={"about-bottom-play" + (overlayHidden ? " play-hidden" : "")} data-aos="fade-up" data-aos-delay="140">
          <button type="button" className="about-play-button" onClick={handlePlay} aria-label="Assistir ao vídeo institucional" aria-haspopup="dialog">
            <span className="play-ripple" /><span className="play-ripple" /><span className="play-ripple" /><svg className="play-glyph" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="32" fill="#ffffff" /><path d="M26.5 20.8 46 32 26.5 43.2Z" fill="#141414" /></svg>
            </button>
            </div>
        <div className="about-bottom-info-card" data-aos="fade-up" data-aos-delay="210">
          <div className="card-content" />
          </div>
        <div className="about-bottom-description" data-aos="fade-up" data-aos-delay="280">
          <div className="text-content">
            <p><span>
              <span>Metodologia própria de bioconversão transforma o resíduo em matéria-prima de alta qualidade, com controle técnico em todas as etapas.</span>
              </span>
              </p><p>
                <span><span>
                  <br /></span></span>
                  </p><p><span><span>
                    <b>Atendemos grandes geradores que precisam de destinação correta, e produtores que precisam de adubo de alta performance</b>
                    </span></span></p>
                    </div>
                    </div>
        <div className="about-bottom-title" data-aos="fade-up" data-aos-delay="350">
          <div className="title-content"><h2><span>MUITO ALÉM DO DESCARTE</span></h2>
          </div>
          </div>
        <div className="about-bottom-divider" data-aos="fade-up" data-aos-delay="420">
          <div className="divider-v-content" />
          </div>
      </div>
    </section>
      {videoOpen && (
        <div className="about-lightbox" role="dialog" aria-modal="true" aria-label="Vídeo institucional" onClick={closeVideo}>
          <div className="about-lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="about-lightbox-close" onClick={closeVideo} aria-label="Fechar vídeo">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <div ref={playerContainerRef} className="about-lightbox-player" style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
