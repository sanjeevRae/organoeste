#!/usr/bin/env node
/* Database helper for the blog store. One entry point, three modes:

     node scripts/db-apply.cjs           # create tables + seed (idempotent)
     node scripts/db-apply.cjs --check   # read-only: can the app reach the DB?
     node scripts/db-apply.cjs --dry     # print what it would run, no connection

   Credentials come from .env (DATABASE_URL or DB_HOST/DB_PORT/DB_USER/
   DB_PASSWORD/DB_NAME) or from flags (--host --port --user --password
   --database --url). Schema is read from scripts/db_setup.sql (so it can never
   drift from the phpMyAdmin import file) and rows are inserted with real
   placeholders, which avoids every quoting/escaping problem of raw SQL.

   Created for the cPanel push: run --check first, then the seeder, and only
   start the Node app once the check reports the tables as ready. */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function loadEnvFile() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let value = m[2].trim();
    if (value.length > 1 && /^(".*"|'.*')$/.test(value)) value = value.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

function parseArgs(argv) {
  const args = { check: false, dry: false };
  for (const raw of argv) {
    if (raw === "--check") { args.check = true; continue; }
    if (raw === "--dry") { args.dry = true; continue; }
    const m = /^--([a-z]+)=(.*)$/i.exec(raw);
    if (m) args[m[1].toLowerCase()] = m[2];
  }
  return args;
}

