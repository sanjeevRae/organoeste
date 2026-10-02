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
import { allPosts, blogCategories, storeStatus, type PostWithId } from "@/lib/posts";
import { serializePosts } from "@/lib/admin";
import { ensureSchema, schemaState, type SchemaState } from "@/lib/schema";
import { todayISO, validateForm, type PostForm } from "@/lib/admin-format";
import { sanitizeContentHtml, saveUpload } from "@/lib/admin-upload";

export interface AdminState {
  source: "mysql" | "file";
  configured: boolean;
  /** The exact MySQL error, when the database could not be read. */
  dbError?: string;
  /** Result of ensuring the tables exist (created/repair/error). */
  schema: SchemaState;
  posts: PostWithId[];
  categories: string[];
}

async function requireAdmin(): Promise<string | null> {
  const store = await cookies();
  if (!isAdminCookie(store.get(ADMIN_COOKIE)?.value)) return "Sessão expirada. Entre de novo.";
  return null;
}

export async function adminBootstrap(): Promise<AdminState> {
  const denied = await requireAdmin();
  if (denied) return { source: "file", configured: adminConfigured(), schema: schemaState(), posts: [], categories: [] };
  // Opening the dashboard is what creates/repairs the tables, so a database
  // created in cPanel starts working without importing any SQL file.
  await ensureSchema();
  try {
    const [posts, categories, status] = await Promise.all([allPosts(), blogCategories(), storeStatus()]);
    return {
      source: status.source,
      configured: adminConfigured(),
      dbError: status.error,
      schema: schemaState(),
      posts,
      categories,
    };
  } catch (err) {
    // MySQL-only reads: a broken DB shows an explicit error + empty list,
    // never the bundled file.
    const detail = err instanceof Error ? err.message : String(err);
    return {
      source: "mysql",
      configured: adminConfigured(),
      dbError: detail,
      schema: schemaState(),
      posts: [],
      categories: [],
    };
  }
}

function takenSlugs(posts: PostWithId[], selfId: number | null): Set<string> {
  const taken = new Set<string>();
  for (const p of posts) {
    if (selfId !== null && p.id === selfId) continue;
    taken.add(p.slug);
  }
  return taken;
}

function orderByPublishedDesc(posts: PostWithId[]): PostWithId[] {
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

async function writePostRow(post: BlogPost & { id?: number }, tags: string[]): Promise<number> {
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
    const [result] = await pool.query("UPDATE blog_posts SET ? WHERE id = ?", [row, targetId]);
    // The row may have been deleted elsewhere between read and write: fall back
    // to INSERT instead of orphaning tags against a missing post_id (FK error).
    if ((result as { affectedRows?: number }).affectedRows === 0) {
      const [created] = await pool.query("INSERT INTO blog_posts SET ?", [row]);
      targetId = (created as { insertId: number }).insertId;
    }
  }
  await pool.query("DELETE FROM blog_tags WHERE post_id = ?", [targetId]);
  for (let i = 0; i < tags.length; i++) {
    await pool.query("INSERT INTO blog_tags (post_id, tag, sort_order) VALUES (?, ?, ?)", [targetId, tags[i], i]);
  }
  return targetId;
}

export interface SaveResult {
  ok: boolean;
  error?: string;
  fileOnly?: boolean;
  download?: { name: string; text: string };
  posts?: PostWithId[];
  /** Row the write landed on (id/slug); the editors sync the open form to it so
      a CREATE is immediately editable and repeat saves stay UPDATEs. */
  saved?: { id: number; slug: string };
  /** Where the save landed; the panel uses it to confirm a real DB write. */
  dbWrite?: "mysql";
}

function categoriesWith(categories: string[], category: string): string[] {
  return categories.includes(category) ? categories : [...categories, category];
}

export async function adminUploadImage(input: FormData): Promise<{ ok: boolean; url?: string; error?: string; file?: string; inDb?: boolean }> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  // A file bigger than the server-action body cap never reaches this code —
  // Next rejects it with React error #441 ("An error occurred in the Server
  // Components render"). next.config.ts raises the cap to 6mb for the 5 MB
  // editor limit, but when the cap still bites (proxy, old build), say so.
  const file = input.get("file");
  if (file === null) {
    return {
      ok: false,
      error:
        "A imagem não chegou ao servidor (limite de tamanho da requisição). " +
        "Use um arquivo de até 5 MB ou comprima a imagem e tente de novo.",
    };
  }
  if (!(file instanceof File)) return { ok: false, error: "Nenhum arquivo recebido." };
  try {
    const saved = await saveUpload(file);
    return { ok: true, url: saved.url, file: saved.file, inDb: saved.inDb };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Não foi possível salvar a imagem." };
  }
}

