// SERVER ONLY — reads the live blog store. MySQL first, then the bundled
// data/blog-posts.ts fallback, so pages keep building with no DATABASE_URL.
// Never import this (or mysql2) from a client component.
import { blogPosts, BLOG_CATEGORIES, type BlogPost } from "@/data/blog-posts";
import { db } from "./db";
import { sortPublished } from "./blog";

export const BLOG_SOURCE: "mysql" | "file" = process.env.BLOG_SOURCE === "file" ? "file" : "mysql";

let dbDownLogged = false;

async function rowsFromDb(): Promise<BlogPost[] | null> {
  if (BLOG_SOURCE === "file") return null;
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
  try {
    const [rows] = await db().query("SELECT name FROM blog_categories ORDER BY sort_order, name");
    const names = (rows as { name: string }[]).map((r) => r.name);
    const merged = [...names, ...fallback.filter((c) => !names.includes(c))];
    return merged.length ? merged : fallback;
  } catch {
    return fallback;
  }
}
