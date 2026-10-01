"use client";
import { useEffect, useRef, useState } from "react";
import { useAosReveal } from "./useAosReveal";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const aosRef = useRef<HTMLElement | null>(null);
  useAosReveal(aosRef);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const logos = [
    { src: "/images/adm.png", alt: "ADM" },
    { src: "/images/berpram.png", alt: "Berpram" },
    { src: "/images/suzano.png", alt: "Suzano" },
    { src: "/images/pereira.png", alt: "Pereira" },
    { src: "/images/camva.png", alt: "Camva" },
    { src: "/images/cocacola.png", alt: "Coca-Cola" },
    { src: "/images/jbs.png", alt: "JBS" },
    { src: "/images/aurora.png", alt: "Aurora" },
  ];
  return (
    <div ref={aosRef as any}>
      <section className={"hero-section" + (loaded ? " hero-loaded" : " hero-enter")}>
        <div className="block-overlay" />
        <div className="canvas">
          
          <div className="hero-title"><div className="title-content"><h2><span><b>ESTAMOS CONSTRUINDO O FUTURO DOS GRANDES GERADORES</b></span></h2></div></div>
          <div className="hero-subtitle"><div className="text-content"><p><span><span>Coleta licenciada, compostagem própria e adubo orgânico de alta performance, um único ecossistema, da indústria ao campo.</span></span></p></div></div>
        </div>
      </section>
      {/* The trusted strip lives outside the hero section, so the observed root
          has to wrap both: useAosReveal only scans descendants, and without
          this the new .sol-page reveal rule would keep the strip hidden. */}
      <div className="trusted-strip" data-aos="fade-up" data-aos-delay="0" aria-label="Empresas que confiam na Organoeste">
        <p className="trusted-strip-label">Empresas que confiam na Organoeste</p>
        <div className="trusted-marquee">
          <div className="trusted-track">
            {logos.map((logo) => (
              <img key={logo.src} src={logo.src} alt={logo.alt} className="trusted-logo" loading="lazy"/>
            ))}
            {logos.map((logo) => (
              <img key={"dup-" + logo.src} src={logo.src} alt="" aria-hidden="true" className="trusted-logo" loading="lazy" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
