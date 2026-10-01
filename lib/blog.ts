import { type BlogPost } from "@/data/blog-posts";

export const SITE_URL = "https://www.organoeste.com.br";


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
