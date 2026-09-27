import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import Solutions from "@/components/solutions";

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
        <Solutions />
      </main>
      <Footer />
    </>
  );
}
