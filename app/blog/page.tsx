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

export const revalidate = 60;

/* Reads live from MySQL (the only source of truth). A DB failure renders an
   explicit error and 0 rows render an empty list — never the bundled file. */
export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof publishedPosts>> = [];
  let categories: string[] = [];
  let error: string | null = null;
  try {
    [posts, categories] = await Promise.all([publishedPosts(), blogCategories()]);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
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
          {error ? (
            <p className="blg-empty" role="alert">
              O blog está temporariamente indisponível ({error}). Tente de novo em instantes.
            </p>
          ) : (
            <BlogListingClient posts={posts} categories={categories} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
