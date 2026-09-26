/* Internal /solucoes page — responsive replica of
   https://www.organoeste.com.br/solucoes using the cloned copy and assets. */
import type { Metadata } from "next";

import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SolutionsHero from "@/components/solutions/SolutionsHero";
import SolutionsServices from "@/components/solutions/SolutionsServices";
import SolutionsProcess from "@/components/solutions/SolutionsProcess";
import SolutionsResults from "@/components/solutions/SolutionsResults";
import SolutionsSegments from "@/components/solutions/SolutionsSegments";
import SolutionsFaq from "@/components/solutions/SolutionsFaq";

export const metadata: Metadata = {
  title: "Soluções | Grupo Organoeste Ltda",
  description:
    "Soluções completas para coleta, transporte, tratamento e destinação sustentável de resíduos orgânicos.",
};

export default function SolucoesPage() {
  return (
    <>
      <Navbar />
      <main className="sol-page">
        <Reveal delay={0}>
          <SolutionsHero />
        </Reveal>
        <Reveal delay={0}>
          <SolutionsServices />
        </Reveal>
        <Reveal delay={0}>
          <SolutionsProcess />
        </Reveal>
        <Reveal delay={0}>
          <SolutionsResults />
        </Reveal>
        <Reveal delay={0}>
          <SolutionsSegments />
        </Reveal>
        <Reveal delay={0}>
          <SolutionsFaq />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
