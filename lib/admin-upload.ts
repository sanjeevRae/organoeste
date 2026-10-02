
import { storeUpload } from "./media-store";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

export function uploadErrorFor(file: File): string | null {
  if (!file || file.size <= 0) return "Empty file.";
  if (file.size > MAX_BYTES) return "Image too large (5 MB maximum).";
  const ext = ALLOWED_EXT[file.type];
  if (!ext) return "Unsupported format. Use JPG, PNG, WebP, GIF or SVG.";
  return null;
}

export interface SavedUpload {
  /** Public URL the post must store, e.g. /media/1700000000000-ab12cd-capa.png */
  url: string;
  /** True when the bytes also reached the media_files table. */
  inDb: boolean;
  /** Where the file was written on the server (shown in the dashboard when the
      image is saved but the site cannot open it). */
  file: string;
}

/** Saves an uploaded image and returns its URL plus the file that was written. */
export async function saveUpload(file: File): Promise<SavedUpload> {
  const bad = uploadErrorFor(file);
  if (bad) throw new Error(bad);
  const ext = ALLOWED_EXT[file.type];
  const base =
    (file.name || "image")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  // Disk + DB together: /media serves from disk when the file is there and
  // from the media_files table when the host keeps dropping uploaded files
  // (the dashboard notice names the winner via stored.inDb).
  const stored = await storeUpload(name, file.type, bytes);
  return { url: `/media/${name}`, file: stored.diskFile ?? `(database${stored.inDb ? "" : " — write pending"})`, inDb: stored.inDb };
}

// ---------- sanitizer allowlists ----------

const ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "h4", "blockquote", "ul", "ol", "li",
  "strong", "b", "em", "i", "u", "s", "del", "sup", "sub", "mark",
  "a", "img", "br", "hr", "span", "code", "pre",
  "table", "thead", "tbody", "tr", "td", "th",
  "figure", "figcaption", "iframe",
]);

/** Block-level tags that may carry alignment / sizing styles. */
const BLOCK_TAGS = new Set([
  "p", "h2", "h3", "h4", "blockquote", "li", "ul", "ol",
  "pre", "td", "th", "tr", "table", "figure", "figcaption",
]);

/** Inline tags that may carry safe text styles. */
const STYLED_INLINE_TAGS = new Set([
  "span", "a", "strong", "b", "em", "i", "u", "s", "del", "sup", "sub", "code", "mark",
]);

