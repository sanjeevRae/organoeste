/* Products section — organic fertilizer (adubo orgânico) presentation with image,
   title, description and WhatsApp call to action, with scroll reveals (data-aos). */
"use client";
import { useEffect, useRef } from "react";

export default function ProductsSection() {
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
  return (
    <section className="products-section" ref={rootRef as any} style={{ height: "108svh", minHeight: "108svh" }}>
      <div className="block-overlay" />
      <div className="canvas">
        <div className="products-image" data-aos="fade-up" data-aos-delay="0"><div className="image-content" style={{ transform: "scale(1.12)" }} /></div>
        <div className="products-eyebrow" style={{ width: "600px" }} data-aos="fade-up" data-aos-delay="70"><div className="text-content" style={{ fontSize: "18px" }}><p><span><b>Adubo orgânico para sua produção do pequeno ao grande volume.</b></span></p></div></div>
        <div className="products-title" data-aos="fade-up" data-aos-delay="140"><div className="title-content"><h2><span>ADUBO ORGÂNICO PARA SUA PRODUÇÃO</span></h2></div></div>
        <div className="products-description" style={{ width: "550px" }} data-aos="fade-up" data-aos-delay="210"><div className="text-content" style={{ fontSize: "18px" }}><p><span><span>Atendemos desde hortas e viveiros, com adubo orgânico de alta qualidade para mudas e cultivos, até pedidos acima de 1 tonelada para produtores, cooperativas e empresas.</span></span></p></div></div>
        <div className="products-cta" style={{ width: "auto", height: "auto" }} data-aos="fade-up" data-aos-delay="280">
          <a
            className="button-content"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              float: "none",
              width: "auto",
              height: "auto",
              padding: "16px 32px",
              fontSize: "15px",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "0.2px",
              whiteSpace: "nowrap",
              color: "#ffffff",
              textDecoration: "none",
              transition: "background-color 0.2s ease",
              borderRadius: "8px",
              boxShadow: "0 12px 26px rgba(47, 143, 54, 0.25)",
            }}
            href="https://wa.me/5567981242791"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Fale com a nossa equipe</span>
          </a>
        </div>
      </div>
    </section>
  );
}
