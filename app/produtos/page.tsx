import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import ProdutosClient from "@/components/ProdutosClient";

export const metadata: Metadata = {
  title: "Produtos | Grupo Organoeste Ltda",
  description:
    "OrganoSuper: fertilizante orgânico composto de alta performance, registrado no MAPA. Vendas a granel, sacos de 40 kg e linha Fertipower para casa e jardim.",
};

export default function ProdutosPage() {
  return (
    <>
      <Navbar />
      <ProdutosClient />
      <Footer />
    </>
  );
}