const VOID_TAGS = new Set(["img", "br", "hr"]);
const COLOR_RE = /^(?:#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*(?:,\s*\d{1,3}\s*){2}(?:,\s*(?:0|1|0?\.\d+)\s*)?\)|hsla?\([0-9.,%\s]+\)|[a-z]{3,20})$/i;
const LENGTH_RE = /^(?:auto|fit-content|\d+(?:\.\d+)?(?:px|em|rem|%|ch))$/i;
const MARGIN_SIDE_RE = /^(?:auto|0|-?\d+(?:\.\d+)?(?:px|em|rem|%))$/i;
const FONT_FAMILY_RE = /^[a-z0-9][a-z0-9 '",\-_]*$/i;
const FONT_SIZE_RE = /^(?:xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i;
const LINE_HEIGHT_RE = /^(?:normal|\d+(?:\.\d+)?|\d+(?:\.\d+)?(?:px|em|rem|%))$/i;
const BORDER_RE = /^\d+(?:\.\d+)?px\s+(?:solid|dashed|dotted|none)\s+(?:#[0-9a-f]{3,8}|[a-z]{3,20})$/i;

/** Inline declarations the editor may save; everything else is dropped. */
const STYLE_ALLOW: Record<string, RegExp> = {
  "text-align": /^(?:left|right|center|justify)$/i,
  "font-family": FONT_FAMILY_RE,
  "font-size": FONT_SIZE_RE,
  "font-weight": /^(?:bold|normal|[1-9]00)$/i,
  "font-style": /^(?:normal|italic)$/i,
  "text-decoration": /^(?:underline|line-through|none)$/i,
  "text-transform": /^(?:none|uppercase|lowercase|capitalize)$/i,
  "letter-spacing": /^-?\d+(?:\.\d+)?(?:px|em|rem)$/i,
  color: COLOR_RE,
  "background-color": COLOR_RE,
  width: LENGTH_RE,
  "max-width": LENGTH_RE,
  "min-width": LENGTH_RE,
  height: LENGTH_RE,
  float: /^(?:left|right|none)$/i,
  "vertical-align": /^(?:baseline|top|middle|bottom|text-top|text-bottom|super|sub)$/i,
  "line-height": LINE_HEIGHT_RE,
  "aspect-ratio": /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/i,
  "object-fit": /^(?:fill|contain|cover|none|scale-down)$/i,
  "border-collapse": /^collapse$/i,
  "border-radius": /^(?:\d+(?:\.\d+)?(?:px|%|rem)|\d+px\s+\d+px(?:\s+\d+px)?)$/i,
  border: BORDER_RE,
};

/** Keeps only allowlisted CSS declarations with safe values. */
function cleanStyle(raw: string | undefined): string {
  if (!raw) return "";
  const kept: string[] = [];
  for (const part of raw.split(";")) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (!prop || !value || value.length > 120) continue;
    if (/url\(|expression|javascript:|behavio|binding|\/\*|\*\//i.test(value)) continue;
    if (prop === "margin") {
      const bits = value.split(/\s+/).filter(Boolean);
      if (bits.length >= 1 && bits.length <= 4 && bits.every((bit) => MARGIN_SIDE_RE.test(bit))) {
        kept.push("margin:" + bits.join(" "));
      }
      continue;
    }
    if (/^margin-(?:left|right|top|bottom)$/.test(prop)) {
      if (MARGIN_SIDE_RE.test(value)) kept.push(prop + ":" + value);
      continue;
    }
    if (/^padding-(?:left|right)$/.test(prop)) {
      if (/^\d+(?:\.\d+)?(?:px|em|%|rem)$/.test(value)) kept.push(prop + ":" + value);
      continue;
    }
    const rule = STYLE_ALLOW[prop];
    if (rule && rule.test(value)) kept.push(prop + ":" + value);
  }
  return kept.join(";");
}
/** HTML-escapes an attribute value. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unquote(value: string | undefined): string {
  return (value ?? "").replace(/^['"]|['"]$/g, "").trim();
}

/** Reads a quoted attribute value out of the raw attribute string. */
function quotedAttr(rawAttrs: string, name: string): string | undefined {
  const m = new RegExp("(?:^|\\s)" + name + "\\s*=\\s*(\"[^\"]*\"|'[^']*')", "i").exec(rawAttrs);
  return m?.[1];
}

/** Reads a small positive integer attribute (colspan, rowspan, width...). */
function numericAttr(rawAttrs: string, name: string, max: number): number | null {
  const m = new RegExp("(?:^|\\s)" + name + "\\s*=\\s*(\"[^\"]*\"|'[^']*'|[^\\s>]+)", "i").exec(rawAttrs);
  if (!m) return null;
  const value = unquote(m[1]);
  if (!/^\d{1,4}$/.test(value)) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > max) return null;
  return n;
}

/** Allows internal paths, anchors and http(s)/mailto/tel links only. */
function safeHref(raw: string | undefined): string | null {
  const href = unquote(raw);
  if (!href || href.length > 2048 || /[\s<>]/.test(href)) return null;
  if (/^(?:javascript|data|vbscript|file):/i.test(href)) return null;
  if (/^(?:#|\/(?!\/)|mailto:|tel:|https?:\/\/)/i.test(href)) return href;
  return null;
}

/** Allows local paths (/images, /uploads, /media) and absolute http(s) images only. */
function safeSrc(raw: string | undefined): string | null {
  const src = unquote(raw);
  if (!src || src.length > 2048 || /[\s<>]/.test(src)) return null;
  if (/^(?:javascript|data|vbscript|file):/i.test(src)) return null;
  if (/^(?:\/(?!\/)|https?:\/\/)/i.test(src)) return src;
  return null;
}

/** Rebuilds a YouTube embed URL from any YouTube link (watch, youtu.be, embed). */
function safeEmbedSrc(raw: string | undefined): string | null {
  const url = unquote(raw);
  if (!url || url.length > 2048) return null;
  if (!/^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(url)) return null;
  const id = /(?:youtu\.be\/|\/embed\/|[?&]v=)([A-Za-z0-9_-]{6,})/.exec(url)?.[1];
  if (!id) return null;
  const start = /[?&](?:t|start)=(\d{1,6})/.exec(url)?.[1];
  return "https://www.youtube-nocookie.com/embed/" + id + (start ? "?start=" + start : "");
}
/**
 * Sanitizes editor HTML before it is stored or rendered.
 * Allowlist of tags/attributes, safe style declarations, safe URLs, and
 * YouTube iframes rewritten to a responsive <figure class="blg-video">.
 */
export function sanitizeContentHtml(html: string): string {
  let out = String(html ?? "");

  // Legacy formatting tags produced by older browsers/editors.
  out = out.replace(/<font\b([^>]*)>/gi, "<span$1>");
  out = out.replace(/<\/font\s*>/gi, "</span>");
  out = out.replace(/<strike\b([^>]*)>/gi, "<s$1>");
  out = out.replace(/<\/strike\s*>/gi, "</s>");

  // Comments and dangerous/unsupported elements (with their content).
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(
    /<(script|style|object|embed|form|input|button|select|textarea|video|audio|source|track|html|head|body|meta|link|title)[^>]*>[\s\S]*?<\/\1\s*>/gi,
    "",
  );
  out = out.replace(
    /<\/?(script|style|object|embed|form|input|button|select|textarea|video|audio|source|track|html|head|body|meta|link|title)[^>]*>/gi,
    "",
  );

  // Event handlers and javascript: URLs.
  out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');

  let videoOpen = false;
  let figureSkipped = false;

  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    const closingTag = full.startsWith("</");

    if (!ALLOWED_TAGS.has(tag)) {
      if (tag === "iframe") videoOpen = false;
      return "";
    }

    if (tag === "iframe") {
      if (closingTag) {
        if (!videoOpen) return "";
        videoOpen = false;
        return "</figure>";
      }
      const embed = safeEmbedSrc(quotedAttr(rawAttrs, "src"));
      if (!embed) return "";
      videoOpen = true;
      return (
        '<figure class="blg-video"><iframe src="' + esc(embed) + '" title="Embedded video"' +
        ' loading="lazy" allowfullscreen></iframe>'
      );
    }

    if (closingTag) {
      if (tag === "figure" && figureSkipped) {
        figureSkipped = false;
        return "";
      }
      return "</" + tag + ">";
    }

    let attrs = "";

    if (tag === "a") {
      const href = safeHref(quotedAttr(rawAttrs, "href"));
      if (href) attrs += ' href="' + esc(href) + '"';
      attrs += ' rel="noopener"';
      if (/(?:^|\s)target\s*=\s*("|')_blank\1/i.test(rawAttrs)) attrs += ' target="_blank"';
    } else if (tag === "img") {
      const src = safeSrc(quotedAttr(rawAttrs, "src"));
      if (!src) return "";
      attrs += ' src="' + esc(src) + '"';
      attrs += ' alt="' + esc(unquote(quotedAttr(rawAttrs, "alt")).slice(0, 200)) + '"';
      const w = numericAttr(rawAttrs, "width", 2400);
      if (w) attrs += ' width="' + w + '"';
      const h = numericAttr(rawAttrs, "height", 2400);
      if (h) attrs += ' height="' + h + '"';
      attrs += ' loading="lazy" decoding="async"';
    } else if (tag === "td" || tag === "th") {
      const colspan = numericAttr(rawAttrs, "colspan", 12);
      if (colspan && colspan > 1) attrs += ' colspan="' + colspan + '"';
      const rowspan = numericAttr(rawAttrs, "rowspan", 30);
      if (rowspan && rowspan > 1) attrs += ' rowspan="' + rowspan + '"';
      if (tag === "th") {
        const scope = unquote(quotedAttr(rawAttrs, "scope")).toLowerCase();
        if (scope === "row" || scope === "col") attrs += ' scope="' + scope + '"';
      }
    } else if (tag === "figure") {
      const cls = unquote(quotedAttr(rawAttrs, "class"));
      if (cls === "blg-video") {
        // Emitted by the iframe handler so the wrapper is never doubled.
        figureSkipped = true;
        return "";
      }
      if (/^[a-z0-9][a-z0-9 _-]{0,48}$/i.test(cls)) attrs += ' class="' + esc(cls) + '"';
    }

    const styled = tag === "img" || BLOCK_TAGS.has(tag) || STYLED_INLINE_TAGS.has(tag);
    if (styled) {
      const style = cleanStyle(unquote(quotedAttr(rawAttrs, "style")));
      if (style) attrs += ' style="' + esc(style) + '"';
    }

    if (VOID_TAGS.has(tag)) return "<" + tag + attrs + " />";
    return "<" + tag + attrs + ">";
  });

  // Word-style editors often leave an empty <p><br></p> as content.
  const text = out.replace(/<[^>]+>/g, "").replace(/&nbsp;|\s/g, "");
  if (!text && !/<img[\s>]|<iframe[\s>]/i.test(out)) return "";
  return out.trim();
}
