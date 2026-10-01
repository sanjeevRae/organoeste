import { SITE_URL } from "@/lib/blog";
import { publishedPosts } from "@/lib/posts";

export const revalidate = 3600;

export default async function sitemap() {
  const base = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/solucoes`, lastModified: new Date() },
    { url: `${SITE_URL}/blog`, lastModified: new Date() },
  ];
  const posts = (await publishedPosts()).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
  }));
  return [...base, ...posts];
}
