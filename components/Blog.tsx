/* Blog — page shell for /blog (components/Blog.tsx + app/blog/page.tsx).
   Intentionally empty: the header and footer come from the route, so only the
   placeholder band below is rendered until the first posts are added.
   Styles are namespaced as .blog-* in app/site.css. */

export default function Blog() {
  return (
    <main className="blog-page">
      <section className="blog-section" aria-labelledby="blog-titulo">
        <div className="blog-wrap">
          <p className="blog-eyebrow">Blog</p>
          <h1 className="blog-title" id="blog-titulo">
            Blog
          </h1>
          <p className="blog-lead">
            Em breve: conteúdos sobre coleta, compostagem, adubo orgânico e
            sustentabilidade.
          </p>
        </div>
      </section>
    </main>
  );
}
