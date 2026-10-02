import { blogPosts, BLOG_CATEGORIES, type BlogPost } from "@/data/blog-posts";
import { db, dbConfigured, dbPing } from "./db";
import { absoluteAttrs, mediaSrc, sortPublished } from "./blog";
import { ensureSchema } from "./schema";

export const BLOG_SOURCE: "mysql" | "file" = process.env.BLOG_SOURCE === "file" ? "file" : "mysql";

/** A row read from MySQL always carries its primary key (the admin needs it to
    tell "edit this row" apart from "this slug is taken by another row"). */
export type PostWithId = BlogPost & { id: number };

function dbErrorMessage(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err);
  return text.replace(/\s+/g, " ").slice(0, 300);
}

function normalizeRow(
  r: { id: number; featured: number | boolean; showToc: number | boolean } & Record<string, unknown>,
  tagsById: Map<number, string[]>,
): PostWithId {
  const { id, featured, showToc, ...rest } = r;
  return {
    ...(rest as unknown as BlogPost),
    id,
    // Rows hand-edited in phpMyAdmin may carry a relative image path or a
    // relative src inside the HTML; make them root-relative so the browser
    // never resolves the file against the current page URL.
    image: mediaSrc(rest.image as string | null),
    ogImage: mediaSrc(rest.ogImage as string | null) || undefined,
    contentHtml: absoluteAttrs(rest.contentHtml as string),
    featured: featured ? true : undefined,
    // undefined means "show" everywhere downstream
    showToc: showToc === 0 || showToc === false ? false : undefined,
    tags: tagsById.get(id) ?? [],
  } as unknown as PostWithId;
}

async function rowsFromDb(): Promise<PostWithId[]> {
  const schema = await ensureSchema();
  if (!schema.ready) {
    throw new Error(schema.error ?? "não foi possível preparar as tabelas do blog.");
  }
  try {
    const [posts] = await db().query(
      "SELECT id, slug, title, excerpt, category, author, author_role AS authorRole, " +
      "DATE_FORMAT(published_at, '%Y-%m-%d') AS publishedAt, DATE_FORMAT(updated_at, '%Y-%m-%d') AS updatedAt, " +
      "status, featured, image, image_alt AS imageAlt, content_html AS contentHtml, show_toc AS showToc, " +
      "seo_title AS seoTitle, meta_description AS metaDescription, focus_keyword AS focusKeyword, " +
      "canonical_url AS canonicalUrl, og_image AS ogImage FROM blog_posts",
    );
    const [tagRows] = await db().query(
      "SELECT post_id AS postId, tag FROM blog_tags ORDER BY sort_order",
    );
    const tagsById = new Map<number, string[]>();
    for (const t of tagRows as { postId: number; tag: string }[]) {
      const list = tagsById.get(t.postId) ?? [];
      list.push(t.tag);
      tagsById.set(t.postId, list);
    }
    return (posts as ({ id: number; featured: number | boolean; showToc: number | boolean } & Record<string, unknown>)[]).map((r) =>
      normalizeRow(r, tagsById),
    );
  } catch (err) {
    // MySQL is the only source of truth: never fall back to the bundled file
    // silently. Callers turn this into an explicit on-page / in-panel error.
    throw new Error(`MySQL não respondeu: ${dbErrorMessage(err)}`);
  }
}

/** All posts in store order (admin lists drafts too). MySQL-only unless
    BLOG_SOURCE=file is set explicitly. Throws on DB error; 0 rows -> []. */
export async function allPosts(): Promise<PostWithId[]> {
  if (BLOG_SOURCE === "file") {
    return blogPosts.map((p, i) => ({ ...p, id: -(i + 1) }));
  }
  return rowsFromDb();
}

export async function publishedPosts(): Promise<PostWithId[]> {
  return sortPublished(await allPosts()) as PostWithId[];
}

export async function getPost(slug: string): Promise<PostWithId | undefined> {
  return publishedPosts().then((posts) => posts.find((p) => p.slug === slug));
}

/** Categories live in MySQL too (DB names only). Throws on DB error. */
export async function blogCategories(): Promise<string[]> {
  if (BLOG_SOURCE === "file") return [...BLOG_CATEGORIES];
  const schema = await ensureSchema();
  if (!schema.ready) {
    throw new Error(schema.error ?? "não foi possível preparar as tabelas do blog.");
  }
  try {
    const [rows] = await db().query("SELECT name FROM blog_categories ORDER BY sort_order, name");
    return (rows as { name: string }[]).map((r) => r.name);
  } catch (err) {
    throw new Error(`MySQL não respondeu: ${dbErrorMessage(err)}`);
  }
}

export interface StoreStatus {
  /** Where the last read came from: the database, or the bundled file only
      when BLOG_SOURCE=file was set explicitly. */
  source: "mysql" | "file";
  /** Rows in the database (0 while it is unreachable). */
  posts: number;
  /** True when credentials exist but the server/tables did not answer. */
  configured: boolean;
  error?: string;
}

/** Admin-facing diagnostics: is the dashboard really talking to MySQL? It runs
    a single live connection check. A working DB never shows stale counters
    after edits or creates; a broken DB reports source "mysql" + error instead
    of silently switching to the bundled file. */
export async function storeStatus(): Promise<StoreStatus> {
  if (BLOG_SOURCE === "file") {
    return { source: "file", posts: blogPosts.length, configured: dbConfigured() };
  }
  const health = await dbPing({ ping: true });
  if (!health.ok) {
    return { source: "mysql", posts: 0, configured: health.configured, error: health.error };
  }
  return { source: "mysql", posts: health.posts, configured: true };
}
