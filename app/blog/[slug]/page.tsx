import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import BlogTocRail from "@/components/BlogTocRail";
import { BlogPostListen, BlogPostShare } from "@/components/BlogPostTools";
import { getPost, publishedPosts } from "@/lib/posts";
import { formatDateBR, readingTime, speakingTime, tocFromHtml, SITE_URL } from "@/lib/blog";

export async function generateStaticParams() {
  return (await publishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const images = [post.ogImage || post.image];
  return {
    title,
    description,
    alternates: { canonical: post.canonicalUrl || url },
    openGraph: { type: "article", url, title, description, images },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const listenTime = speakingTime(post.contentHtml);
  const toc = post.showToc === false ? [] : tocFromHtml(post.contentHtml);
  const rel = (await publishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: [`${SITE_URL}${post.ogImage || post.image}`],
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  return (
    <>
      <Navbar />
      <main className="blg-page blg-detail">
        <div className="blg-wrap">
          <header className="blg-post-head">
            <p className="blg-detail-cat">{post.category}</p>
            <h1 className="blg-detail-title">{post.title}</h1>
            <p className="blg-detail-meta">
              <time dateTime={post.publishedAt}>Publicado em {formatDateBR(post.publishedAt)}</time>
            </p>
          </header>

          <div className="blg-post-bar">
            <BlogPostListen duration={listenTime} />
            <BlogPostShare title={post.title} url={url} />
          </div>

          <div className="blg-post-body">
            <aside className="blg-rail">
              {toc.length > 0 && <BlogTocRail items={toc} />}
            </aside>

            <div className="blg-post-main">
              <p className="blg-post-standfirst">{post.excerpt}</p>
              <figure className="blg-detail-media">
                <img src={post.image} alt={post.imageAlt} decoding="async" />
              </figure>
              <div className="blg-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
              {post.tags.length > 0 && (
                <div className="blg-tags">
                  {post.tags.map((tag) => (
                    <span className="blg-tag" key={tag}>{tag}</span>
                  ))}
                </div>
              )}
              <aside className="blg-cta" aria-label="Fale com a Organoeste">
                <h2>Precisa de ajuda com resíduos orgânicos?</h2>
                <p>Fale com a Organoeste e receba um diagnóstico sem compromisso.</p>
                <a className="blg-cta-btn" href="https://wa.me/5567992401937" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
              </aside>
            </div>
          </div>
          {rel.length > 0 && (
            <section className="blg-related" aria-label="Relacionados">
              <h2>Leia também</h2>
              <div className="blg-grid">
                {rel.map((r) => (
                  <article key={r.slug} className="blg-card">
                    <Link className="blg-card-link" href={`/blog/${r.slug}`}>
                      <img className="blg-card-img" src={r.image} alt={r.imageAlt} loading="lazy" decoding="async" />
                      <div className="blg-card-overlay">
                        <h3 className="blg-card-title">{r.title}</h3>
                        <p className="blg-card-meta">
                          <span className="blg-chip">{r.category}</span>
                          <span className="blg-chip">{readingTime(r.contentHtml)} min</span>
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Footer />
    </>
  );
}
