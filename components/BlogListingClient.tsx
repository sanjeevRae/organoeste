"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/data/blog-posts";
import { formatDateBR, readingTime } from "@/lib/blog";

const PAGE_SIZE = 6;

function LatestCard({ post }: { post: BlogPost }) {
  return (
    <article className="blg-latest">
      <Link className="blg-latest-link" href={`/blog/${post.slug}`}>
        <img className="blg-latest-img" src={post.image} alt={post.imageAlt} decoding="async" />
        <div className="blg-latest-overlay">
          <p className="blg-latest-kicker">Mais recente</p>
          <h2 className="blg-latest-title">{post.title}</h2>
          <div className="blg-latest-meta">
            <p className="blg-meta-block">
              <span className="blg-meta-label">Escrito por</span>
              <span className="blg-meta-value">
                {post.author}
              </span>
            </p>
            <p className="blg-meta-block">
              <span className="blg-meta-label">Publicado em</span>
              <span className="blg-meta-value">{formatDateBR(post.publishedAt)}</span>
            </p>
            <p className="blg-meta-block blg-meta-right">
              <span className="blg-meta-label">Categorias</span>
              <span className="blg-chips">
                <span className="blg-chip">{post.category}</span>
                {post.tags.slice(0, 2).map((tag) => (
                  <span className="blg-chip" key={tag}>{tag}</span>
                ))}
                <span className="blg-chip">{readingTime(post.contentHtml)} min de leitura</span>
              </span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

function GridCard({ post }: { post: BlogPost }) {
  return (
    <article className="blg-card">
      <Link className="blg-card-link" href={`/blog/${post.slug}`}>
        <img className="blg-card-img" src={post.image} alt={post.imageAlt} loading="lazy" decoding="async" />
        <div className="blg-card-overlay">
          <h3 className="blg-card-title">{post.title}</h3>
          <p className="blg-card-meta">
            <span className="blg-chip">{post.category}</span>
            <span className="blg-chip">{readingTime(post.contentHtml)} min</span>
          </p>
        </div>
      </Link>
    </article>
  );
}

export default function BlogListingClient({ posts, categories: all }: { posts: BlogPost[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const used = new Set(posts.map((p) => p.category));
    return ["Todas", ...all.filter((c) => used.has(c as string))];
  }, [posts, all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const inCat = category === "Todas" || p.category === category;
      if (!inCat) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.excerpt} ${p.author} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [posts, query, category]);

  const isFiltered = query.trim() !== "" || category !== "Todas";
  const lead = filtered[0];
  const rest = filtered.slice(1);
  const shown = rest.slice(0, visible);

  function resetFilters() {
    setQuery("");
    setCategory("Todas");
    setVisible(PAGE_SIZE);
  }

  return (
    <>
      {lead && <LatestCard post={lead} />}

      <div className="blg-bar">
        <h2 className="blg-bar-title">
          {isFiltered ? `Resultados (${filtered.length})` : "Últimos artigos"}
        </h2>
        <input
          className="blg-search"
          type="search"
          placeholder="Buscar artigos…"
          aria-label="Buscar artigos"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
        />
        <button type="button" className="blg-viewall" onClick={resetFilters}>
          Ver todos os artigos
        </button>
      </div>

      <div className="blg-cats" role="group" aria-label="Filtrar por categoria">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={"blg-cat" + (c === category ? " blg-cat-on" : "")}
            aria-pressed={c === category}
            onClick={() => {
              setCategory(c);
              setVisible(PAGE_SIZE);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="blg-empty">Nenhum artigo encontrado. Tente outro termo ou categoria.</p>
      ) : (
        <div className="blg-grid">
          {shown.map((p) => (
            <GridCard key={p.slug} post={p} />
          ))}
        </div>
      )}

      {visible < rest.length && (
        <p className="blg-more-wrap">
          <button type="button" className="blg-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Carregar mais artigos
          </button>
        </p>
      )}
    </>
  );
}
