import { SITE_URL } from "@/lib/blog";
import { publishedPosts } from "@/lib/posts";

export const revalidate = 3600;

export default async function sitemap() {
  const base = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/solucoes`, lastModified: new Date() },
    { url: `${SITE_URL}/blog`, lastModified: new Date() },
  ];
  // A DB failure must not fail the sitemap build: list the base pages only.
  let posts: { url: string; lastModified: Date }[] = [];
  try {
    posts = (await publishedPosts()).map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    }));
  } catch {
    posts = [];
  }
  return [...base, ...posts];
}
