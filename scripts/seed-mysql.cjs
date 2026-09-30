/* Generates scripts/db_setup.sql from the live data/blog-posts.ts content
   (run: node scripts/seed-mysql.cjs). Transpiles the TS store so the seed
   always matches the real posts instead of a hand copy. */
const fs = require("fs");
const ts = require("typescript");

const src = fs.readFileSync("data/blog-posts.ts", "utf8");
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleObj = { exports: {} };
new Function("module", "exports", js)(moduleObj, moduleObj.exports);
const { BLOG_CATEGORIES, blogPosts } = moduleObj.exports;

const esc = (v) => "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
const nul = (v) => (v === undefined || v === null || v === "" ? "NULL" : esc(v));
const bit = (v) => (v ? 1 : 0);

const L = [];
L.push("-- Organoeste blog store: schema + seed.");
L.push("-- Run against a running MySQL 5.7+ server (utf8mb4, InnoDB FULLTEXT):");
L.push("--   mysql -u root -p < scripts/db_setup.sql");
L.push("-- Safe to re-run: tables are created IF NOT EXISTS and seed rows use");
L.push("-- ON DUPLICATE KEY UPDATE, so re-running only refreshes the content.", "");
L.push("CREATE DATABASE IF NOT EXISTS organoeste CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
L.push("USE organoeste;", "");

L.push(`CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`, "");

L.push(`CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(160) NOT NULL DEFAULT 'Equipe Organoeste',
  author_role VARCHAR(160) NOT NULL DEFAULT '',
  published_at DATE NOT NULL,
  updated_at DATE NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  image VARCHAR(255) NOT NULL,
  image_alt VARCHAR(255) NOT NULL DEFAULT '',
  content_html MEDIUMTEXT NOT NULL,
  show_toc TINYINT(1) NOT NULL DEFAULT 1,
  seo_title VARCHAR(255) NULL,
  meta_description VARCHAR(320) NULL,
  focus_keyword VARCHAR(160) NULL,
  canonical_url VARCHAR(255) NULL,
  og_image VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_published (status, published_at),
  INDEX idx_category (category),
  FULLTEXT INDEX ft_content (title, excerpt, content_html)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`, "");

L.push(`CREATE TABLE IF NOT EXISTS blog_tags (
  post_id INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_blog_tags_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`, "");

L.push("-- categories --");
BLOG_CATEGORIES.forEach((c, i) => {
  L.push(`INSERT INTO blog_categories (name, sort_order) VALUES (${esc(c)}, ${i}) ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);`);
});
L.push("", "-- posts --");
for (const p of blogPosts) {
  const cols = ["slug", "title", "excerpt", "category", "author", "author_role", "published_at", "updated_at", "status", "featured", "image", "image_alt", "content_html", "show_toc", "seo_title", "meta_description", "focus_keyword", "canonical_url", "og_image"];
  const vals = [
    esc(p.slug), esc(p.title), esc(p.excerpt), esc(p.category), esc(p.author), esc(p.authorRole || ""),
    esc(p.publishedAt), esc(p.updatedAt), esc(p.status), bit(p.featured), esc(p.image), esc(p.imageAlt || ""),
    esc(p.contentHtml), bit(p.showToc !== false), nul(p.seoTitle), nul(p.metaDescription), nul(p.focusKeyword), nul(p.canonicalUrl), nul(p.ogImage),
  ];
  const upd = cols.filter((c) => c !== "slug").map((c) => `${c} = VALUES(${c})`).join(", ");
  L.push(`INSERT INTO blog_posts (${cols.join(", ")}) VALUES (${vals.join(", ")}) ON DUPLICATE KEY UPDATE ${upd};`);
}
L.push("", "-- tags (rebuilt per post) --");
for (const p of blogPosts) {
  const id = `(SELECT id FROM blog_posts WHERE slug = ${esc(p.slug)})`;
  L.push(`DELETE FROM blog_tags WHERE post_id = ${id};`);
  (p.tags || []).forEach((t, i) => {
    L.push(`INSERT INTO blog_tags (post_id, tag, sort_order) VALUES (${id}, ${esc(t)}, ${i});`);
  });
}
L.push("");

fs.mkdirSync("scripts", { recursive: true });
fs.writeFileSync("scripts/db_setup.sql", L.join("\n"));
console.log(`wrote scripts/db_setup.sql (${blogPosts.length} posts, ${BLOG_CATEGORIES.length} categories, ${blogPosts.reduce((a, p) => a + (p.tags || []).length, 0)} tags)`);
