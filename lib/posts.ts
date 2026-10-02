import { blogPosts, BLOG_CATEGORIES, type BlogPost } from "@/data/blog-posts";
import { db, dbConfigured, dbPing } from "./db";
import { absoluteAttrs, mediaSrc, sortPublished } from "./blog";
import { ensureSchema } from "./schema";

export const BLOG_SOURCE: "mysql" | "file" = process.env.BLOG_SOURCE === "file" ? "file" : "mysql";

let dbDownLogged = false;

async function rowsFromDb(): Promise<BlogPost[] | null> {
  if (BLOG_SOURCE === "file") return null;
  // A missing table/column is what silently pushed the site back to the bundled
  // posts; repairing the schema first (idempotent) keeps reads on the database.
  await ensureSchema();
  try {
    const [posts] = await db().query(
      "SELECT id, slug, title, excerpt, category, author, author_role AS authorRole, " +
      "DATE_FORMAT(published_at, '%Y-%m-%d') AS publishedAt, DATE_FORMAT(updated_at, '%Y-%m-%d') AS updatedAt, " +
      "status, featured, image, image_alt AS imageAlt, content_html AS contentHtml, show_toc AS showToc, " +
      "seo_title AS seoTitle, meta_description AS metaDescription, focus_keyword AS focusKeyword, " +
      "canonical_url AS canonicalUrl, og_image AS ogImage FROM blog_posts"
    );
    const [tagRows] = await db().query(
      "SELECT post_id AS postId, tag FROM blog_tags ORDER BY sort_order"
    );
    const tagsById = new Map<number, string[]>();
    for (const t of tagRows as { postId: number; tag: string }[]) {
      const list = tagsById.get(t.postId) ?? [];
      list.push(t.tag);
      tagsById.set(t.postId, list);
    }
    return (posts as ({ id: number; featured: number | boolean; showToc: number | boolean } & Record<string, unknown>)[]).map((r) => {
      const { id, featured, showToc, ...rest } = r;
      return {
        ...rest,
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
      } as unknown as BlogPost;
    });
  } catch (err) {
    if (!dbDownLogged) {
      dbDownLogged = true;
      console.warn("[blog] MySQL unreadable, using bundled posts:", err instanceof Error ? err.message : err);
    }
    return null;
  }
}

/** All posts in store order (admin lists drafts too). */
export async function allPosts(): Promise<BlogPost[]> {
  return (await rowsFromDb()) ?? blogPosts;
}

export async function publishedPosts(): Promise<BlogPost[]> {
  return sortPublished(await allPosts());
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  return publishedPosts().then((posts) => posts.find((p) => p.slug === slug));
}

/** Categories: DB names first, then any file-only names, seed order kept. */
export async function blogCategories(): Promise<string[]> {
  const fallback = BLOG_CATEGORIES;
  if (BLOG_SOURCE === "file") return fallback;
  await ensureSchema();
  try {
    const [rows] = await db().query("SELECT name FROM blog_categories ORDER BY sort_order, name");
    const names = (rows as { name: string }[]).map((r) => r.name);
    const merged = [...names, ...fallback.filter((c) => !names.includes(c))];
    return merged.length ? merged : fallback;
  } catch {
    return fallback;
  }
}

export interface StoreStatus {
  /** Where the last read came from: the database or the bundled file. */
  source: "mysql" | "file";
  /** Rows in the database (0 while it is unreachable). */
  posts: number;
  /** True when credentials exist but the server/tables did not answer. */
  configured: boolean;
  error?: string;
}

/** Admin-facing diagnostics: is the dashboard really talking to MySQL? It runs
    a single live connection check before falling back, so a working DB never
    shows stale counters after edits or creates. */
export async function storeStatus(): Promise<StoreStatus> {
  if (BLOG_SOURCE === "file") {
    return { source: "file", posts: blogPosts.length, configured: dbConfigured() };
  }
  const health = await dbPing({ ping: true });
  if (!health.ok) {
    return { source: "file", posts: blogPosts.length, configured: health.configured, error: health.error };
  }
  return { source: "mysql", posts: health.posts, configured: true };
}