export async function adminSavePost(input: { form: PostForm }): Promise<SaveResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  // A bare filename pasted or kept from an older row never reaches the
  // validator raw: without this the image 404s and the save is rejected with a
  // "capa" error even though the file is in the media store.
  const rawImage = (input.form.image ?? "").trim();
  const cleanImage = rawImage && !/^([a-z][a-z0-9+.-]*:|\/)/i.test(rawImage) ? `/media/${rawImage}` : rawImage;
  const cleanHtml = sanitizeContentHtml(input.form.contentHtml);
  const form = { ...input.form, image: cleanImage, contentHtml: cleanHtml };
  // MySQL is the only source of truth: read the rows first so validation sees
  // real ids (an unreadable DB errors here instead of validating against the
  // bundled file and then failing the write).
  let posts: PostWithId[];
  try {
    posts = await allPosts();
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `O banco de dados recusou a leitura: ${detail}. Confira o .env (DB_*).` };
  }
  const error = validateForm(form, takenSlugs(posts, form.id), form.id);
  if (error) return { ok: false, error };
  const post = toBlogPost(form);
  // form.id wins (the row being edited, even when the slug was renamed);
  // otherwise an existing row with the same slug; otherwise null -> INSERT.
  // The withId check below only runs for edits (form.id !== null), so a fresh
  // CREATE whose slug happens to equal another post's slug still falls through
  // to the duplicate INSERT error (ER_DUP_ENTRY) with the real MySQL message
  // instead of being silently blocked here.
  const bySlug = posts.find((p) => p.slug === post.slug);
  const postId = form.id ?? bySlug?.id ?? null;
  if (form.id !== null && bySlug && bySlug.id !== form.id) {
    return { ok: false, error: "Esse slug já existe em outro post." };
  }
  const withId = { ...post, id: postId } as BlogPost & { id?: number };
  const previousSlug = form.id !== null ? posts.find((p) => p.id === form.id)?.slug : undefined;
  const schema = await ensureSchema();
  try {
    const savedId = await writePostRow(withId, withId.tags || []);
    revalidateBlog(withId.slug, previousSlug);
    // WRITE-THEN-READ: show exactly what MySQL stored (real id, rebuilt tags),
    // so a CREATE is immediately editable and an UPDATE never "disappears".
    // A re-read failure must never mask a successful write: the write already
    // committed and the cache was purged, so fall back to the merged preview.
    let next: PostWithId[];
    try {
      next = orderByPublishedDesc(await allPosts());
    } catch {
      next = orderByPublishedDesc([
        ...posts.filter((p) => p.slug !== withId.slug && p.id !== postId),
        { ...withId, id: savedId } as PostWithId,
      ]);
    }
    return { ok: true, posts: next, saved: { id: savedId, slug: withId.slug }, dbWrite: "mysql" };
  } catch (err) {
    // The real MySQL error travels to the panel instead of being swallowed, so
    // a missing table/column/privilege is visible (and fixable) at a glance.
    // NOTE: no DB call in this branch — allPosts()/blogCategories() already
    // succeeded above, but a second failure here used to throw a new exception
    // that hid the original write error ("Cannot read properties of...").
    const detail = err instanceof Error ? err.message : String(err);
    const because = schema.ready ? detail : `${schema.error ?? detail}`;
    const merged = orderByPublishedDesc([
      ...posts.filter((p) => p.slug !== withId.slug && p.id !== postId),
      { ...withId, id: postId ?? -1 } as PostWithId,
    ]);
    const cats = categoriesWith(posts.flatMap((p) => p.category ?? []), withId.category);
    return {
      ok: false,
      fileOnly: true,
      download: { name: "blog-posts.ts", text: serializePosts(merged as BlogPost[], cats) },
      error:
        `O banco de dados recusou a gravação: ${because}. ` +
        `Confira o .env (DB_*), as permissões do usuário MySQL e rode "npm run db:push" no servidor. ` +
        `Nada foi salvo no banco — use o botão de download apenas como saída de emergência.`,
    };
  }
}

export async function adminDeletePost(input: { slug: string }): Promise<SaveResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  let posts: PostWithId[];
  try {
    posts = await allPosts();
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `O banco de dados recusou a leitura: ${detail}. Confira o .env (DB_*).` };
  }
  const target = posts.find((p) => p.slug === input.slug);
  if (!target) return { ok: false, error: "Post não encontrado." };
  const schema = await ensureSchema();
  try {
    const pool = db();
    const [rows] = await pool.query("SELECT id FROM blog_posts WHERE slug = ?", [input.slug]);
    const id = (rows as { id: number }[])[0]?.id ?? target.id;
    await pool.query("DELETE FROM blog_tags WHERE post_id = ?", [id]);
    await pool.query("DELETE FROM blog_posts WHERE id = ?", [id]);
    revalidateBlog(input.slug);
    // WRITE-THEN-READ: confirm the row is really gone.
    const fresh = await allPosts();
    return { ok: true, posts: orderByPublishedDesc(fresh), dbWrite: "mysql" };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const because = schema.ready ? detail : `${schema.error ?? detail}`;
    const merged = posts.filter((p) => p.slug !== input.slug);
    let cats: string[] = [];
    try {
      cats = await blogCategories();
    } catch {
      cats = [];
    }
    return {
      ok: false,
      fileOnly: true,
      download: { name: "blog-posts.ts", text: serializePosts(merged as BlogPost[], cats) },
      error:
        `O banco de dados recusou a exclusão: ${because}. ` +
        `O post continua no banco — o download abaixo é só uma saída de emergência.`,
    };
  }
}

export async function adminExport(): Promise<SaveResult> {
  const denied = await requireAdmin();
  if (denied) return { ok: false, error: denied };
  // Explicit backup: surfaced DB errors, never a silent bundled-file export.
  const posts = orderByPublishedDesc(await allPosts());
  return {
    ok: true,
    download: { name: "blog-posts.ts", text: serializePosts(posts as BlogPost[], await blogCategories()) },
    posts,
  };
}

export async function adminPasswordHint(): Promise<string> {
  return adminConfigured() ? "" : "Defina ADMIN_PASSWORD no .env para proteger o painel.";
}