/** Connection settings: flags > .env > defaults. Mirrors lib/db.ts. */
function resolveConfig(args) {
  const url = args.url || process.env.DATABASE_URL?.trim();
  const cfg = { charset: "utf8mb4", connectTimeout: 10000, multipleStatements: false };
  if (url) {
    const u = new URL(url);
    Object.assign(cfg, {
      host: decodeURIComponent(u.hostname),
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: decodeURIComponent(u.pathname.replace(/^\//, "")),
    });
    if (u.searchParams.get("ssl") === "true") cfg.ssl = { rejectUnauthorized: false };
  } else {
    Object.assign(cfg, {
      host: process.env.DB_HOST?.trim() || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER?.trim() || "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME?.trim() || "organoeste",
    });
  }
  if (process.env.DB_SSL === "true") cfg.ssl = { rejectUnauthorized: false };
  for (const key of ["host", "user", "password", "database"]) {
    if (args[key] !== undefined) cfg[key] = args[key];
  }
  if (args.port !== undefined) cfg.port = Number(args.port);
  return cfg;
}

/** Reads data/blog-posts.ts by transpiling it, so the seed matches the site. */
function loadPosts() {
  const ts = require("typescript");
  const src = fs.readFileSync(path.join(ROOT, "data", "blog-posts.ts"), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function("module", "exports", js)(mod, mod.exports);
  return mod.exports;
}

/** CREATE TABLE statements straight out of the import file (single source). */
function loadSchema() {
  const file = path.join(ROOT, "scripts", "db_setup.sql");
  if (!fs.existsSync(file)) {
    throw new Error("scripts/db_setup.sql ausente — rode: node scripts/seed-mysql.cjs");
  }
  const tables = fs.readFileSync(file, "utf8").match(/CREATE TABLE IF NOT EXISTS[\s\S]*?;/g) || [];
  if (tables.length < 3) throw new Error("scripts/db_setup.sql sem as 3 tabelas esperadas.");
  return tables.map((s) => s.trim());
}

const POST_COLS = [
  "slug", "title", "excerpt", "category", "author", "author_role", "published_at",
  "updated_at", "status", "featured", "image", "image_alt", "content_html",
  "show_toc", "seo_title", "meta_description", "focus_keyword", "canonical_url", "og_image",
];
const POST_UPDS = POST_COLS.filter((c) => c !== "slug");
const OPTIONAL = new Set(["seo_title", "meta_description", "focus_keyword", "canonical_url", "og_image"]);

/** PostForm-ish row of values in POST_COLS order (nulls for empty optionals). */
function postRow(p) {
  const text = (v) => (v === undefined || v === null ? "" : String(v));
  return [
    p.slug, text(p.title), text(p.excerpt), text(p.category), text(p.author), text(p.authorRole),
    p.publishedAt, p.updatedAt || p.publishedAt, p.status === "draft" ? "draft" : "published", p.featured ? 1 : 0,
    text(p.image), text(p.imageAlt), text(p.contentHtml), p.showToc === false ? 0 : 1,
    ...[...OPTIONAL].map((c) => {
      const key = { seo_title: "seoTitle", meta_description: "metaDescription", focus_keyword: "focusKeyword", canonical_url: "canonicalUrl", og_image: "ogImage" }[c];
      const value = p[key];
      return value === undefined || value === null || value === "" ? null : String(value);
    }),
  ];
}

function postInsertSql() {
  const cols = POST_COLS.map((c) => `\`${c}\``).join(", ");
  const holders = POST_COLS.map(() => "?").join(", ");
  const upd = POST_UPDS.map((c) => `\`${c}\` = ?`).join(", ");
  return `INSERT INTO blog_posts (${cols}) VALUES (${holders}) ON DUPLICATE KEY UPDATE ${upd}`;
}


/** Turns the usual MySQL failures into the exact cPanel fix. */
function hintFor(err) {
  const map = {
    ECONNREFUSED: "MySQL não está escutando nesse host/porta. No cPanel use host 'localhost' (ou o IP que o painel mostra).",
    ETIMEDOUT: "Tempo esgotado: host/porta errados, firewall, ou Remote MySQL não liberado para o seu IP no cPanel.",
    ENOTFOUND: "Host não encontrado. Confira DB_HOST — em cPanel normalmente é 'localhost'.",
    ER_ACCESS_DENIED_ERROR: "Usuário ou senha inválidos. Em cPanel o usuário ganha o prefixo da conta (ex.: 'conta_organoeste') e a senha é a do painel MySQL Databases.",
    ER_BAD_DB_ERROR: "Esse banco não existe. Crie em cPanel > MySQL Databases (o nome também recebe o prefixo da conta).",
    ER_DBACCESS_DENIED_ERROR: "O usuário não tem acesso a esse banco: adicione o usuário ao banco no cPanel.",
    ER_TABLEACCESS_DENIED_ERROR: "Sem permissão nas tabelas: adicione o usuário ao banco com ALL PRIVILEGES.",
    ER_NO_SUCH_TABLE: "Tabelas ainda não criadas — importe scripts/db_setup.cpanel.sql no phpMyAdmin ou rode este script sem --check.",
  };
  return (err && map[err.code]) || null;
}

function fail(message, err) {
  console.error("\n\u2716 " + message);
  if (err && err.message) console.error("  " + err.message);
  const hint = hintFor(err);
  if (hint) console.error("  \u2192 " + hint);
  process.exit(1);
}

function describe(cfg) {
  return `${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}${cfg.ssl ? " (ssl)" : ""}`;
}

async function main() {
  loadEnvFile();
  const args = parseArgs(process.argv.slice(2));
  const cfg = resolveConfig(args);
  const { blogPosts, BLOG_CATEGORIES } = loadPosts();
  const schema = loadSchema();
  const insertSql = postInsertSql();
  const tagTotal = blogPosts.reduce((a, p) => a + (p.tags || []).length, 0);

  if (args.dry) {
    console.log(`destino   : ${describe(cfg)}`);
    console.log(`schema    : ${schema.length} CREATE TABLE`);
    console.log(`seed      : ${blogPosts.length} posts, ${BLOG_CATEGORIES.length} categorias, ${tagTotal} tags`);
    console.log(`\n${insertSql}\n? x ${POST_COLS.length + POST_UPDS.length} por post\n`);
    console.log("(--dry: nada foi executado)");
    return;
  }

  const mysql = require("mysql2/promise");
  let conn;
  try {
    conn = await mysql.createConnection(cfg);
  } catch (err) {
    fail(`Não foi possível conectar em ${describe(cfg)}`, err);
  }

  try {
    const [info] = await conn.query("SELECT VERSION() AS version, DATABASE() AS db");
    console.log(`conectado : ${info[0].version} — banco ${info[0].db}`);

    const [tableRows] = await conn.query("SHOW TABLES");
    const tables = tableRows.map((r) => Object.values(r)[0]);
    const needed = ["blog_categories", "blog_posts", "blog_tags"];
    const missing = needed.filter((t) => !tables.includes(t));

    if (args.check) {
      console.log(`tabelas   : ${tables.length ? tables.join(", ") : "(nenhuma)"}`);
      if (missing.length) {
        fail(`Faltam tabelas: ${missing.join(", ")}`, { code: "ER_NO_SUCH_TABLE" });
      }
      const [rows] = await conn.query("SELECT COUNT(*) AS n FROM blog_posts");
      const [cats] = await conn.query("SELECT COUNT(*) AS n FROM blog_categories");
      const [tags] = await conn.query("SELECT COUNT(*) AS n FROM blog_tags");
      console.log(`conteúdo  : ${Number(rows[0].n)} posts, ${Number(cats[0].n)} categorias, ${Number(tags[0].n)} tags`);
      console.log("\n\u2714 Banco pronto para o app.");
      return;
    }

    for (const sql of schema) await conn.query(sql);
    console.log(`schema    : ${schema.length} tabelas verificadas`);

    await conn.beginTransaction();
    try {
      for (const [i, name] of BLOG_CATEGORIES.entries()) {
        await conn.execute(
          "INSERT INTO blog_categories (name, sort_order) VALUES (?, ?) ON DUPLICATE KEY UPDATE sort_order = ?",
          [name, i, i],
        );
      }
      for (const post of blogPosts) {
        const values = postRow(post);
        await conn.execute(insertSql, [...values, ...POST_UPDS.map((c) => values[POST_COLS.indexOf(c)])]);
        const [found] = await conn.execute("SELECT id FROM blog_posts WHERE slug = ?", [post.slug]);
        const id = found[0].id;
        await conn.execute("DELETE FROM blog_tags WHERE post_id = ?", [id]);
        for (const [i, tag] of (post.tags || []).entries()) {
          await conn.execute(
            "INSERT INTO blog_tags (post_id, tag, sort_order) VALUES (?, ?, ?)",
            [id, tag, i],
          );
        }
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback().catch(() => {});
      throw err;
    }

    const [counts] = await conn.query("SELECT COUNT(*) AS n FROM blog_posts");
    const [tagCount] = await conn.query("SELECT COUNT(*) AS n FROM blog_tags");
    console.log(`seed      : ${Number(counts[0].n)} posts, ${BLOG_CATEGORIES.length} categorias, ${Number(tagCount[0].n)} tags`);
    console.log("\n\u2714 Banco atualizado. Rode com --check para conferir, ou abra /admin.");
  } catch (err) {
    fail("Falha ao preparar o banco", err);
  } finally {
    await conn.end().catch(() => {});
  }
}

main().catch((err) => fail("Erro inesperado", err));
