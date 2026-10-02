const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
function loadEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    // Allow a missing closing quote (hand-edited cPanel passwords often lose it);
    // otherwise the port/user silently fall back to 3306/root and the probe
    // fails with ECONNREFUSED while db:check (same parser) connects fine.
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\r\n]*)"?\s*$/.exec(line);
    if (!m) continue;
    const v = (m[2] || "").trim();
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadEnv();
function cfg() {
  const url = (process.env.DATABASE_URL || "").trim();
  if (url) {
    const u = new URL(url);
    return { host: decodeURIComponent(u.hostname), port: Number(u.port || 3306), user: decodeURIComponent(u.username), password: decodeURIComponent(u.password), database: decodeURIComponent(u.pathname.replace(/^\//, "")) };
  }
  return { host: (process.env.DB_HOST || "127.0.0.1").trim(), port: Number((process.env.DB_PORT || "3306").trim() || 3306), user: (process.env.DB_USER || "").trim(), password: process.env.DB_PASSWORD, database: (process.env.DB_NAME || "").trim() };
}
(async () => {
  const c = await mysql.createConnection({ ...cfg(), connectTimeout: 10000 });
  const stamp = Date.now().toString(36);
  const slug = "doctor-probe-" + stamp;
  console.log("STEP create: slug=" + slug);
  const row = { slug, title: "Probe " + stamp, excerpt: "probe excerpt", category: "Compostagem", author: "Equipe Organoeste", author_role: "", published_at: "2026-10-02", updated_at: "2026-10-02", status: "draft", featured: 0, image: "/media/probe.png", image_alt: "probe", content_html: "<p>probe body</p>", show_toc: 1, seo_title: null, meta_description: null, focus_keyword: null, canonical_url: null, og_image: null };
  const [created] = await c.query("INSERT INTO blog_posts SET ?", [row]);
  console.log("insertId=" + created.insertId);
  await c.query("INSERT INTO blog_tags (post_id, tag, sort_order) VALUES (?, ?, ?), (?, ?, ?)", [created.insertId, "probe", 0, created.insertId, "qa", 1]);
  const [got] = await c.query("SELECT id, slug, title, status FROM blog_posts WHERE id = ?", [created.insertId]);
  console.log("created row: " + JSON.stringify(got));
  const [tags] = await c.query("SELECT tag FROM blog_tags WHERE post_id = ? ORDER BY sort_order", [created.insertId]);
  console.log("created tags: " + JSON.stringify(tags));
  console.log("STEP update: change title of id=" + created.insertId);
  await c.query("UPDATE blog_posts SET ? WHERE id = ?", [{ title: "Probe UPDATED " + stamp }, created.insertId]);
  const [upd] = await c.query("SELECT id, slug, title, status FROM blog_posts WHERE id = ?", [created.insertId]);
  console.log("updated row: " + JSON.stringify(upd));
  console.log("STEP cleanup: delete probe");
  await c.query("DELETE FROM blog_tags WHERE post_id = ?", [created.insertId]);
  await c.query("DELETE FROM blog_posts WHERE id = ?", [created.insertId]);
  const [left] = await c.query("SELECT COUNT(*) AS n FROM blog_posts WHERE slug = ?", [slug]);
  console.log("leftover with probe slug: " + left[0].n);
  const [counts] = await c.query("SELECT (SELECT COUNT(*) FROM blog_posts) AS posts, (SELECT COUNT(*) FROM blog_tags) AS tags");
  console.log("final counts: " + JSON.stringify(counts[0]));
  await c.end();
  console.log("WRITE PATH OK");
})().catch((e) => { console.error("WRITE PATH FAIL: " + (e && e.message)); process.exit(1); });
