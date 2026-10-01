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
/** Database name for the full setup file (override with DB_NAME=...). */
const DBNAME = (process.env.DB_NAME || "organoeste").replace(/[^a-zA-Z0-9_]/g, "");

/* The DDL is not repeated here: lib/schema.ts is the single source of truth
   (the app also applies it at runtime through ensureSchema). */
const SCHEMA_SRC = fs.readFileSync("lib/schema.ts", "utf8");
const SCHEMA = [...SCHEMA_SRC.matchAll(/`(CREATE TABLE IF NOT EXISTS[\s\S]*?);`/g)].map((m) => m[1] + ";");
if (SCHEMA.length !== 4) {
  throw new Error(`lib/schema.ts: esperava 4 CREATE TABLE, encontrei ${SCHEMA.length}`);
}

const L = [];

for (const statement of SCHEMA) L.push(statement, "");

L.push("-- categories --");
BLOG_CATEGORIES.forEach((c, i) => {
  // Repeat the literal here too, so no VALUES() survives in the upsert.
  L.push(`INSERT INTO blog_categories (name, sort_order) VALUES (${esc(c)}, ${i}) ON DUPLICATE KEY UPDATE sort_order = ${i};`);
});
L.push("", "-- posts --");
for (const p of blogPosts) {
  const cols = ["slug", "title", "excerpt", "category", "author", "author_role", "published_at", "updated_at", "status", "featured", "image", "image_alt", "content_html", "show_toc", "seo_title", "meta_description", "focus_keyword", "canonical_url", "og_image"];
  const vals = [
    esc(p.slug), esc(p.title), esc(p.excerpt), esc(p.category), esc(p.author), esc(p.authorRole || ""),
    esc(p.publishedAt), esc(p.updatedAt), esc(p.status), bit(p.featured), esc(p.image), esc(p.imageAlt || ""),
    esc(p.contentHtml), bit(p.showToc !== false), nul(p.seoTitle), nul(p.metaDescription), nul(p.focusKeyword), nul(p.canonicalUrl), nul(p.ogImage),
  ];
  // Repeat the literals instead of VALUES(col): identical behaviour on MySQL
  // 5.7, MySQL 8.x and MariaDB (VALUES() in ON DUPLICATE KEY UPDATE is
  // deprecated in MySQL 8.0.20+ and cPanel hosts run either engine).
  const upd = cols
    .map((c, i) => (c === "slug" ? null : `${c} = ${vals[i]}`))
    .filter(Boolean)
    .join(", ");
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

const RE_RUN = "Safe to re-run: tables are created IF NOT EXISTS and seed rows use";
const RE_UPD = "ON DUPLICATE KEY UPDATE, so re-running only refreshes the content.";

const full = [
  "-- Organoeste blog store: schema + seed (local dev / server with root access).",
  "-- Run against MySQL 5.7+, MariaDB 10.4+ (utf8mb4, InnoDB FULLTEXT):",
  "--   mysql -u root -p < scripts/db_setup.sql",
  `-- ${RE_RUN}`,
  `-- ${RE_UPD}`,
  "",
  `CREATE DATABASE IF NOT EXISTS \`${DBNAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  `USE \`${DBNAME}\`;`,
  "",
  ...L,
  "",
];

const cpanel = [
  "-- Organoeste blog store: tables + seed for cPanel (phpMyAdmin import).",
  "-- 1. cPanel > MySQL Databases: create the database AND a user, then add the",
  "--    user to the database with ALL PRIVILEGES. cPanel users have no",
  "--    CREATE DATABASE right, so this file deliberately has no CREATE DATABASE",
  "--    and no USE statement.",
  "-- 2. phpMyAdmin: select that database in the left sidebar, open the Import",
  "--    tab, choose this file and press Go.",
  `-- ${RE_RUN}`,
  `-- ${RE_UPD}`,
  "",
  ...L,
  "",
];

fs.mkdirSync("scripts", { recursive: true });
fs.writeFileSync("scripts/db_setup.sql", full.join("\n"));
fs.writeFileSync("scripts/db_setup.cpanel.sql", cpanel.join("\n"));
const tagCount = blogPosts.reduce((a, p) => a + (p.tags || []).length, 0);
console.log(
  `wrote scripts/db_setup.sql + scripts/db_setup.cpanel.sql ` +
  `(${blogPosts.length} posts, ${BLOG_CATEGORIES.length} categories, ${tagCount} tags)`,
);
