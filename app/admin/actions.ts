"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  ADMIN_COOKIE,
  adminConfigured,
  adminPassword,
  adminToken,
  isAdminCookie,
  passwordHash,
  toBlogPost,
} from "@/lib/admin";
import type { BlogPost } from "@/data/blog-posts";
import { allPosts, blogCategories, storeStatus } from "@/lib/posts";
import { serializePosts } from "@/lib/admin";
import { todayISO, validateForm, type PostForm } from "@/lib/admin-format";
import { sanitizeContentHtml, saveUpload } from "@/lib/admin-upload";

export interface AdminState {
  source: "mysql" | "file";
  configured: boolean;
  /** Why the dashboard fell back to the bundled posts, when it did. */
  dbError?: string;
  posts: (BlogPost & { id?: number })[];
  categories: string[];
}

async function requireAdmin(): Promise<string | null> {
  const store = await cookies();
  if (!isAdminCookie(store.get(ADMIN_COOKIE)?.value)) return "Sessão expirada. Entre de novo.";
  return null;
}

export async function adminBootstrap(): Promise<AdminState> {
  const denied = await requireAdmin();
  if (denied) return { source: "file", configured: adminConfigured(), posts: [], categories: [] };
  const [posts, categories, status] = await Promise.all([allPosts(), blogCategories(), storeStatus()]);
  return {
    source: status.source,
    configured: adminConfigured(),
    dbError: status.error,
    posts: posts as (BlogPost & { id?: number })[],
    categories,
  };
}

function takenSlugs(posts: (BlogPost & { id?: number })[], selfId: number | null): Set<string> {
  const taken = new Set<string>();
  for (const p of posts) {
    if (selfId !== null && (p.id ?? null) === selfId) continue;
    taken.add(p.slug);
  }
  return taken;
}

