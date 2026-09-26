/* Home page — composes the sections in page order; each section is wrapped in
   Reveal so it fades in the first time it enters the viewport. */
import Navbar from "@/components/navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ProductsSection from "@/components/ProductsSection";
import Clients from "@/components/Clients";
import Contact from "@/components/contact";
import ProcessSection from "@/components/ProcessSection";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Navbar />
      <Reveal delay={80}>
        <Hero />
      </Reveal>
      <Reveal delay={0}>
        <About />
      </Reveal>
      <Reveal delay={0}>
        <ProductsSection />
      </Reveal>
      <Reveal delay={80}>
        <Clients />
      </Reveal>
      <Reveal delay={80}>
        <Contact />
      </Reveal>
      <Reveal delay={0}>
        <ProcessSection />
      </Reveal>
      <Reveal delay={80}>
        <Footer />
      </Reveal>
    </>
  );
}
