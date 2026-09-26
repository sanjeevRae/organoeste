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
    <section className="products-section" ref={rootRef as any}>
      <div className="block-overlay" />
      <div className="canvas">
        <div className="products-image" data-aos="fade-up" data-aos-delay="0"><div className="image-content" /></div>
        <div className="products-eyebrow" data-aos="fade-up" data-aos-delay="70"><div className="text-content"><p><span><b>Adubo orgânico para sua produção do pequeno ao grande volume.</b></span></p></div></div>
        <div className="products-title" data-aos="fade-up" data-aos-delay="140"><div className="title-content"><h2><span>ADUBO ORGÂNICO PARA SUA PRODUÇÃO</span></h2></div></div>
        <div className="products-description" data-aos="fade-up" data-aos-delay="210"><div className="text-content"><p><span><span>Atendemos desde hortas e viveiros, com adubo orgânico de alta qualidade para mudas e cultivos, até pedidos acima de 1 tonelada para produtores, cooperativas e empresas.</span></span></p></div></div>
        <div className="products-cta" data-aos="fade-up" data-aos-delay="280"><a className="button-content" href="https://wa.me/5567981242791">Fale com a nossa equipe</a></div>
      </div>
    </section>
  );
}