function orderByPublishedDesc(posts: (BlogPost & { id?: number })[]): (BlogPost & { id?: number })[] {
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** The public blog is ISR-cached: purge the touched paths after a write so an
    edit or delete is visible immediately instead of after the 60s window.
    Wrapped because revalidatePath throws outside a request scope (build time). */
function revalidateBlog(...slugs: (string | undefined)[]): void {
  try {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    for (const slug of slugs) {
      if (slug) revalidatePath(`/blog/${slug}`);
    }
  } catch {
    /* not inside a request — nothing to purge */
  }
}

export async function adminLogin(input: { password: string }): Promise<{ ok: boolean; error?: string }> {
  if (!input.password || passwordHash(input.password) !== adminToken()) {
    return { ok: false, error: "Senha incorreta." };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, adminToken(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return { ok: true };
}

export async function adminLogout(): Promise<{ ok: true }> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return { ok: true };
}

async function writePostRow(post: BlogPost & { id?: number }, tags: string[]): Promise<void> {
  const pool = db();
  const [existing] = await pool.query("SELECT id FROM blog_posts WHERE slug = ?", [post.slug]);
  const existingId = (existing as { id: number }[])[0]?.id ?? null;
  const id = post.id ?? existingId;
  const row = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    author_role: post.authorRole || "",
    published_at: post.publishedAt,
    updated_at: todayISO(),
    status: post.status,
    featured: post.featured ? 1 : 0,
    image: post.image,
    image_alt: post.imageAlt || "",
    content_html: post.contentHtml,
    show_toc: post.showToc === false ? 0 : 1,
    seo_title: post.seoTitle || null,
    meta_description: post.metaDescription || null,
    focus_keyword: post.focusKeyword || null,
    canonical_url: post.canonicalUrl || null,
    og_image: post.ogImage || null,
  };
  let targetId = id;
  if (targetId === null) {
    const [created] = await pool.query("INSERT INTO blog_posts SET ?", [row]);
    targetId = (created as { insertId: number }).insertId;
  } else {
    await pool.query("UPDATE blog_posts SET ? WHERE id = ?", [row, targetId]);
  }
  await pool.query("DELETE FROM blog_tags WHERE post_id = ?", [targetId]);
  for (let i = 0; i < tags.length; i++) {
    await pool.query("INSERT INTO blog_tags (post_id, tag, sort_order) VALUES (?, ?, ?)", [targetId, tags[i], i]);
  }
}

export interface SaveResult {
  ok: boolean;
  error?: string;
  fileOnly?: boolean;
  download?: { name: string; text: string };
  posts?: (BlogPost & { id?: number })[];
}

function categoriesWith(categories: string[], category: string): string[] {
  return categories.includes(category) ? categories : [...categories, category];
}

export async function adminUploadImage(input: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const file = input.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Nenhum arquivo recebido." };
  try {
    const url = await saveUpload(file);
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Não foi possível salvar a imagem." };
  }
}

export async function adminSavePost(input: { form: PostForm }): Promise<SaveResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const cleanHtml = sanitizeContentHtml(input.form.contentHtml);
  const form = { ...input.form, contentHtml: cleanHtml };
  const posts = (await allPosts()) as (BlogPost & { id?: number })[];
  const error = validateForm(form, takenSlugs(posts, form.id), form.id);
  if (error) return { ok: false, error };
  const post = toBlogPost(form);
  const postId = form.id ?? (posts.find((p) => p.slug === post.slug) as (BlogPost & { id?: number }) | undefined)?.id ?? null;
  const withId = { ...post, id: postId } as BlogPost & { id?: number };
  const merged = orderByPublishedDesc([...posts.filter((p) => p.slug !== withId.slug && (p.id ?? null) !== withId.id), withId]);
  const categories = categoriesWith(await blogCategories(), withId.category);
  const previousSlug = form.id !== null ? posts.find((p) => (p.id ?? null) === form.id)?.slug : undefined;
  try {
    await writePostRow(withId, withId.tags || []);
    revalidateBlog(withId.slug, previousSlug);
    return { ok: true, posts: merged };
  } catch {
    return {
      ok: false,
      fileOnly: true,
      download: { name: "blog-posts.ts", text: serializePosts(merged as BlogPost[], categories) },
      error: "MySQL não respondeu. Baixe o arquivo gerado e substitua data/blog-posts.ts, ou ajuste a conexão e salve de novo.",
    };
  }
}

export async function adminDeletePost(input: { slug: string }): Promise<SaveResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const posts = (await allPosts()) as (BlogPost & { id?: number })[];
  const target = posts.find((p) => p.slug === input.slug);
  if (!target) return { ok: false, error: "Post não encontrado." };
  try {
    const pool = db();
    const [rows] = await pool.query("SELECT id FROM blog_posts WHERE slug = ?", [input.slug]);
    const id = (rows as { id: number }[])[0]?.id ?? target.id ?? null;
    if (id === null) throw new Error("missing id");
    await pool.query("DELETE FROM blog_tags WHERE post_id = ?", [id]);
    await pool.query("DELETE FROM blog_posts WHERE id = ?", [id]);
    revalidateBlog(input.slug);
    return { ok: true, posts: posts.filter((p) => p.slug !== input.slug) };
  } catch {
    const merged = posts.filter((p) => p.slug !== input.slug);
    return {
      ok: false,
      fileOnly: true,
      download: { name: "blog-posts.ts", text: serializePosts(merged as BlogPost[], await blogCategories()) },
      error: "MySQL não respondeu. Baixe o arquivo sem esse post e substitua data/blog-posts.ts.",
    };
  }
}

export async function adminExport(): Promise<SaveResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  const posts = orderByPublishedDesc((await allPosts()) as (BlogPost & { id?: number })[]);
  return {
    ok: true,
    download: { name: "blog-posts.ts", text: serializePosts(posts as BlogPost[], await blogCategories()) },
    posts,
  };
}

export async function adminPasswordHint(): Promise<string> {
  return adminConfigured() ? "" : "Defina ADMIN_PASSWORD no .env para proteger o painel.";
}
