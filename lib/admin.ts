// SERVER ONLY — do not import from client components (uses node:crypto).
// Helpers for the /admin dashboard: password gate + regeneration of
// data/blog-posts.ts as a validated, drop-in TypeScript file.
import { createHash } from "crypto";
import type { BlogPost } from "@/data/blog-posts";
import { type PostForm, toStorage } from "./admin-format";

export const ADMIN_COOKIE = "organoeste-admin";
const DEFAULT_PASSWORD = "admin123";
const SALT = "organoeste-admin:";

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

export function passwordHash(password: string): string {
  return createHash("sha256").update(`${SALT}${password}`).digest("hex");
}

/** Value stored in the session cookie (never the raw password). */
export function adminToken(): string {
  return passwordHash(adminPassword());
}

export function isAdminCookie(value: string | undefined): boolean {
  return !!value && value === adminToken();
}

/** "2026-09-29" -> "29 de setembro de 2026" (full month, no TZ shift). */
export function formatDateLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${Number(m[3])} de ${months[Number(m[2]) - 1]} de ${m[1]}`;
}


const q = (v: string): string => JSON.stringify(v);

/** contentHtml is emitted as a template literal, so escape \\, ` and ${. */
const tpl = (v: string): string =>
  "`" + v.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

const TS_TYPES = `/* Static blog store. Full CMS field shape so a future dashboard can
   create/edit/hide posts without touching templates. Only published shown. */

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  authorRole: string;
  publishedAt: string;
  updatedAt: string;
  status: BlogStatus;
  featured?: boolean;
  image: string;
  imageAlt: string;
  contentHtml: string;
  showToc?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
}
`;

/** Regenerates data/blog-posts.ts from validated posts. Keep field order stable. */
export function serializePosts(posts: BlogPost[], categories: string[]): string {
  const out: string[] = [TS_TYPES, ""];
  out.push("export const BLOG_CATEGORIES: string[] = [");
  for (const c of categories) out.push(`  ${q(c)},`);
  out.push("];", "", "export const blogPosts: BlogPost[] = [");
  for (const p of posts) {
    out.push("  {");
    out.push(`    slug: ${q(p.slug)},`);
    out.push(`    title: ${q(p.title)},`);
    out.push(`    excerpt: ${q(p.excerpt)},`);
    out.push(`    category: ${q(p.category)},`);
    out.push(`    tags: [${p.tags.map((t) => q(t)).join(", ")}],`);
    out.push(`    author: ${q(p.author)},`);
    out.push(`    authorRole: ${q(p.authorRole)},`);
    out.push(`    publishedAt: ${q(p.publishedAt)},`);
    out.push(`    updatedAt: ${q(p.updatedAt)},`);
    out.push(`    status: ${q(p.status)},`);
    if (p.featured) out.push(`    featured: true,`);
    out.push(`    image: ${q(p.image)},`);
    out.push(`    imageAlt: ${q(p.imageAlt)},`);
    out.push(`    showToc: ${p.showToc === false ? "false" : "true"},`);
    if (p.seoTitle) out.push(`    seoTitle: ${q(p.seoTitle)},`);
    if (p.metaDescription) out.push(`    metaDescription: ${q(p.metaDescription)},`);
    if (p.focusKeyword) out.push(`    focusKeyword: ${q(p.focusKeyword)},`);
    if (p.canonicalUrl) out.push(`    canonicalUrl: ${q(p.canonicalUrl)},`);
    if (p.ogImage) out.push(`    ogImage: ${q(p.ogImage)},`);
    out.push(`    contentHtml: ${tpl(p.contentHtml)},`);
    out.push("  },");
  }
  out.push("];", "");
  return out.join("\n");
}

const DB_COLS = [
  "slug", "title", "excerpt", "category", "author", "authorRole",
  "publishedAt", "updatedAt", "status", "featured", "image", "imageAlt",
  "contentHtml", "showToc", "seoTitle", "metaDescription", "focusKeyword",
  "canonicalUrl", "ogImage",
] as const;

/** PostForm -> the exact BlogPost shape both writers (DB + TS file) share. */
export function toBlogPost(form: PostForm): BlogPost {
  const stored = toStorage(form);
  const post: Record<string, unknown> = {};
  for (const key of DB_COLS) post[key] = (stored as unknown as Record<string, unknown>)[key];
  post.tags = stored.tags;
  if ((stored as unknown as { id?: number }).id !== undefined) post.id = (stored as unknown as { id?: number }).id;
  return post as unknown as BlogPost;
}

