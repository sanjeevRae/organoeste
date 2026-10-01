import type { BlogPost } from "@/data/blog-posts";

export const POST_FIELDS = [
  "slug",
  "title",
  "excerpt",
  "category",
  "author",
  "authorRole",
  "publishedAt",
  "updatedAt",
  "status",
  "featured",
  "image",
  "imageAlt",
  "contentHtml",
  "showToc",
  "seoTitle",
  "metaDescription",
  "focusKeyword",
  "canonicalUrl",
  "ogImage",
] as const;

export type PostField = (typeof POST_FIELDS)[number];

/** Fields the admin actually edits (dates as plain yyyy-mm-dd strings). */
export interface PostForm {
  id: number | null;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  status: "draft" | "published";
  featured: boolean;
  image: string;
  imageAlt: string;
  tags: string;
  showToc: boolean;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogImage: string;
  contentHtml: string;
}

export const BLANK_POST = (category: string): PostForm => ({
  id: null,
  slug: "",
  title: "",
  excerpt: "",
  category,
  author: "Equipe Organoeste",
  authorRole: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  status: "published",
  featured: false,
  image: "/images/solucoes-compostagem.png",
  imageAlt: "",
  tags: "",
  showToc: true,
  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  ogImage: "",
  contentHtml: "<p></p>",
});

/** DB/TS row -> editable form. Server and client share this exact mapping. */
export function toForm(p: BlogPost): PostForm {
  return {
    id: (p as BlogPost & { id?: number }).id ?? null,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    author: p.author,
    authorRole: p.authorRole ?? "",
    publishedAt: (p.publishedAt || "").slice(0, 10),
    status: p.status,
    featured: !!p.featured,
    image: p.image,
    imageAlt: p.imageAlt ?? "",
    tags: (p.tags || []).join(", "),
    showToc: p.showToc !== false,
    seoTitle: p.seoTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    focusKeyword: p.focusKeyword ?? "",
    canonicalUrl: p.canonicalUrl ?? "",
    ogImage: p.ogImage ?? "",
    contentHtml: p.contentHtml,
  };
}

/** Today's date as yyyy-mm-dd for the updatedAt stamp. */
export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateForm(p: PostForm, taken: Set<string>, selfId: number | null): string | null {
  if (!p.slug.trim()) return "Slug é obrigatório.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug.trim()))
    return "Slug só aceita letras minúsculas, números e hífens.";
  if (taken.has(p.slug.trim()) && !takenIsSelf(p, selfId)) return "Esse slug já existe em outro post.";
  if (!p.title.trim()) return "Título é obrigatório.";
  if (!p.excerpt.trim()) return "Resumo é obrigatório.";
  if (!p.category.trim()) return "Categoria é obrigatória.";
  if (!p.author.trim()) return "Autor é obrigatório.";
  if (!DATE_RE.test(p.publishedAt)) return "Data de publicação inválida (aaaa-mm-dd).";
  if (!p.image.trim() || !/^(\/images\/|\/uploads\/|\/media\/|https?:\/\/)/.test(p.image.trim()))
    return "Capa precisa ser um caminho de /images/, /uploads/ ou /media/, ou uma URL https:// (ou envie pela galeria).";
  if (!p.contentHtml.trim() || p.contentHtml.trim() === "<p></p>")
    return "O conteúdo do artigo está vazio.";
  return null;
}

function takenIsSelf(p: PostForm, selfId: number | null): boolean {
  return selfId !== null && p.id === selfId;
}

/** Form -> storage shape (today stamped as updatedAt, tags split on commas). */
export function toStorage(p: PostForm): BlogPost & { id?: number } {
  const clean = (v: string): string => v.trim();
  const slug = clean(p.slug);
  return {
    ...(p.id !== null ? { id: p.id } : {}),
    slug,
    title: clean(p.title),
    excerpt: clean(p.excerpt),
    category: clean(p.category),
    author: clean(p.author),
    authorRole: clean(p.authorRole),
    publishedAt: p.publishedAt,
    updatedAt: todayISO(),
    status: p.status,
    featured: p.featured ? true : undefined,
    image: clean(p.image),
    imageAlt: clean(p.imageAlt),
    contentHtml: p.contentHtml,
    showToc: p.showToc ? undefined : false,
    tags: p.tags.split(",").map((t) => t.trim()).filter(Boolean),
    seoTitle: clean(p.seoTitle) || undefined,
    metaDescription: clean(p.metaDescription) || undefined,
    focusKeyword: clean(p.focusKeyword) || undefined,
    canonicalUrl: clean(p.canonicalUrl) || undefined,
    ogImage: clean(p.ogImage) || undefined,
  };
}
