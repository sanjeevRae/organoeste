import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import BlogListingClient from "@/components/BlogListingClient";
import { blogCategories, publishedPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog | Grupo Organoeste Ltda",
  description:
    "Artigos sobre coleta de residuos, compostagem, adubo organico e sustentabilidade.",
  alternates: { canonical: "/blog" },
};

/* Reads live from MySQL. ISR keeps the page static-fast and re-checks the
   database at most once a minute, so posts edited straight in phpMyAdmin show
   up without a rebuild; adminSavePost/adminDeletePost purge it instantly. */
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await publishedPosts();
  const categories = await blogCategories();
  return (
    <>
      <Navbar />
      <main className="blg-page">
        <section className="blg-hero" aria-labelledby="blg-titulo">
          <div className="blg-wrap">
            <p className="blg-eyebrow">Blog</p>
            <h1 className="blg-title" id="blg-titulo">Blog Organoeste</h1>
            <p className="blg-sub">
              Conteúdo sobre coleta licenciada, compostagem industrial, adubo orgânico e
              sustentabilidade, escrito por quem opera o processo todos os dias.
            </p>
          </div>
        </section>
        <div className="blg-wrap">
          <BlogListingClient posts={posts} categories={categories} />
        </div>
      </main>
      <Footer />
    </>
  );
}
