import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import PesquisaClient from "@/components/PesquisaClient";

export const metadata: Metadata = {
  title: "Pesquisa & Desenvolvimento | Grupo Organoeste Ltda",
  description:
    "Conheça os projetos BioFrass e UVRO-SECA: duas novas fases produtivas aprovadas para a Organoeste Campo Grande/MS, com biometano e biofertilizante de nova geração.",
};

export default function PesquisaDesenvolvimentoPage() {
  return (
    <>
      <Navbar />
      <PesquisaClient />
      <Footer />
    </>
  );
}
