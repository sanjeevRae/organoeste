import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import Blog from "@/components/Blog";

export const metadata: Metadata = {
  title: "Blog | Grupo Organoeste Ltda",
  description:
    "Conteúdos sobre coleta de resíduos orgânicos, compostagem, adubo orgânico e sustentabilidade.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <Blog />
      <Footer />
    </>
  );
}
