import { type BlogPost } from "@/data/blog-posts";

/** Absolute site origin used by canonical URLs, JSON-LD and the sitemap.
    Configure per environment with NEXT_PUBLIC_SITE_URL (or SITE_URL) instead of
    relying on the fallback below (kept so the site works with no .env at all). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://www.organoeste.com.br"
).replace(/\/+$/, "");


export function sortPublished(posts: BlogPost[]): BlogPost[] {
  return [...posts]
    .filter((p) => p.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function wordCount(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

export function readingTime(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / 200));
}

/** Estimated spoken length as mm:ss (~150 wpm), shown next to "Ouvir artigo". */
export function speakingTime(html: string): string {
  const seconds = Math.round((wordCount(html) / 150) * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function tocFromHtml(html: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[3].replace(/<[^>]*>/g, "").trim();
    if (m[2] && text) items.push({ id: m[2], text, level: Number(m[1]) });
  }
  return items;
}

/** True for "https://…", "data:…", "mailto:…" — anything already absolute. */
function hasScheme(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

/** Folders that live directly under public/ — a bare "images/x.png" belongs there. */
const PUBLIC_DIRS = /^(?:images|uploads|media|icons|fonts)\//i;

/** Turns a relative value into a root-relative one. Unknown names are assumed to
    be panel uploads (that is where the editor puts its files). */
function rootRelative(value: string, fallback: "/uploads" | "/"): string {
  const bare = value.replace(/^(?:\.\/)+/, "").replace(/^\/+/, "");
  if (!bare) return "";
  if (PUBLIC_DIRS.test(bare)) return `/${bare}`;
  return fallback === "/" ? `/${bare}` : `/uploads/${bare}`;
}

/** Cover/OG image path that always starts at the site root.
    Rows edited straight in phpMyAdmin (or written by older versions) sometimes
    lose the leading slash; without it the browser resolves the image against
    the current page and the file 404s with only its name in the console. */
export function mediaSrc(value: string | null | undefined): string {
  const src = (value ?? "").trim();
  if (!src) return "";
  if (src.startsWith("/") || hasScheme(src)) return src; // /media/…, /images/…, https://…
  return rootRelative(src, "/uploads");
}

/** Same repair for src/href inside the stored HTML (src="foto.png").
    <img> points at a file (/uploads by default), <a> at a page (/ by default). */
export function absoluteAttrs(html: string): string {
  if (!html) return html;
  return html.replace(
    /(\s(?:src|href)\s*=\s*)("([^"]*)"|'([^']*)')/gi,
    (full, prefix: string, quoted: string, dbl: string | undefined, single: string | undefined) => {
      const value = (dbl ?? single ?? "").trim();
      if (!value || value.startsWith("/") || value.startsWith("#") || hasScheme(value)) return full;
      const fixed = rootRelative(value, /\bsrc\b/i.test(prefix) ? "/uploads" : "/");
      if (!fixed) return full;
      const quote = quoted.startsWith("'") ? "'" : '"';
      return `${prefix}${quote}${fixed}${quote}`;
    },
  );
}
